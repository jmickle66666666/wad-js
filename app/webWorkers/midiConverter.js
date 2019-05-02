import {
    MIDI_HEADER_DATA,
    MUS_HEADER_SIGNATURE,
    MUS_NUM_CHANNELS,
    MUS_PERCUSSION_CHANNEL,
    MIDI_PERCUSSION_CHANNEL,
    MIDI_TRACKLENGTH_OFS,
    MIDI_CONTROLLER_MAP,
    MUS_RELEASE_KEY,
    MUS_PRESS_KEY,
    MUS_PITCH_WHEEL,
    MUS_SYSTEM_EVENT,
    MUS_CHANGE_CONTROLLER,
    MUS_SCORE_END,
    MIDI_RELEASE_KEY,
    MIDI_PRESS_KEY,
    MIDI_CHANGE_CONTROLLER,
    MIDI_CHANGE_PATCH,
    MIDI_PITCH_WHEEL,
} from '../lib/constants';

import {
    getCacheItemAsArrayBuffer,
    setCacheItemAsBlob,
} from '../lib/cacheManager';

function readMusHeader(dataView) {
    const id = [];

    for (let i = 0; i < 4; i++) {
        id.push(dataView.getUint8(i));
    }

    const musHeader = {
        // used to check that this is a valid MUS file
        id: id.join(' '),
        scoreLength: dataView.getUint16(4, true),
        // only this value is truly helpful to parse the MUS
        scoreStart: dataView.getUint16(6, true),
        primaryChannels: dataView.getUint16(8, true),
        secondaryChannels: dataView.getUint16(10, true),
        instrumentCount: dataView.getUint16(12, true),
    };

    return musHeader;
}

function isValidMusHeader(id) {
    return MUS_HEADER_SIGNATURE === id;
}

// TODO: Send the error string in postMessage

onmessage = async (message) => {
    try {
        const {
            wadId,
            lump,
        } = message.data;

        const {
            name,
            type,
            data,
            originalFormat,
        } = lump;

        const requestURL = `/midis/${wadId}/${name}`;

        if (originalFormat === 'MIDI') {
            setCacheItemAsBlob({ cacheId: wadId, requestURL, responseData: data });

            postMessage({
                wadId,
                lumpId: name,
                lumpType: type,
                output: requestURL,
            });

            return;
        }

        const cachedItem = await getCacheItemAsArrayBuffer({ cacheId: wadId, requestURL });

        if (cachedItem) {
            postMessage({
                wadId,
                lumpId: name,
                lumpType: type,
                output: requestURL,
            });

            return;
        }

        // console.log(`Converting '${type}/${name}' from MUS to MIDI (WAD: '${wadId}') ...`);

        let musDataView;
        let musDataPosition;

        // Cached channel velocities
        const channelvelocities = [
            127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127, 127,
        ];

        // Timestamps between sequences of MUS events
        let queuedtime = 0;

        // Counter for the length of the track
        let tracksize;

        const channelMap = [];

        // Main DataView for writing to. This is used by writeData();
        let outputDataView;

        // Wrapper function to work like slade's memchunk.write()
        // I'm so lazy
        let position = 0;
        let dataToWrite = [];
        function writeData(bytes) {
            dataToWrite = dataToWrite.concat(bytes);
        }

        function confirmWrite() {
            const newBuffer = new ArrayBuffer(dataToWrite.length);
            outputDataView = new DataView(newBuffer);
            // Then write the data
            for (let i = 0; i < dataToWrite.length; i++) {
                outputDataView.setUint8(position, dataToWrite[i]);
                position += 1;
            }
        }

        // Write timestamp to a MIDI file.
        function writeTime(time) {
            let buffer = time & 0x7F;
            let writeval;

            while ((time >>= 7) != 0) {
                buffer <<= 8;
                buffer |= ((time & 0x7F) | 0x80);
            }

            for (; ;) {
                writeval = (buffer & 0xFF);

                writeData([writeval]);

                tracksize += 1;

                if ((buffer & 0x80) != 0) { buffer >>= 8; } else {
                    queuedtime = 0;
                    return;
                }
            }
        }

        // Write the end of track marker
        function writeEndTrack() {
            const endtrack = [0xFF, 0x2F, 0x00];

            writeTime(queuedtime);

            writeData(endtrack);

            tracksize += 3;
        }

        // Write a key press event
        function writePressKey(channel, key, velocity) {
            // Write queued time
            writeTime(queuedtime);

            // Write pressed key and channel
            let working = MIDI_PRESS_KEY | channel;
            writeData([working]);

            // Write key
            working = key & 0x7F;
            writeData([working]);

            // Wite velocity
            working = velocity & 0x7F;
            writeData([working]);

            tracksize += 3;
        }

        // Write a key release event
        function writeReleaseKey(channel, key) {
            // Write queued time
            writeTime(queuedtime);

            // Write released key
            let working = MIDI_RELEASE_KEY | channel;
            writeData([working]);

            // Write key
            working = key & 0x7F;
            writeData([working]);

            // Dummy
            working = 0;
            writeData([working]);

            tracksize += 3;
        }

        // Write a pitch wheel/bend event
        function writePitchWheel(channel, wheel) {
            // Write queued time
            writeTime(queuedtime);

            let working = MIDI_PITCH_WHEEL | channel;
            writeData([working]);

            working = wheel & 0x7F;
            writeData([working]);

            working = (wheel >> 7) & 0x7F;
            writeData([working]);

            tracksize += 3;
        }

        // Write a patch change event
        function writeChangePatch(channel, patch) {
            // Write queued time
            writeTime(queuedtime);

            let working = MIDI_CHANGE_PATCH | channel;
            writeData([working]);

            working = patch & 0x7F;
            writeData([working]);

            tracksize += 2;
        }

        // Write a valued controller change event
        function writeChangeControllerValued(channel, control, value) {
            // Write queued time
            writeTime(queuedtime);

            let working = MIDI_CHANGE_CONTROLLER | channel;
            writeData([working]);

            working = control & 0x7F;
            writeData([working]);

            // Quirk in vanilla DOOM? MUS controller values should be 7-bit, not 8-bit.
            working = value & 0x80 ? 0x7F : value;
            writeData([working]);

            tracksize += 3;
        }

        // Write a valueless controller change event
        function writeChangeControllerValueless(channel, control) {
            writeChangeControllerValued(channel, control, 0);
        }

        // Allocate a free MIDI channel.
        function allocateMIDIChannel() {
            let result;
            let max;
            let i;

            // Find the current highest-allocated channel.

            max = -1;

            for (i = 0; i < MUS_NUM_CHANNELS; ++i) {
                if (channelMap[i] > max) {
                    max = channelMap[i];
                }
            }

            // max is now equal to the highest-allocated MIDI channel.  We can
            // now allocate the next available channel.  This also works if
            // no channels are currently allocated (max=-1)

            result = max + 1;

            // Don't allocate the MIDI percussion channel!

            if (result === MIDI_PERCUSSION_CHANNEL) {
                ++result;
            }

            return result;
        }

        // Given a MUS channel number, get the MIDI channel number to use in the outputted file.
        function getMIDIChannel(musChannel) {
            // Find the MIDI channel to use for this MUS channel.
            // MUS channel 15 is the percusssion channel.

            if (musChannel === MUS_PERCUSSION_CHANNEL) {
                return MIDI_PERCUSSION_CHANNEL;
            }

            // If a MIDI channel hasn't been allocated for this MUS channel
            // yet, allocate the next free MIDI channel.

            if (channelMap[musChannel] === -1) {
                channelMap[musChannel] = allocateMIDIChannel();
            }

            return channelMap[musChannel];
        }

        function convertMusToMidi(musinput) {
            // master dataview for input mus
            musDataView = musinput;
            musDataPosition = 0;

            function getMusByte8() {
                const output = musDataView.getUint8(musDataPosition);
                musDataPosition += 1;
                // console.log(output);
                return output;
            }

            // master data for output midi
            const outputArrayBuffer = new ArrayBuffer(0);
            outputDataView = new DataView(outputArrayBuffer);

            // Descriptor for the current MUS event
            let eventdescriptor;
            let channel; // Channel number
            let musEvent;


            // Bunch of vars read from MUS lump
            let key;
            let controllernumber;
            let controllervalue;

            // Flag for when the score end marker is hit.
            let hitScoreEnd = false;

            // Temp working byte
            let working;
            // Used in building up time delays
            let timedelay;

            // Initialise channel map to mark all channels as unused.
            for (channel = 0; channel < MUS_NUM_CHANNELS; ++channel) {
                channelMap[channel] = -1;
            }

            const musHeader = readMusHeader(musDataView);

            if (!isValidMusHeader(musHeader.id)) {
                console.error(`Invalid MUS header: '${musHeader.id}'. Expected: '${MUS_HEADER_SIGNATURE}'`);
                return false;
            }

            // Seek to where the data is held
            musDataPosition = musHeader.scoreStart;
            // So, we can assume the MUS file is faintly legit. Let's start writing MIDI data...

            writeData(MIDI_HEADER_DATA);
            tracksize = 0;

            // Now, process the MUS file:
            while (!hitScoreEnd) {
                // Handle a block of events:

                while (!hitScoreEnd) {
                    // Fetch channel number and event code:
                    eventdescriptor = getMusByte8();


                    channel = getMIDIChannel(eventdescriptor & 0x0F);
                    musEvent = eventdescriptor & 0x70;
                    switch (musEvent) {
                        case MUS_RELEASE_KEY:
                            // console.log('MUS_RELEASE_KEY');
                            key = getMusByte8();

                            writeReleaseKey(channel, key);

                            break;

                        case MUS_PRESS_KEY:
                            key = getMusByte8();

                            if (key & 0x80) {
                                channelvelocities[channel] = getMusByte8();

                                channelvelocities[channel] &= 0x7F;

                                // console.log('MUS_PRESS_KEY: '+key+ ' ' + channelvelocities[channel]);
                            } else {
                                // console.log('MUS_PRESS_KEY: '+key);
                            }

                            writePressKey(channel, key, channelvelocities[channel]);

                            break;

                        case MUS_PITCH_WHEEL:
                            // console.log('MUS_PITCH_WHEEL');
                            key = getMusByte8();

                            writePitchWheel(channel, key * 64);

                            break;

                        case MUS_SYSTEM_EVENT:
                            // console.log('MUS_SYSTEM_EVENT');
                            controllernumber = getMusByte8();

                            if (controllernumber < 10 || controllernumber > 14) {
                                console.error(`Controller number inaccurate 10-14: ${controllernumber}`);
                                return false;
                            }

                            writeChangeControllerValueless(channel, MIDI_CONTROLLER_MAP[controllernumber]);

                            break;

                        case MUS_CHANGE_CONTROLLER:
                            controllernumber = getMusByte8();
                            controllervalue = getMusByte8();
                            // console.log('MUS_CHANGE_CONTROLLER: ' +controllernumber+' '+controllervalue);
                            if (controllernumber == 0) {
                                writeChangePatch(channel, controllervalue);
                            } else {
                                if (controllernumber < 1 || controllernumber > 9) {
                                    console.error(`Controller number inaccurate: ${controllernumber}`);
                                    return false;
                                }

                                writeChangeControllerValued(channel, MIDI_CONTROLLER_MAP[controllernumber], controllervalue);
                            }

                            break;

                        case MUS_SCORE_END:
                            // console.log('musScoreEnd');
                            hitScoreEnd = true;
                            break;

                        default:
                            // console.log('eventdescriptor default: '+eventdescriptor + ' ' + (eventdescriptor & 0x80));
                            return false;
                    }
                    if ((eventdescriptor & 0x80) != 0) {
                        // console.log('delay count');
                        break;
                    }
                }
                // Now we need to read the time code:
                if (!hitScoreEnd) {
                    // console.log('read time code');
                    timedelay = 0;
                    // delayCounter = 0;
                    for (; ;) {
                        working = getMusByte8();
                        // delayCounter += 1;
                        timedelay = timedelay * 128 + (working & 0x7F);
                        if ((working & 0x80) == 0) { break; }
                    }
                    // console.log('delay count: '+delayCounter + ' time delay: ' + timedelay)
                    queuedtime += timedelay;
                }
            }
            // console.log(`Converted '${lumpId}' from MUS to MIDI (WAD: '${wadId}').`);
            // End of track
            writeEndTrack();

            confirmWrite();

            // Write the track size into the stream
            outputDataView.setUint8(MIDI_TRACKLENGTH_OFS + 0, (tracksize >> 24) & 0xff);
            outputDataView.setUint8(MIDI_TRACKLENGTH_OFS + 1, (tracksize >> 16) & 0xff);
            outputDataView.setUint8(MIDI_TRACKLENGTH_OFS + 2, (tracksize >> 8) & 0xff);
            outputDataView.setUint8(MIDI_TRACKLENGTH_OFS + 3, tracksize & 0xff);

            return outputDataView.buffer;
        }

        const midi = convertMusToMidi(data);
        if (!midi) {
            console.error(`Failed to convert '${type}/${name}' from MUS to MIDI (WAD: '${wadId}').`, { musDataPosition });
        }

        setCacheItemAsBlob({ cacheId: wadId, requestURL, responseData: midi });

        postMessage({
            wadId,
            lumpId: name,
            lumpType: type,
            output: requestURL,
        });
    } catch (error) {
        console.error('Something bad happened in midiConverter.', { error });
    }
};
