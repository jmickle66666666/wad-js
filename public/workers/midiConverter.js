onmessage = (message) => {
    console.log(message.data);
    const { wadId, lumpId, data } = message.data;

    console.log(`Converting '${lumpId}' from MUS to MIDI...`);

    // MUS event codes
    const mus_releasekey = 0x00;
    const mus_presskey = 0x10;
    const mus_pitchwheel = 0x20;
    const mus_systemevent = 0x30;
    const mus_changecontroller = 0x40;
    const mus_scoreend = 0x60;

    // MIDI event codes
    const midi_releasekey = 0x80;
    const midi_presskey = 0x90;
    const midi_aftertouchkey = 0xA0;
    const midi_changecontroller = 0xB0;
    const midi_changepatch = 0xC0;
    const midi_aftertouchchannel = 0xD0;
    const midi_pitchwheel = 0xE0;

    // Structure to hold MUS file header
    const musheader = {
        id: [],
        scorelength: null,
        scorestart: null,
        primarychannels: null,
        secondarychannels: null,
        instrumentcount: null,
    };

    // Standard MIDI type 0 header + track header
    /*
    const uint8_t midiheader[] =
    {
        'M', 'T', 'h', 'd',     // Main header
        0x00, 0x00, 0x00, 0x06, // Header size
        0x00, 0x00,             // MIDI type (0)
        0x00, 0x01,             // Number of tracks
        0x00, 0x46,             // Resolution
        'M', 'T', 'r', 'k',     // Start of track
        0x00, 0x00, 0x00, 0x00  // Placeholder for track length
    };
    */
    // ^ this is the standard first 22 bytes of the midi output, aside from adding the track length.
    // I should create a function that adds this data manually with the DataView
    function writeMidiHeader() {
        const midiHeaderData = ['M'.charCodeAt(0), 'T'.charCodeAt(0), 'h'.charCodeAt(0), 'd'.charCodeAt(0), // Main header
            0x00, 0x00, 0x00, 0x06, // Header size
            0x00, 0x00, // MIDI type (0)
            0x00, 0x01, // Number of tracks
            0x00, 0x46, // Resolution
            'M'.charCodeAt(0), 'T'.charCodeAt(0), 'r'.charCodeAt(0), 'k'.charCodeAt(0), // Start of track
            0x00, 0x00, 0x00, 0x00, // Placeholder for track length
        ];

        writeData(midiHeaderData);
    }

    let musDataView;
    let musDataPosition;

    // Constants
    const NUM_CHANNELS = 16;
    const MUS_PERCUSSION_CHAN = 15;
    const MIDI_PERCUSSION_CHAN = 9;
    const MIDI_TRACKLENGTH_OFS = 18;

    // Cached channel velocities
    const channelvelocities = [127, 127, 127, 127, 127, 127, 127, 127,
        127, 127, 127, 127, 127, 127, 127, 127];

    // Timestamps between sequences of MUS events
    let queuedtime = 0;

    // Counter for the length of the track
    let tracksize;

    const controller_map = [0x00, 0x20, 0x01, 0x07, 0x0A, 0x0B, 0x5B, 0x5D,
        0x40, 0x43, 0x78, 0x7B, 0x7E, 0x7F, 0x79];

    const channel_map = [];

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
        let working = midi_presskey | channel;
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
        let working = midi_releasekey | channel;
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

        let working = midi_pitchwheel | channel;
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

        let working = midi_changepatch | channel;
        writeData([working]);

        working = patch & 0x7F;
        writeData([working]);

        tracksize += 2;
    }

    // Write a valued controller change event
    function writeChangeController_Valued(channel, control, value) {
        // Write queued time
        writeTime(queuedtime);

        let working = midi_changecontroller | channel;
        writeData([working]);

        working = control & 0x7F;
        writeData([working]);

        // Quirk in vanilla DOOM? MUS controller values should be 7-bit, not 8-bit.
        working = value & 0x80 ? 0x7F : value;
        writeData([working]);

        tracksize += 3;
    }

    // Write a valueless controller change event
    function writeChangeController_Valueless(channel, control) {
        writeChangeController_Valued(channel, control, 0);
    }

    // Allocate a free MIDI channel.
    function allocateMIDIChannel() {
        let result;
        let max;
        let i;

        // Find the current highest-allocated channel.

        max = -1;

        for (i = 0; i < NUM_CHANNELS; ++i) {
            if (channel_map[i] > max) {
                max = channel_map[i];
            }
        }

        // max is now equal to the highest-allocated MIDI channel.  We can
        // now allocate the next available channel.  This also works if
        // no channels are currently allocated (max=-1)

        result = max + 1;

        // Don't allocate the MIDI percussion channel!

        if (result === MIDI_PERCUSSION_CHAN) {
            ++result;
        }

        return result;
    }

    // Given a MUS channel number, get the MIDI channel number to use in the outputted file.
    function getMIDIChannel(mus_channel) {
        // Find the MIDI channel to use for this MUS channel.
        // MUS channel 15 is the percusssion channel.

        if (mus_channel === MUS_PERCUSSION_CHAN) {
            return MIDI_PERCUSSION_CHAN;
        }

        // If a MIDI channel hasn't been allocated for this MUS channel
        // yet, allocate the next free MIDI channel.

        if (channel_map[mus_channel] === -1) {
            channel_map[mus_channel] = allocateMIDIChannel();
        }

        return channel_map[mus_channel];
    }

    function readMusHeader(dataView) {
        const output = Object.create(musheader);

        for (let i = 0; i < 4; i++) {
            output.id.push(dataView.getUint8(i));
        }
        output.scorelength = dataView.getUint16(4, true);
        output.scorestart = dataView.getUint16(6, true);
        output.primarychannels = dataView.getUint16(8, true);
        output.secondarychannels = dataView.getUint16(10, true);
        output.instrumentcount = dataView.getUint16(12, true);

        return output;
    }

    function convertMusToMidi(musinput) {
        // master dataview for input mus
        musDataView = musinput;
        musDataPosition = 0;
        const startTime = Date.now();

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
        let mus_event;


        // Bunch of vars read from MUS lump
        let key;
        let controllernumber;
        let controllervalue;

        // Flag for when the score end marker is hit.
        let hitscoreend = 0;

        // Temp working byte
        let working;
        // Used in building up time delays
        let timedelay;

        // Initialise channel map to mark all channels as unused.
        for (channel = 0; channel < NUM_CHANNELS; ++channel) {
            channel_map[channel] = -1;
        }

        // Grab the header
        const musfileheader = readMusHeader(musDataView);
        // Check MUS header
        if (musfileheader.id[0] !== 'M'.charCodeAt(0) || musfileheader.id[1] !== 'U'.charCodeAt(0)
            || musfileheader.id[2] !== 'S'.charCodeAt(0) || musfileheader.id[3] !== 0x1A) {
            console.error('Invalid MUS header.');
            return false;
        }

        // Seek to where the data is held
        musDataPosition = musfileheader.scorestart;
        // So, we can assume the MUS file is faintly legit. Let's start writing MIDI data...

        writeMidiHeader();
        tracksize = 0;

        // Now, process the MUS file:
        while (hitscoreend === 0) {
            // Handle a block of events:

            while (hitscoreend === 0) {
                // Fetch channel number and event code:
                eventdescriptor = getMusByte8();


                channel = getMIDIChannel(eventdescriptor & 0x0F);
                mus_event = eventdescriptor & 0x70;
                switch (mus_event) {
                case mus_releasekey:
                    // console.log('mus_releasekey');
                    key = getMusByte8();

                    writeReleaseKey(channel, key);

                    break;

                case mus_presskey:
                    key = getMusByte8();

                    if (key & 0x80) {
                        channelvelocities[channel] = getMusByte8();

                        channelvelocities[channel] &= 0x7F;

                        // console.log('mus_presskey: '+key+ ' ' + channelvelocities[channel]);
                    } else {
                        // console.log('mus_presskey: '+key);
                    }

                    writePressKey(channel, key, channelvelocities[channel]);

                    break;

                case mus_pitchwheel:
                    // console.log('mus_pitchwheel');
                    key = getMusByte8();

                    writePitchWheel(channel, key * 64);

                    break;

                case mus_systemevent:
                    // console.log('mus_systemevent');
                    controllernumber = getMusByte8();

                    if (controllernumber < 10 || controllernumber > 14) {
                        console.error(`Controller number inaccurate 10-14: ${controllernumber}`);
                        return false;
                    }

                    writeChangeController_Valueless(channel, controller_map[controllernumber]);

                    break;

                case mus_changecontroller:
                    controllernumber = getMusByte8();
                    controllervalue = getMusByte8();
                    // console.log('mus_changecontroller: ' +controllernumber+' '+controllervalue);
                    if (controllernumber == 0) {
                        writeChangePatch(channel, controllervalue);
                    } else {
                        if (controllernumber < 1 || controllernumber > 9) {
                            console.error(`Controller number inaccurate: ${controllernumber}`);
                            return false;
                        }

                        writeChangeController_Valued(channel, controller_map[controllernumber], controllervalue);
                    }

                    break;

                case mus_scoreend:
                    // console.log('mus_scoreend');
                    hitscoreend = 1;
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
            if (hitscoreend === 0) {
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
        console.log(`Done converting '${lumpId}' from MUS to MIDI.`);
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

    const masterOutput = convertMusToMidi(data);
    if (masterOutput === false) {
        console.error(`Failed to convert '${lumpId}' from MUS to MIDI. Sucks.`, { musDataPosition });
    }

    postMessage({
        status: 'done',
        wadId,
        lumpId,
        midi: btoa(masterOutput),
    });
};
