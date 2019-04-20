import { Component } from 'react';
import moment from 'moment';

import mediaSessionSupport from '../../lib/mediaSessionSupport';
import MidiPlayer from '../../lib/MidiPlayer';
import { getCacheItemAsArrayBuffer } from '../../lib/cacheManager';

import {
    MIDI_ERROR,
    MIDI_STATUS,
    MIDI_PLAY,
    MIDI_END,
} from '../../lib/constants';

const {
    supported: mediaSessionSupported,
    ignored: mediaSessionIgnored,
    message: mediaSessionMessage,
} = mediaSessionSupport();

export default class MediaPlayer extends Component {
    dummyAudio = document.createElement('audio')

    initMediaSession = () => {
        if (mediaSessionSupported) {
            try {
                this.dummyAudio.src = '/public/silence.mp3';

                // debug
                window.dummyAudio = this.dummyAudio;
                navigator.mediaSession.setActionHandler('play', () => {
                    const { selectedMidi } = this.state;
                    if (selectedMidi) {
                        const { startedAt, paused, ended } = selectedMidi;
                        if (startedAt && !paused && !ended) {
                            this.pauseMidi();
                        } else {
                            this.resumeMidi();
                        }
                    }
                });
                navigator.mediaSession.setActionHandler('pause', () => this.pauseMidi());
                navigator.mediaSession.setActionHandler('nexttrack', () => this.selectNextMidi());
            } catch (error) {
                this.addGlobalMessage({
                    type: 'error',
                    id: 'mediaSession',
                    text: `An error occurred while initializing Media Session: ${error}`,
                });
            }
        } else if (!mediaSessionIgnored) {
            const { globalMessages } = this.state;
            if (!globalMessages.mediaSession) {
                this.addGlobalMessage({
                    type: 'warning',
                    id: 'mediaSession',
                    text: mediaSessionMessage,
                });
            }
        }
    }

    initMidiPlayer = () => {
        this.midiPlayer = new MidiPlayer({
            eventLogger: this.handleMidiPlayerEvent,
        });
    }

    // should not be necessary anymore: we have cache instead
    reconcileMidiLumpAndData = ({
        wads,
        wadId,
        convertedMidis,
        midiName,
        lumpType,
    }) => {
        const nextMidiData = this.getMidiData({
            convertedMidis,
            wadId,
            midiName,
        });

        if (nextMidiData) {
            const nextMidiLump = this.getMidiLump({
                wads,
                wadId,
                lumpType,
                midiName,
            });

            if (nextMidiLump) {
                const midiURL = nextMidiData;
                return {
                    midiURL,
                    lump: nextMidiLump,
                    wadId,
                };
            }
        }

        return false;
    }

    getMidiData = ({
        convertedMidis,
        wadId,
        midiName,
    }) => (
        convertedMidis[wadId]
            && convertedMidis[wadId]
            && convertedMidis[wadId][midiName]
    )

    // note: this will only get MIDIs that are in the same lumpType of the WAD as the selected MIDI
    getMidiLump = ({
        wads,
        wadId,
        lumpType,
        midiName,
    }) => (
        wads[wadId]
            && wads[wadId].lumps
            && wads[wadId].lumps[lumpType]
            && wads[wadId].lumps[lumpType][midiName]
    )

    selectNextMidi = () => {
        const { wads, selectedMidi, midis } = this.state;

        if (!selectedMidi.lumpName) {
            this.clearMidiPlayer();
            return false;
        }

        const { wadId, lumpName, lumpType } = selectedMidi;
        const { converted: convertedMidis } = midis;
        const currentWadMidiIds = Object.keys(convertedMidis[wadId]);

        const selectedMidiIndex = currentWadMidiIds.findIndex(midiId => midiId === lumpName);

        // we reached the last MIDI in the current WAD
        if (selectedMidiIndex >= currentWadMidiIds.length - 1) {
            const wadIds = Object.keys(wads);

            // there are no WADs
            if (wadIds.length === 0) {
                this.clearMidiPlayer();
                return false;
            }

            // select first MIDI (if any) in the only WAD
            if (wadIds.length === 1) {
                const firstWadId = wadIds[0];

                const { settings } = this.state;
                if (firstWadId === selectedMidi.wadId && !settings.playbackLoop) {
                    this.clearMidiPlayer();
                    return false;
                }

                const nextWadMidiIds = Object.keys(convertedMidis[firstWadId] || {});
                if (nextWadMidiIds.length > 0) {
                    const nextMidiName = nextWadMidiIds[0];

                    const nextMidi = this.reconcileMidiLumpAndData({
                        wads,
                        wadId: firstWadId,
                        convertedMidis,
                        midiName: nextMidiName,
                        lumpType, // warning: this will need to change!
                    });

                    if (nextMidi) {
                        this.selectMidi({ ...nextMidi });
                        return true;
                    }
                } else {
                    this.clearMidiPlayer();
                    return false;
                }
            }

            // select first MIDI from next WAD that has MIDIs (if any)
            if (wadIds.length >= 2) {
                const convertedMidiWadIds = Object.keys(convertedMidis || {});
                const wadIndex = convertedMidiWadIds.findIndex(midiWadId => midiWadId === wadId);

                let index = wadIndex;
                let interruptSearch = false;
                while (!interruptSearch) {
                    index = index + 1 > convertedMidiWadIds.length - 1 ? 0 : index + 1;

                    const { settings } = this.state;
                    if (index === 0 && !settings.playbackLoop) {
                        this.clearMidiPlayer();
                        return false;
                    }

                    const nextWadId = convertedMidiWadIds[index];
                    const nextWadMidiIds = Object.keys(convertedMidis[nextWadId] || {});

                    if (nextWadMidiIds.length > 0) {
                        const nextMidiName = nextWadMidiIds[0];

                        const nextMidi = this.reconcileMidiLumpAndData({
                            wads,
                            wadId: nextWadId,
                            convertedMidis,
                            midiName: nextMidiName,
                            lumpType, // warning: this will need to change!
                        });

                        if (nextMidi) {
                            interruptSearch = true;
                            this.selectMidi({ ...nextMidi });
                            return true;
                        }
                    }

                    if (index === wadIndex) {
                        interruptSearch = true;
                    }
                }
            }
        } else {
            // select next MIDI of the current WAD
            const nextMidiName = currentWadMidiIds[selectedMidiIndex + 1];

            const nextMidi = this.reconcileMidiLumpAndData({
                wads,
                wadId,
                convertedMidis,
                midiName: nextMidiName,
                lumpType, // warning: this will need to change!
            });

            if (nextMidi) {
                this.selectMidi({ ...nextMidi });
            }
        }

        return true;
    }

    handleMidiPlayerEvent = ({
        event,
        message,
        time,
        done,
        ...payload
    }) => {
        const midiPlayerMessagePrefix = 'Midi player:';

        // debug
        if (event !== MIDI_PLAY) {
            console.log({
                event, message, time, payload,
            });
        }

        switch (event) {
            default: {
                if (message) {
                    this.addGlobalMessage({
                        type: 'info',
                        id: MIDI_STATUS,
                        text: `${midiPlayerMessagePrefix} ${message}`,
                    });
                }
                break;
            }
            case MIDI_ERROR: {
                this.dismissGlobalMessage(MIDI_STATUS);
                this.addGlobalMessage({
                    type: 'error',
                    id: event,
                    text: `${midiPlayerMessagePrefix} ${message}`,
                });

                // reset the midi player
                // creating a new instance can help with the MIDI player after it crashed
                this.midiPlayer.stop();
                this.initMidiPlayer();
                break;
            }
            case MIDI_PLAY: {
                const { globalMessages } = this.state;
                if (globalMessages[MIDI_STATUS]) {
                    this.dismissGlobalMessage(MIDI_STATUS);
                }

                const roundedDownTime = Math.floor(time);

                const { selectedMidi: { time: previousTime = 0 } } = this.state;
                // The time played don't get updated exactly every second
                // the code below is the best approximation we can get based on how MIDI work
                if (roundedDownTime >= previousTime) {
                    this.setState(prevState => ({
                        selectedMidi: {
                            ...prevState.selectedMidi,
                            time: roundedDownTime,
                        },
                    }));
                }

                if (this.dummyAudio.ended) {
                    this.dummyAudio.play();
                }

                break;
            }
            case MIDI_END: {
                const roundedDownTime = Math.floor(time);
                this.setState(prevState => ({
                    selectedMidi: {
                        ...prevState.selectedMidi,
                        time: roundedDownTime,
                        ended: true,
                    },
                }));

                const {
                    settings,
                    midis,
                    wads,
                    selectedMidi,
                } = this.state;

                if (settings.playNextTrack) {
                    this.selectNextMidi();
                } else if (settings.playbackLoop) {
                    const { wadId, lumpType, lumpName } = selectedMidi;
                    if (
                        wads[wadId]
                        && wads[wadId].lumps
                        && wads[wadId].lumps[lumpType]
                        && wads[wadId].lumps[lumpType][lumpName]
                        && midis
                        && midis.converted
                        && midis.converted[wadId]
                        && midis.converted[wadId][lumpName]
                    ) {
                        const lump = wads[wadId].lumps[lumpType][lumpName];
                        const data = midis.converted[wadId][lumpName];
                        this.selectMidi({
                            midiURL: data,
                            lump,
                            wadId,
                        });
                    }
                }

                break;
            }
        }
    }

    selectMidi = async ({
        midiURL,
        lump,
        wadId,
    }) => {
        if (!this.midiPlayer) {
            this.initMidiPlayer();
        }

        let arrayBuffer = null;
        let objectURL = null;
        if (midiURL instanceof DataView) {
            const blob = new Blob([midiURL]);
            objectURL = URL.createObjectURL(blob);
        } else {
            arrayBuffer = await getCacheItemAsArrayBuffer({ cacheId: wadId, requestURL: midiURL });
            if (!arrayBuffer) {
                console.error(`Could not find cache item '${lump.type}/${lump.name}' in ${wadId}.`);
            }
        }

        const success = this.midiPlayer.play({ arrayBuffer, url: objectURL, name: lump.name });
        if (!success) {
            return;
        }

        if (mediaSessionSupported && !mediaSessionIgnored) {
            const { wads } = this.state;
            const wad = wads[wadId];
            const wadName = wad ? wad.name : '';

            navigator.mediaSession.metadata = new MediaMetadata({
                title: lump.name,
                artist: wadName,
            });
        }

        if (this.dummyAudio.paused) {
            this.dummyAudio.play();
        }

        this.setState(() => {
            const selectedMidi = {
                data: midiURL,
                lumpName: lump.name,
                lumpType: lump.type,
                wadId,
                startedAt: moment().utc().unix(),
                time: 0,
                paused: false,
            };

            return {
                selectedMidi,
            };
        });
    }

    resumeMidi = async () => {
        if (!this.midiPlayer) {
            this.initMidiPlayer();
        }

        let time = 0;
        let success;
        const { selectedMidi } = this.state;
        if (selectedMidi.paused && !selectedMidi.ended) {
            success = this.midiPlayer.resume();
            time = selectedMidi.time;
        } else {
            const { data, wadId, lumpName } = selectedMidi;
            let arrayBuffer = null;
            let objectURL = null;
            if (data instanceof DataView) {
                // TODO: these items should be cached instead to allow full offline access
                const blob = new Blob([data]);
                objectURL = URL.createObjectURL(blob);
            } else {
                arrayBuffer = await getCacheItemAsArrayBuffer({ cacheId: wadId, requestURL: data });
                if (!arrayBuffer) {
                    console.error(`Could not find cache item '${selectedMidi.data}' in ${wadId}.`);
                }
            }

            success = this.midiPlayer.play({ arrayBuffer, url: objectURL, name: lumpName });
        }

        if (!success) {
            return;
        }

        if (this.dummyAudio.paused) {
            this.dummyAudio.play();
        }

        const { globalMessages } = this.state;
        if (globalMessages[MIDI_STATUS]) {
            this.dismissGlobalMessage(MIDI_STATUS);
        }

        this.setState(prevState => ({
            selectedMidi: {
                ...prevState.selectedMidi,
                startedAt: moment().utc().unix(),
                time,
                paused: false,
            },
        }));
    }

    pauseMidi = () => {
        const { globalMessages } = this.state;
        if (globalMessages[MIDI_STATUS]) {
            this.dismissGlobalMessage(MIDI_STATUS);
        }

        this.setState((prevState) => {
            const success = this.midiPlayer.pause();

            if (!success) {
                return {};
            }


            if (!this.dummyAudio.paused && this.dummyAudio.currentTime) {
                this.dummyAudio.pause();
            }

            const selectedMidi = {
                ...prevState.selectedMidi,
                paused: true,
            };

            return {
                selectedMidi,
            };
        });
    }

    stopMidi = () => {
        if (!this.midiPlayer) {
            this.initMidiPlayer();
        }

        const { selectedMidi: prevSelectedMidi } = this.state;
        if (prevSelectedMidi.time === 0) {
            return;
        }

        const { globalMessages } = this.state;
        if (globalMessages[MIDI_STATUS]) {
            this.dismissGlobalMessage(MIDI_STATUS);
        }

        this.setState((prevState) => {
            const success = this.midiPlayer.stop();

            if (!success) {
                return {};
            }

            if (!this.dummyAudio.paused && this.dummyAudio.currentTime) {
                this.dummyAudio.pause();
            }

            const selectedMidi = {
                ...prevState.selectedMidi,
                startedAt: 0,
                time: 0,
            };

            return {
                selectedMidi,
            };
        });
    }

    clearMidiPlayer = () => {
        if (this.midiPlayer) {
            this.midiPlayer.stop();
            if (!this.dummyAudio.paused && this.dummyAudio.currentTime) {
                this.dummyAudio.pause();
            }

            const { selectedMidi } = this.state;
            if (selectedMidi && selectedMidi.data) {
                this.setState(() => ({
                    selectedMidi: {},
                }));
            }
        }
    }

    updateMidiSelection = (wadId) => {
        const { selectedMidi, settings } = this.state;

        if (!selectedMidi.lumpName) {
            return;
        }

        if (selectedMidi.wadId === wadId) {
            if (settings.playNextTrack) {
                this.selectNextMidi();
            } else {
                this.clearMidiPlayer();
            }
        }
    }
}
