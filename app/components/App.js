import React, { Component, Fragment } from 'react';
import moment from 'moment';

import style from './App.scss';

import MidiConverter from '../workers/midiConverter';
import SimpleImageConverter from '../workers/simpleImageConverter';
import MapParser from '../workers/mapParser';

import Wad from '../models/Wad';

import LocalStorageManager from '../lib/LocalStorageManager';
import offscreenCanvasSupport from '../lib/offscreenCanvasSupport';
import MidiPlayer from '../lib/midi/MidiPlayer';
import {
    MIDI_ERROR,
    MIDI_STATUS,
    MIDI_PLAY,
    MIDI_PAUSE,
    MIDI_RESUME,
    MIDI_STOP,
} from '../lib/constants';

import Header from './Header';
import GlobalMessages from './Messages/GlobalMessages';
import Logo from './Logo';
import WadUploader from './Upload/WadUploader';
import UploadedWadList from './Upload/UploadedWadList';
import WadDetails from './WadExplorer/WadDetails';
import PortablePlayer from './AudioPlayers/PortablePlayer';
import BackToTop from './BackToTop';

const localStorageManager = new LocalStorageManager();

const prefixWindowtitle = document.title;

const {
    supported: offscreenCanvasSupported,
    message: offscreenCanvasSupportMessage,
} = offscreenCanvasSupport();

export default class App extends Component {
    state = {
        globalMessages: {},
        wads: {},
        selectedWad: {},
        selectedLump: {},
        selectedLumpType: '',
        selectedMidi: {},
        preselectedMidi: false,
        midis: {
            queue: {},
            converted: {},
        },
        simpleImages: {
            queue: {},
            converted: {},
        },
        displayError: {},
    }

    midiConverter = new MidiConverter()

    simpleImageConverter = new SimpleImageConverter();

    mapParser = new MapParser();

    async componentDidMount() {
        if (offscreenCanvasSupportMessage) {
            this.addGlobalMessage({
                type: 'error',
                id: 'offscreenCanvasSupport',
                text: offscreenCanvasSupportMessage,
            });
        }

        this.addGlobalMessage({
            type: 'info',
            id: 'savedWads',
            text: 'Loading WADs from previous session...',
        });

        const wads = await this.getWadsFromLocalMemory();
        this.setState(() => ({ wads }), () => {
            this.dismissGlobalMessage('savedWads');
            const wadIds = Object.keys(wads || {});
            wadIds.map(wadId => this.convertLumps({ wad: wads[wadId] }));
        });

        const freedoomPreloaded = await localStorageManager.get('freedoom-preloaded');
        if (!freedoomPreloaded) {
            // this.preUploadFreedoom();
        }

        const { match } = this.props;
        const { params } = match;
        const { wadName, lumpName, lumpType } = params;

        if (window.location.hash.includes('#/uploader')) {
            const uploader = document.getElementById('uploader');
            if (uploader) {
                uploader.scrollIntoView();
            }
        }

        if (wadName) {
            this.selectWad(wadName, true);
        }

        if (lumpType) {
            this.selectLumpType(lumpType, true);
        }

        if (lumpName) {
            this.selectLump(lumpName, true);
        }
    }

    // Workers

    startWorker({
        workerId,
        workerClass,
        onmessage = () => { },
        onerror = this.workerError,
    }) {
        this[workerId] = new workerClass();
        this[workerId].onmessage = onmessage;
        this[workerId].onerror = onerror;
    }

    getLumps = ({
        targetObject,
        wad,
        lumpType,
        originalFormat,
        extractLumpData = lump => lump,
    }) => {
        const lumpIds = Object.keys(wad.lumps[lumpType] || {});

        const unconvertedLumps = lumpIds
            .map(lumpId => wad.lumps[lumpType][lumpId])
            .filter((lump) => {
                // eslint-disable-next-line react/destructuring-assignment
                const items = this.state[targetObject];
                const alreadyExists = (
                    items.converted[wad.id]
                    && items.converted[wad.id][lump.name]
                );
                return !alreadyExists
                    && (!originalFormat || lump.originalFormat === originalFormat);
            });

        const lumpObject = {};
        for (let i = 0; i < unconvertedLumps.length; i++) {
            const lump = unconvertedLumps[i];
            lumpObject[lump.name] = extractLumpData(lump);
        }

        return {
            lumps: lumpObject,
            firstLump: unconvertedLumps[0],
            count: lumpIds.length,
        };
    }

    addItemsToTargetObject = ({
        wad,
        targetObject,
        items,
        newQueue,
        newConvertedItems = {},
    }) => {
        const wadItems = items.queue[wad.id];
        return {
            [targetObject]: {
                ...items,
                queue: {
                    ...items.queue,
                    [wad.id]: {
                        ...wadItems,
                        ...newQueue,
                    },
                },
                converted: {
                    ...items.converted,
                    [wad.id]: {
                        ...wadItems,
                        ...newConvertedItems,
                    },
                },
            },
        };
    }

    removeItemFromQueue = ({ targetObject, wadId, lumpId }) => {
        // didn't work: remove item from queue (otherwise, we get stuck in infinite loop)
        this.setState((prevState) => {
            const items = prevState[targetObject];
            const wadQueueIds = Object.keys(items.queue[wadId] || {});
            const updatedWadQueue = {};
            for (let i = 0; i < wadQueueIds.length; i++) {
                const lumpName = wadQueueIds[i];
                if (lumpName !== lumpId) {
                    updatedWadQueue[lumpName] = { ...items.queue[wadId][lumpName] };
                }
            }

            return {
                [targetObject]: {
                    ...items,
                    queue: {
                        ...items.queue,
                        [wadId]: {
                            ...updatedWadQueue,
                        },
                    },
                },
            };
        });
    }

    removeWadFromTargetObject = ({ targetObject, wadId }) => {
        this.setState((prevState) => {
            const items = prevState[targetObject];

            return {
                [targetObject]: {
                    ...items,
                    queue: {
                        ...items.queue,
                        [wadId]: {},
                    },
                    converted: {
                        ...items.converted,
                        [wadId]: {},
                    },
                },
            };
        });
    }

    clearTargetObject = ({ targetObject }) => {
        this.setState(() => ({
            [targetObject]: {
                queue: {},
                converted: {},
            },
        }));
    }

    moveItemFromWadQueueToConvertedItems = ({
        targetObject,
        wadId,
        lumpId,
        items,
        newItem,
    }) => {
        const wadConverted = items.converted[wadId];
        const wadQueueIds = Object.keys(items.queue[wadId] || {});
        const updatedWadQueue = {};
        for (let i = 0; i < wadQueueIds.length; i++) {
            const lumpName = wadQueueIds[i];
            if (lumpName !== lumpId) {
                updatedWadQueue[lumpName] = { ...items.queue[wadId][lumpName] };
            }
        }

        return {
            [targetObject]: {
                ...items,
                queue: {
                    ...items.queue,
                    [wadId]: {
                        ...updatedWadQueue,
                    },
                },
                converted: {
                    ...items.converted,
                    [wadId]: {
                        ...wadConverted,
                        [lumpId]: newItem,
                    },
                },
            },
        };
    }

    getNextItemInQueue = ({ targetObject, wadId }) => {
        const { [targetObject]: { queue } } = this.state;

        let nextLump = {};

        const currentWadQueueIds = Object.keys(queue[wadId] || {});

        if (currentWadQueueIds.length > 0) {
            nextLump = queue[wadId][currentWadQueueIds[0]];
            return {
                nextLump,
                nextWadId: wadId,
            };
        }

        const wadIds = Object.keys(queue);

        let foundLumps = false;
        let j = 0;
        while (!foundLumps) {
            if (j === wadIds.length) {
                break;
            }

            const nextWadId = wadIds[j];
            const nextWadQueue = queue[nextWadId];
            const nextWadQueueIds = Object.keys(nextWadQueue);

            if (nextWadQueueIds.length > 0) {
                foundLumps = true;
                const nextLumpId = nextWadQueueIds[0];
                return {
                    nextLump: nextWadQueue[nextLumpId],
                    nextWadId,
                };
            }

            j++;
        }

        console.log(`Conversion queue for '${targetObject}' is empty.`);
        return { done: true };
    }

    workerError(error) {
        console.error('A worker errored out.', { error });
    }

    // Get workers started

    convertLumps = ({ wad }) => {
        this.addToMidiConversionQueue({ wad });
        // this.addToSimpleImageConversionQueue({ wad });
    }

    // Remove items from queue/converted

    stopConvertingWadItems = ({ wadId }) => {
        this.removeWadFromTargetObject({ targetObject: 'midis', wadId });
        this.removeWadFromTargetObject({ targetObject: 'simpleImages', wadId });
    }

    stopConvertingAllWads = () => {
        this.clearTargetObject({ targetObject: 'midis' });
        this.clearTargetObject({ targetObject: 'simpleImages' });
    }

    // Midi converter

    startMidiConverterWorker() {
        this.startWorker({
            workerId: 'midiConverter',
            workerClass: MidiConverter,
            onmessage: this.saveConvertedMidi,
        });
    }

    addToMidiConversionQueue({ wad }) {
        if (!wad.lumps.music) {
            return;
        }

        const {
            lumps: musLumps,
            firstLump: firstMusLump,
            count: musCount,
        } = this.getLumps({
            wad,
            lumpType: 'music',
            targetObject: 'midis',
            originalFormat: 'MUS',
        });

        // get the worker going if there's nothing in the queue
        if (musCount > 0) {
            const { done } = this.getNextItemInQueue({
                targetObject: 'midis',
                wadId: wad.id,
            });
            if (done && firstMusLump) {
                const { name: lumpId, data } = firstMusLump;
                this.startMidiConverterWorker();
                this.midiConverter.postMessage({
                    wadId: wad.id,
                    lumpId,
                    data,
                });
            }
        }

        const {
            lumps: midiLumps,
            count: midiCount,
        } = this.getLumps({
            wad,
            lumpType: 'music',
            targetObject: 'midis',
            originalFormat: 'MIDI',
            extractLumpData: lump => lump.data,
        });

        this.setState((prevState) => {
            const { midis } = prevState;

            return this.addItemsToTargetObject({
                wad,
                targetObject: 'midis',
                items: midis,
                newQueue: musLumps,
                newConvertedItems: midiLumps,
            });
        }, () => {
            // load the first MIDI into the portable player
            const { preselectedMidi, midis: { converted: midis } } = this.state;
            if (!preselectedMidi && midiCount > 0) {
                this.selectFirstMidi({ midis });
            }
        });
    }

    saveConvertedMidi = (payload) => {
        const { wadId, lumpId, midi } = payload.data;

        // didn't work: remove MUS from queue (otherwise, we get stuck in infinite loop)
        if (!midi) {
            this.removeItemFromQueue({
                targetObject: 'midis',
                wadId,
                lumpId,
            });
        }

        // it worked
        this.setState((prevState) => {
            const { midis } = prevState;
            return this.moveItemFromWadQueueToConvertedItems({
                targetObject: 'midis',
                wadId,
                lumpId,
                items: midis,
                newItem: midi,
            });
        }, () => {
            const { nextLump, nextWadId, done } = this.getNextItemInQueue({
                targetObject: 'midis',
                wadId,
            });

            if (!done) {
                this.midiConverter.postMessage({
                    wadId: nextWadId,
                    lumpId: nextLump.name,
                    data: nextLump.data,
                });
            }

            const { preselectedMidi } = this.state;
            if (!preselectedMidi) {
                const { midis: { converted: midis } } = this.state;
                this.selectFirstMidi({ midis });
            }
        });
    }

    // Simple image converter

    startSimpleImageConverterWorker() {
        this.startWorker({
            workerId: 'simpleImageConverter',
            workerClass: SimpleImageConverter,
            onmessage: this.saveConvertedSimpleImage,
        });
    }

    addToSimpleImageConversionQueue({ wad }) {
        if (!offscreenCanvasSupported) {
            return;
        }

        if (!wad.lumps.flats) {
            return;
        }

        const {
            lumps: flatLumps,
            firstLump: firstFlatLump,
            count: flatCount,
        } = this.getLumps({
            wad,
            lumpType: 'flats',
            targetObject: 'simpleImages',
            originalFormat: null,
        });

        if (flatCount > 0) {
            const { done } = this.getNextItemInQueue({
                targetObject: 'simpleImages',
                wadId: wad.id,
            });
            if (done) {
                this.startSimpleImageConverterWorker();
                this.simpleImageConverter.postMessage({
                    wadId: wad.id,
                    lump: firstFlatLump,
                    palette: wad && wad.palette,
                });
            }
        }

        this.setState((prevState) => {
            const { simpleImages } = prevState;
            return this.addItemsToTargetObject({
                wad,
                targetObject: 'simpleImages',
                items: simpleImages,
                newQueue: flatLumps,
            });
        });
    }

    saveConvertedSimpleImage = (payload) => {
        const { wadId, lumpId, image } = payload.data;

        // didn't work
        if (!image) {
            this.removeItemFromQueue({
                targetObject: 'simpleImages',
                wadId,
                lumpId,
            });
        }

        // it worked
        this.setState((prevState) => {
            const { simpleImages } = prevState;
            return this.moveItemFromWadQueueToConvertedItems({
                targetObject: 'simpleImages',
                wadId,
                lumpId,
                items: simpleImages,
                newItem: image,
            });
        }, () => {
            const { nextLump, nextWadId, done } = this.getNextItemInQueue({
                targetObject: 'simpleImages',
                wadId,
            });

            if (!done) {
                const { wads } = this.state;
                const nextWad = wads[nextWadId];
                this.simpleImageConverter.postMessage({
                    wadId: nextWadId,
                    lump: nextLump,
                    palette: nextWad && nextWad.palette,
                });
            }
        });
    }

    async getWadsFromLocalMemory() {
        const savedWads = await localStorageManager.get('wads');

        if (!savedWads) {
            return {};
        }

        const wadsData = Object.keys(savedWads).map(wadId => savedWads[wadId]);

        const wadList = wadsData.map((wadData) => {
            // Wad instances must be re-instantiated
            const wad = new Wad();
            wad.restore(wadData);
            return wad;
        });

        const wads = {};
        for (let i = 0; i < wadList.length; i++) {
            const wad = wadList[i];
            wads[wad.id] = wad;
        }

        return wads;
    }

    async saveWadsInLocalMemory(wads) {
        return localStorageManager.set('wads', wads);
    }

    preUploadFreedoom = () => {
        this.addGlobalMessage({
            type: 'info',
            id: 'freedoom1.wad',
            text: 'Uploading \'freedoom1.wad\'...',
        });
        this.addGlobalMessage({
            type: 'info',
            id: 'freedoom2.wad',
            text: 'Uploading \'freedoom2.wad\'...',
        });

        const freedoom1 = new Wad();
        freedoom1.readRemoteFile(
            '/public/freedoom1.wad',
            'freedoom1.wad',
            {},
            wad => this.addFreedoom(wad),
            true,
        );

        const freedoom2 = new Wad();
        freedoom2.readRemoteFile(
            '/public/freedoom2.wad',
            'freedoom2.wad',
            {},
            wad => this.addFreedoom(wad),
            true,
        );

        // dev: comment out when feature is ready
        // localStorageManager.set('freedoom-preloaded', true);
    }

    addFreedoom = (wad) => {
        if (wad.uploaded && wad.processed) {
            this.addWad(wad, false, true);
            this.dismissGlobalMessage(wad.id);
        }
    }

    addWad = (wad, isJSON) => {
        if (isJSON) {
            wad.deleteTempId();
        }

        this.setState((prevState) => {
            const updatedWads = {
                ...prevState.wads,
                [wad.id]: wad,
            };

            this.saveWadsInLocalMemory(updatedWads);

            return ({
                wads: updatedWads,
            });
        }, () => this.convertLumps({ wad }));
    }


    deleteWad = (wadId) => {
        this.setState((prevState) => {
            const {
                wads,
                selectedWad,
                selectedMidi,
                preselectedMidi,
            } = prevState;

            const filteredWadKeys = Object.keys(wads).filter(wadKey => wadKey !== wadId);

            const updatedWads = {};
            for (let i = 0; i < filteredWadKeys.length; i++) {
                const wad = wads[filteredWadKeys[i]];

                updatedWads[wad.id] = wad;
            }

            localStorageManager.set('wads', updatedWads);

            if (selectedWad && selectedWad.id === wadId) {
                window.location.hash = '#uploader';

                let updatedSelectedMidi = selectedMidi;
                let updatedPreselectedMidi = preselectedMidi;
                if (selectedMidi.wadId === selectedWad.id) {
                    updatedSelectedMidi = {};
                    updatedPreselectedMidi = false;
                }

                return ({
                    wads: updatedWads,
                    selectedWad: {},
                    selectedLump: {},
                    selectedMidi: { ...updatedSelectedMidi },
                    preselectedMidi: updatedPreselectedMidi,
                });
            }

            return ({ wads: updatedWads });
        });

        this.stopConvertingWadItems({ wadId });
    }

    deleteWads = () => {
        localStorageManager.set('wads', {});
        this.setState(() => ({
            wads: {},
            selectedWad: {},
            selectedLump: {},
            selectedMidi: {},
            preselectedMidi: false,
        }));
        this.stopConvertingAllWads();
    }

    selectWadAndLump = (lumpName, lumpType, wadId) => {
        this.selectWad(wadId);
        this.selectLumpType(lumpType);
        this.selectLump(lumpName, true);
    }

    selectWad = (wadId, init) => {
        this.setState((prevState) => {
            const selectedWad = prevState.wads[wadId];
            if (!selectedWad) {
                document.title = prefixWindowtitle;
                return {};
            }

            let selectedLump = {};

            if (prevState.selectedLump.name) {
                if (selectedWad.lumps[prevState.selectedLumpType][prevState.selectedLump.name]) {
                    selectedLump = { ...selectedWad.lumps[prevState.selectedLumpType][prevState.selectedLump.name] };
                }

                if (selectedLump.name) {
                    document.title = `${prefixWindowtitle} / ${selectedWad.name} / ${prevState.selectedLumpType} / ${prevState.selectedLump.name}`;
                } else {
                    document.title = `${prefixWindowtitle} / ${selectedWad.name} / ${prevState.selectedLumpType}`;
                }
            } else if (prevState.selectedLumpType) {
                if (selectedWad.lumps[prevState.selectedLumpType]) {
                    document.title = `${prefixWindowtitle} / ${selectedWad.name} / ${prevState.selectedLumpType}`;
                } else {
                    document.title = `${prefixWindowtitle} / ${selectedWad.name}`;
                }
            } else {
                document.title = `${prefixWindowtitle} / ${selectedWad.name}`;
            }

            return {
                selectedWad,
                selectedLump,
            };
        }, () => {
            if (init) {
                setTimeout(() => {
                    this.focusOnWad();
                }, 100);
            }

            // TODO: convert mus in the selected wad if any
        });
    }

    selectLump = (lumpName, init) => {
        this.setState((prevState) => {
            if (!prevState.selectedWad) {
                return {};
            }

            if (!prevState.selectedWad.lumps) {
                return {};
            }

            if (!prevState.selectedLumpType) {
                return {};
            }

            const selectedLump = prevState.selectedWad.lumps[prevState.selectedLumpType][lumpName];
            if (!selectedLump) {
                document.title = `${prefixWindowtitle} / ${prevState.selectedWad.name} / ${prevState.selectedLumpType}`;
                return {};
            }

            document.title = `${prefixWindowtitle} / ${prevState.selectedWad.name} / ${prevState.selectedLumpType} / ${selectedLump.name}`;

            return {
                selectedLump,
            };
        }, () => {
            if (init) {
                setTimeout(() => {
                    this.focusOnLump();
                }, 200);
            }
        });
    }

    selectLumpType = (lumpType) => {
        this.setState((prevState) => {
            if (!prevState.selectedWad.name) {
                return {};
            }

            document.title = `${prefixWindowtitle} / ${prevState.selectedWad.name} / ${lumpType}`;

            return {
                selectedLumpType: lumpType,
            };
        });
    }

    selectFirstMidi = ({ midis }) => {
        const { wads, selectedMidi } = this.state;

        if (selectedMidi.name) {
            return;
        }

        const wadIds = Object.keys(midis);

        if (wadIds.length > 0) {
            const firstWadId = wadIds[0];
            const midiIds = Object.keys(midis[firstWadId]);

            if (midiIds.length > 0) {
                const firstMidiId = midiIds[0];
                const firstMidiData = midis[firstWadId][firstMidiId];
                const wad = wads[firstWadId];
                const lump = wad && wad.lumps && wad.lumps.music && wad.lumps.music[firstMidiId];

                if (!lump) {
                    return;
                }

                this.setState(() => {
                    const newlySelectedMidi = {
                        data: URL.createObjectURL(new Blob([firstMidiData])),
                        lumpName: lump.name,
                        lumpType: lump.type,
                        wadId: firstWadId,
                        startedAt: 0,
                        time: 0,
                    };

                    return {
                        selectedMidi: newlySelectedMidi,
                        preselectedMidi: true,
                    };
                });
            }
        }
    }

    initMidiPlayer = () => {
        this.midiPlayer = new MidiPlayer({
            eventLogger: this.handleMidiPlayerEvent,
        });
    }

    handleMidiPlayerEvent = ({
        event,
        message,
        time,
        done,
        ...payload
    }) => {
        const midiPlayerMessagePrefix = 'Midi player:';
        console.log({
            event, message, time, payload,
        });

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
            break;
        }
        case MIDI_PLAY:
        case MIDI_PAUSE:
        case MIDI_RESUME: {
            const { globalMessages } = this.state;
            if (globalMessages[MIDI_STATUS]) {
                this.dismissGlobalMessage(MIDI_STATUS);
            }

            const roundedDownTime = Math.floor(time);

            const { selectedMidi: { time: previousTime = 0 } } = this.state;
            // The time played don't get updated exactly every second, but the line below is the best approximation we can get based on how MIDI work
            if (roundedDownTime >= previousTime) {
                this.setState(prevState => ({
                    selectedMidi: {
                        ...prevState.selectedMidi,
                        time: roundedDownTime,
                    },
                }));
            }

            break;
        }
        case MIDI_STOP: {
            this.dismissGlobalMessage(MIDI_STATUS);
            break;
        }
        }
    }

    selectMidi = ({
        midiURL,
        lump,
        wadId,
    }) => {
        if (!this.midiPlayer) {
            this.initMidiPlayer();
        }

        const success = this.midiPlayer.play(midiURL, lump.name);
        if (!success) {
            return;
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

    resumeMidi = () => {
        if (!this.midiPlayer) {
            this.initMidiPlayer();
        }

        let time = 0;
        let success;
        const { selectedMidi } = this.state;
        if (selectedMidi.paused) {
            success = this.midiPlayer.resume();
            time = selectedMidi.time;
        } else {
            success = this.midiPlayer.play(selectedMidi.data, selectedMidi.lumpName);
        }

        if (!success) {
            return;
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
        this.setState((prevState) => {
            const success = this.midiPlayer.pause();

            if (!success) {
                return {};
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

        this.setState((prevState) => {
            const success = this.midiPlayer.stop();

            if (!success) {
                return {};
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

    deselectAll = () => {
        document.title = `${prefixWindowtitle}`;
        this.setState(() => ({
            selectedWad: {},
            selectedLump: {},
        }));
    }

    focusOnWad = (keepState = true) => {
        const element = document.getElementById('wadDetails');
        if (element) {
            element.scrollIntoView();
            if (!keepState) {
                this.setState(() => ({
                    selectedLump: {},
                    selectedLumpType: '',
                }));
            }
        }
    }

    focusOnLump = () => {
        const element = document.getElementById('lumpDetails');
        if (element) {
            element.scrollIntoView();
        }
    }

    updateSelectedWadFromList = (updatedWad) => {
        this.setState(async (prevState) => {
            const wads = {
                ...prevState.wads,
                [updatedWad.id]: { ...updatedWad },
            };

            const result = await this.saveWadsInLocalMemory(wads);

            return {
                wads,
                selectedWad: updatedWad,
            };
        });
    }

    updateFilename = (name) => {
        const { selectedWad } = this.state;
        const wad = selectedWad;

        if (name === '') {
            const error = 'WAD filename can not be empty.';
            wad.errors.empty_filename = error;
        } else {
            wad.errors.empty_filename = '';
            wad.name = name;
            this.updateSelectedWadFromList(wad);
        }
    }

    getWADsAsObjectURL = () => {
        const { wads } = this.state;
        const wadIds = Object.keys(wads);
        const mappedWads = wadIds.map(wadId => wads[wadId]);
        const stringified = JSON.stringify(mappedWads);
        const blob = new Blob([stringified], {
            type: 'application/json',
        });

        const objectURL = URL.createObjectURL(blob);
        return objectURL;
    }

    addGlobalMessage = (message) => {
        const { id, text, type } = message;
        this.setState(prevState => ({
            globalMessages: {
                ...prevState.globalMessages,
                [id]: {
                    type,
                    text,
                },
            },
        }));
    }

    dismissGlobalMessage = (messageId) => {
        this.setState((prevState) => {
            const { globalMessages } = prevState;
            const globalMessageIds = Object.keys(globalMessages || {});
            const updatedGlobalMessages = {};

            for (let i = 0; i < globalMessageIds.length; i++) {
                const globalMessageId = globalMessageIds[i];
                if (globalMessageId !== messageId) {
                    updatedGlobalMessages[globalMessageId] = globalMessages[globalMessageId];
                }
            }

            return ({
                globalMessages: {
                    ...updatedGlobalMessages,
                },
            });
        });
    }

    componentDidCatch(error, info) {
        document.title = `${prefixWindowtitle} / oops!`;
        this.setState(() => ({ displayError: { error, info } }));
    }

    render() {
        const {
            displayError,
            wads,
            selectedWad,
            selectedLump,
            selectedLumpType,
            selectedMidi,
            midis,
            simpleImages,
            globalMessages,
        } = this.state;

        if (displayError.error) {
            return (
                <div className={style.app}>
                    <Header />
                    <div className={style.errorScreenOuter}>
                        <div className={style.errorScreenInner}>
                            <div className={style.errorMessage}>
                                <h2>An error occurred :(</h2>
                                Please
                                {' '}
                                <a
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    href={this.getWADsAsObjectURL()}
                                    download={`wadjs_error_${moment().utc().format('YYYY_MM_DD_HH_mm_ss')}.json`}
                                >
                                    download this file
                                </a>
                                {' '}
                                and use it with the message below to
                                {' '}
                                <a target="_blank" rel="noopener noreferrer" href={ISSUES}>report the issue</a>
                                {' '}
                                on GitHub.
                            </div>
                            <code>
                                Error:
                                {' '}
                                {displayError.error.message}
                                <br />
                                <br />
                                {displayError.error.stack && displayError.error.stack.split('\n').map((stack, index) => (
                                    <Fragment key={index}>
                                        {stack.replace('webpack-internal:///', '').replace('@', ' @ ')}
                                        <br />
                                    </Fragment>
                                ))}
                                {displayError.info.componentStack && displayError.info.componentStack.split('\n').map((stack, index) => (
                                    <Fragment key={index}>
                                        {stack}
                                        <br />
                                    </Fragment>
                                ))}
                                <br />
                                URL:
                                {' '}
                                {document.location.href}
                            </code>
                            <a className={style.errorBackLink} href="/">Reload the app.</a>
                        </div>
                    </div>
                    <BackToTop focusOnWad={this.focusOnWad} />
                </div>
            );
        }

        return (
            <div className={style.app}>
                <Header />
                <GlobalMessages
                    messages={globalMessages}
                    dismissGlobalMessage={this.dismissGlobalMessage}
                />
                <div className={style.main}>
                    <Logo />
                    <div className={style.top}>
                        <WadUploader
                            wads={wads}
                            addWad={this.addWad}
                            deselectAll={this.deselectAll}
                        />
                        {Object.keys(wads).length > 0 && (
                            <UploadedWadList
                                wads={wads}
                                selectedWad={selectedWad}
                                selectedLumpType={selectedLumpType}
                                selectedLump={selectedLump}
                                selectWad={this.selectWad}
                                deleteWad={this.deleteWad}
                                deleteWads={this.deleteWads}
                            />
                        )}
                    </div>
                    {selectedWad.id
                        && (
                            <WadDetails
                                selectedWad={selectedWad}
                                selectedLump={selectedLump}
                                selectedLumpType={selectedLumpType}
                                selectedMidi={selectedMidi}
                                midis={midis.converted[selectedWad.id]}
                                simpleImages={simpleImages.converted[selectedWad.id]}
                                selectWad={this.selectWad}
                                selectLump={this.selectLump}
                                selectLumpType={this.selectLumpType}
                                selectMidi={this.selectMidi}
                                stopMidi={this.stopMidi}
                                deleteWad={this.deleteWad}
                                updateFilename={this.updateFilename}
                                updateSelectedWadFromList={this.updateSelectedWadFromList}
                                focusOnWad={this.focusOnWad}
                                focusOnLump={this.focusOnLump}
                            />
                        )}
                </div>
                <div className={style.helper}>
                    {selectedWad.name && (
                        <div className={style.selectedWadOuter}>
                            <div className={style.selectedWadInner}>
                                {selectedWad.name}
                            </div>
                        </div>
                    )}
                    {selectedMidi.lumpName && (
                        <PortablePlayer
                            selectedMidi={selectedMidi}
                            selectedLumpType={selectedLumpType}
                            selectedWad={selectedWad}
                            resumeMidi={this.resumeMidi}
                            pauseMidi={this.pauseMidi}
                            stopMidi={this.stopMidi}
                            selectWadAndLump={this.selectWadAndLump}
                        />
                    )}
                    <BackToTop
                        selectLump={this.selectLump}
                        focusOnWad={this.focusOnWad}
                    />
                </div>
            </div>
        );
    }
}
