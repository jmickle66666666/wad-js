import React, { Component, Fragment } from 'react';
import moment from 'moment';

import style from './App.scss';

import Wad from '../models/Wad';

import { WORKER_MIDI_CONVERTER } from '../lib/constants';
import LocalStorageManager from '../lib/LocalStorageManager';

import Header from './Header';
import Logo from './Logo';
import WadUploader from './Upload/WadUploader';
import UploadedWadList from './Upload/UploadedWadList';
import WadDetails from './WadExplorer/WadDetails';
import BackToTop from './BackToTop';
import Supervisor from '../models/Supervisor';

const localStorageManager = new LocalStorageManager();

const prefixWindowtitle = document.title;

export default class App extends Component {
    state = {
        wads: {},
        selectedWad: {},
        selectedLump: {},
        selectedLumpType: '',
        midis: {},
        displayError: {},
    }

    supervisor = new Supervisor()

    async componentDidMount() {
        const wads = await this.getWadsFromLocalMemory();
        this.setState(() => ({
            wads,
        }));

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

    saveConvertedMidi = (payload) => {
        console.log('MIDI Converter Worker is done. ', { payload });
        const { wadId, lumpId, midi } = payload.data;
        this.setState((prevState) => {
            const { midis } = prevState;
            const wadMidis = midis[wadId];
            return {
                midis: {
                    ...midis,
                    [wadId]: {
                        ...wadMidis,
                        [lumpId]: midi,
                    },
                },
            };
        });
    }

    startMidiConverterWorker() {
        this.supervisor.midiConverter.worker.terminate();
        this.supervisor.midiConverter.restart();
        this.supervisor.midiConverter.worker.onmessage = this.saveConvertedMidi;
        this.supervisor.midiConverter.worker.onerror = this.workerError;
    }

    convertAllMusToMidi({ wad }) {
        console.log('Converting...');
        this.startMidiConverterWorker();

        const musLumpIds = Object.keys(wad.lumps.music);
        const musTracks = musLumpIds.map(musLumpId => wad.lumps.music[musLumpId]).filter((musLump) => {
            const alreadyExists = this.state.midis[wad.id] && this.state.midis[wad.id][musLump.name];
            return musLump.originalFormat === 'MUS' && !alreadyExists;
        });

        musTracks.map((lump) => {
            this.supervisor.midiConverter.worker.postMessage({
                wadId: wad.id,
                lumpId: lump.name,
                data: lump.data,
            });
            return null;
        });
    }

    convertMusToMidi({ wadId, lumpId, data }) {
        this.startMidiConverterWorker();
        this.supervisor.midiConverter.worker.postMessage({ wadId, lumpId, data });
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
            this.convertAllMusToMidi({ wad });
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

            this.convertAllMusToMidi({ wad });

            return ({
                wads: updatedWads,
            });
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
            if (!prevState.selectedWad) {
                return {};
            }

            document.title = `${prefixWindowtitle} / ${prevState.selectedWad.name} / ${lumpType}`;

            return {
                selectedLumpType: lumpType,
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

    componentDidCatch(error, info) {
        document.title = `${prefixWindowtitle} / oops!`;
        this.setState(() => ({ displayError: { error, info } }));
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

    render() {
        const {
            displayError,
            wads,
            selectedWad,
            selectedLump,
            selectedLumpType,
            midis,
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

        console.log({ midis });
        return (
            <div className={style.app}>
                <Header />
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
                                midis={midis[selectedWad.id]}
                                selectWad={this.selectWad}
                                selectLump={this.selectLump}
                                selectLumpType={this.selectLumpType}
                                deleteWad={this.deleteWad}
                                updateFilename={this.updateFilename}
                                updateSelectedWadFromList={this.updateSelectedWadFromList}
                                focusOnWad={this.focusOnWad}
                                focusOnLump={this.focusOnLump}
                            />
                        )}
                </div>
                <BackToTop focusOnWad={this.focusOnWad} />
            </div>
        );
    }
}
