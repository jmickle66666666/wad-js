import React, { Component, Fragment } from 'react';
import moment from 'moment';

import style from './App.scss';

import MidiConverter from '../workers/midiConverter';
import SimpleImageConverter from '../workers/simpleImageConverter';
import MapParser from '../workers/mapParser';

import Wad from '../models/Wad';

import LocalStorageManager from '../lib/LocalStorageManager';
import offscreenCanvasSupport from '../lib/offscreenCanvasSupport';

import Header from './Header';
import GlobalErrors from './Messages/GlobalErrors';
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
        globalErrors: {},
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

    constructor(props) {
        super(props);


        if (offscreenCanvasSupportMessage) {
            const { state } = this;
            this.state = {
                ...state,
                globalErrors: {
                    ...state.globalErrors,
                    offscreenCanvasSupport: offscreenCanvasSupportMessage,
                },
            };
        }
    }

    midiConverter = new MidiConverter()

    simpleImageConverter = new SimpleImageConverter();

    mapParser = new MapParser();

    async componentDidMount() {
        const wads = await this.getWadsFromLocalMemory();
        this.setState(() => ({
            wads,
        }), () => {
            const { wads } = this.state;
            const wadIds = Object.keys(wads || {});
            wadIds.map((wadId) => {
                this.addToMidiConversionQueue({ wad: wads[wadId] });
                this.addToSimpleImageConversionQueue({ wad: wads[wadId] });
                return null;
            });
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

    workerError(error) {
        console.error('A worker errored out.', { error });
    }

    startWorker({
        id,
        instance,
        onmessage = () => { },
        onerror = () => { },
    }) {
        this[id] = new instance();
        this[id].onmessage = onmessage;
        this[id].onerror = onerror;
    }

    updateWorkerWadQueue = ({
        wad,
        id,
        items,
        newQueue,
        newConvertedItems,
    }) => {
        const wadItems = items.queue[wad.id];
        return {
            [id]: {
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

    moveItemFromWadQueueToConvertedItems = ({
        id,
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
            [id]: {
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

    removeItemFromQueue = ({ id, wadId, lumpId }) => {
        // didn't work: remove item from queue (otherwise, we get stuck in infinite loop)
        this.setState((prevState) => {
            const items = prevState[id];
            const wadQueueIds = Object.keys(items.queue[wadId] || {});
            const updatedWadQueue = {};
            for (let i = 0; i < wadQueueIds.length; i++) {
                const lumpName = wadQueueIds[i];
                if (lumpName !== lumpId) {
                    updatedWadQueue[lumpName] = { ...items.queue[wadId][lumpName] };
                }
            }

            return {
                [id]: {
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

    getNextItemInQueue = ({ id, wadId }) => {
        const { [id]: { queue } } = this.state;

        let nextLump = {};

        const currentWadQueueIds = Object.keys(queue[wadId] || {});

        console.log({ currentWadQueueIds });

        if (currentWadQueueIds.length > 0) {
            nextLump = queue[wadId][currentWadQueueIds[0]];
            return {
                nextLump,
                nextWadId: wadId,
            };
        }

        const wadIds = Object.keys(queue);

        console.log({ wadIds, queue });

        let foundLumps = false;
        let j = 0;
        while (!foundLumps) {
            if (j === wadIds.length) {
                break;
            }

            const nextWadId = wadIds[j];
            const nextWadQueue = queue[nextWadId];
            const nextWadQueueIds = Object.keys(nextWadQueue);

            console.log({ nextWadQueueIds });

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

        console.log(`Conversion queue for '${id}' is empty.`);
        return { done: true };
    }

    // Midi converter

    startMidiConverterWorker() {
        this.startWorker({
            id: 'midiConverter',
            id2: 'midi',
            instance: MidiConverter,
            onmessage: this.saveConvertedMidi,
            onerror: this.workerError,
        });
    }

    addToMidiConversionQueue({ wad }) {
        if (!wad.lumps.music) {
            return;
        }

        const musicLumpIds = Object.keys(wad.lumps.music);
        const musTracks = musicLumpIds
            .map(musLumpId => wad.lumps.music[musLumpId])
            .filter((musLump) => {
                const { midis } = this.state;
                const alreadyExists = (
                    midis.converted[wad.id]
                    && midis.converted[wad.id][musLump.name]
                );
                return musLump.originalFormat === 'MUS' && !alreadyExists;
            });

        const musLumps = {};
        for (let i = 0; i < musTracks.length; i++) {
            const lump = musTracks[i];
            musLumps[lump.name] = { ...lump };
        }

        if (musTracks.length > 0) {
            const { done } = this.getNextItemInQueue({
                id: 'midis',
                wadId: wad.id,
            });
            if (done) {
                const firstLump = { ...musTracks[0] };
                this.startMidiConverterWorker();
                this.midiConverter.postMessage({
                    wadId: wad.id,
                    lumpId: firstLump.name,
                    data: firstLump.data,
                });
            }
        }

        const midiTracks = musicLumpIds
            .map(musLumpId => wad.lumps.music[musLumpId])
            .filter((musLump) => {
                const { midis } = this.state;
                const alreadyExists = (
                    midis.converted[wad.id]
                    && midis.converted[wad.id][musLump.name]
                );
                return musLump.originalFormat === 'MIDI' && !alreadyExists;
            });

        const midiLumps = {};
        for (let i = 0; i < midiTracks.length; i++) {
            const lump = midiTracks[i];
            const { data: midi } = lump;
            midiLumps[lump.name] = midi;
        }


        this.setState((prevState) => {
            const { midis } = prevState;

            return this.updateWorkerWadQueue({
                wad,
                id: 'midis',
                items: midis,
                newQueue: musLumps,
                newConvertedItems: midiLumps,
            });
        }, () => {
            const { preselectedMidi, midis: { converted: midis } } = this.state;
            if (!preselectedMidi && midiTracks.length > 0) {
                this.selectFirstMidi({ midis });
            }
        });
    }

    saveConvertedMidi = (payload) => {
        const { wadId, lumpId, midi } = payload.data;

        // didn't work: remove MUS from queue (otherwise, we get stuck in infinite loop)
        if (!midi) {
            this.removeItemFromQueue({ id: 'midis', wadId, lumpId });
        }

        // it worked
        this.setState((prevState) => {
            const { midis } = prevState;
            return this.moveItemFromWadQueueToConvertedItems({
                id: 'midis',
                wadId,
                lumpId,
                items: midis,
                newItem: midi,
            });
        }, () => {
            const { nextLump, nextWadId, done } = this.getNextItemInQueue({
                id: 'midis',
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
            id: 'simpleImageConverter',
            id2: 'image',
            instance: SimpleImageConverter,
            onmessage: this.saveConvertedSimpleImage,
            onerror: this.workerError,
        });
    }

    addToSimpleImageConversionQueue({ wad }) {
        if (!offscreenCanvasSupported) {
            return;
        }

        if (!wad.lumps.flats) {
            return;
        }

        const flatLumpIds = Object.keys(wad.lumps.flats);
        const flats = flatLumpIds
            .map(flatLumpId => wad.lumps.flats[flatLumpId])
            .filter((flatLump) => {
                const { simpleImages } = this.state;
                const alreadyExists = (
                    simpleImages.converted[wad.id]
                    && simpleImages.converted[wad.id][flatLump.name]
                );
                return !alreadyExists;
            });

        const flatLumps = {};
        for (let i = 0; i < flats.length; i++) {
            const lump = flats[i];
            flatLumps[lump.name] = { ...lump };
        }

        if (flats.length > 0) {
            const { done } = this.getNextItemInQueue({
                id: 'simpleImages',
                wadId: wad.id,
            });
            if (done) {
                const firstLump = { ...flats[0] };
                this.startSimpleImageConverterWorker();
                this.simpleImageConverter.postMessage({
                    wadId: wad.id,
                    lump: firstLump,
                    palette: wad && wad.palette,
                });
            }
        }

        this.setState((prevState) => {
            const { simpleImages } = prevState;

            return this.updateWorkerWadQueue({
                wad,
                id: 'simpleImages',
                items: simpleImages,
                newQueue: flatLumps,
                newConvertedItems: {},
            });
        });
    }

    saveConvertedSimpleImage = (payload) => {
        const { wadId, lumpId, image } = payload.data;

        // didn't work: remove MUS from queue (otherwise, we get stuck in infinite loop)
        if (!image) {
            this.removeItemFromQueue({ id: 'simpleImages', wadId, lumpId });
        }

        // it worked
        this.setState((prevState) => {
            const { simpleImages } = prevState;
            return this.moveItemFromWadQueueToConvertedItems({
                id: 'simpleImages',
                wadId,
                lumpId,
                items: simpleImages,
                newItem: image,
            });
        }, () => {
            const { nextLump, nextWadId, done } = this.getNextItemInQueue({
                id: 'simpleImages',
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
        const freedoom1 = new Wad();
        freedoom1.readRemoteFile(
            '/public/freedoom1.wad',
            'freedoom1.wad',
            {},
            this.addFreedoom,
            true,
        );

        const freedoom2 = new Wad();
        freedoom2.readRemoteFile(
            '/public/freedoom2.wad',
            'freedoom2.wad',
            {},
            this.addFreedoom,
            true,
        );

        // dev: comment out when feature is ready
        // localStorageManager.set('freedoom-preloaded', true);
    }

    addFreedoom = (wad) => {
        if (wad.uploaded && wad.processed) {
            this.addWad(wad);
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
        }, () => {
            this.addToMidiConversionQueue({ wad });
            this.addToSimpleImageConversionQueue({ wad });
        });
    }


    deleteWad = (wadId) => {
        this.setState((prevState) => {
            const { wads } = prevState;

            const filteredWadKeys = Object.keys(wads).filter(wadKey => wadKey !== wadId);

            const updatedWads = {};
            for (let i = 0; i < filteredWadKeys.length; i++) {
                const wad = wads[filteredWadKeys[i]];

                updatedWads[wad.id] = wad;
            }

            localStorageManager.set('wads', updatedWads);

            if (prevState.selectedWad && prevState.selectedWad.id === wadId) {
                window.location.hash = '#uploader';

                return ({
                    wads: updatedWads,
                    selectedWad: {},
                    selectedLump: {},
                });
            }

            return ({
                wads: updatedWads,
            });
        });
    }

    deleteWads = () => {
        localStorageManager.set('wads', {});
        this.setState(() => ({
            wads: {},
            selectedWad: {},
            selectedLump: {},
        }));
    }

    selectWad = async (wadId, init) => {
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

                    console.log({ newlySelectedMidi });

                    return {
                        selectedMidi: newlySelectedMidi,
                        preselectedMidi: true,
                    };
                });
            }
        }
    }

    initMidiPlayer = () => {
        MIDIjs.player_callback = this.updateMidiTimePlayer;
        MIDIjs.initialized = true;
    }

    updateMidiTimePlayer = ({ time }) => {
        const roundedDownTime = Math.ceil(time);

        const { selectedMidi: { time: previousTime = 0 } } = this.state;
        // The time played don't get updated exactly every second, but the line below is the best approximation we can get based on how MIDI work
        if (roundedDownTime <= previousTime) {
            return;
        }

        this.setState(prevState => ({
            selectedMidi: {
                ...prevState.selectedMidi,
                time: roundedDownTime,
            },
        }));
    }

    selectMidi = ({
        midiURL,
        lump,
        wadId,
        lastRetry,
    }) => {
        if (typeof MIDIjs === 'undefined' && !lastRetry) {
            console.error('MIDIjs not initialized. Retry in 1 second.');
            setTimeout(() => this.selectMidi({
                midiURL,
                lump,
                wadId,
                lastRetry: true,
            }), 1000);
            return;
        }

        if (!MIDIjs.initialized) {
            this.initMidiPlayer();
        }

        MIDIjs.play(midiURL);

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

    resumeMidi = (lastRetry) => {
        if (typeof MIDIjs === 'undefined' && !lastRetry) {
            console.error('MIDIjs not initialized. Retry in 1 second.');
            setTimeout(() => this.startMidi(true), 1000);
            return;
        }

        if (!MIDIjs.initialized) {
            this.initMidiPlayer();
        }

        let time = 0;
        const { selectedMidi } = this.state;
        if (selectedMidi.paused) {
            MIDIjs.resume();
            time = selectedMidi.time;
        } else {
            MIDIjs.play(selectedMidi.data);
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

    pauseMidi = (lastRetry) => {
        if (typeof MIDIjs === 'undefined' && !lastRetry) {
            console.error('MIDIjs not initialized. Retry in 1 second.');
            setTimeout(() => this.pauseMidi(true), 1000);
            return;
        }

        this.setState((prevState) => {
            MIDIjs.pause();

            const selectedMidi = {
                ...prevState.selectedMidi,
                paused: true,
            };

            return {
                selectedMidi,
            };
        });
    }

    stopMidi = (lastRetry) => {
        if (typeof MIDIjs === 'undefined' && !lastRetry) {
            console.error('MIDIjs not initialized. Retry in 1 second.');
            setTimeout(() => this.stopMidi(true), 1000);
            return;
        }

        if (!MIDIjs.initialized) {
            this.initMidiPlayer();
        }

        const { selectedMidi: prevSelectedMidi } = this.state;
        if (prevSelectedMidi.time === 0) {
            return;
        }

        this.setState((prevState) => {
            MIDIjs.stop();

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

    dismissGlobalError = (errorId) => {
        this.setState((prevState) => {
            const { globalErrors } = prevState;
            const globalErrorIds = Object.keys(globalErrors || {});
            const updatedGlobalErrors = {};

            for (let i = 0; i < globalErrorIds.length; i++) {
                const globalErrorId = globalErrorIds[i];
                if (globalErrorId !== errorId) {
                    updatedGlobalErrors[globalErrorId] = globalErrors[globalErrorId];
                }
            }

            return ({
                globalErrors: {
                    ...updatedGlobalErrors,
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
            globalErrors,
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
                <GlobalErrors
                    errors={globalErrors}
                    dismissGlobalError={this.dismissGlobalError}
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
                            focusOnLump={this.focusOnLump}
                        />
                    )}
                    <BackToTop focusOnWad={this.focusOnWad} />
                </div>
            </div>
        );
    }
}
