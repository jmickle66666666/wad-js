import React, { Component } from 'react';

import style from './App.scss';

import Wad from '../models/Wad';
import Lump from '../models/Lump';

import LocalStorageManager from '../lib/LocalStorageManager';

import Header from './Header';
import Logo from './Logo';
import WadUploader from './WadUploader';
import WadList from './WadList';
import WadDetails from './WadDetails';
import BackToTop from './BackToTop';

const localStorageManager = new LocalStorageManager();

const { NODE_ENV } = process.env;

if (NODE_ENV === 'development') {
    document.title += ' [dev]';
}

const prefixWindowtitle = document.title;

export default class App extends Component {
    constructor() {
        super();
        const wads = this.getSavedWads();

        this.state = {
            wads,
            selectedWad: {},
            selectedLump: {},
            selectedLumpType: '',
        };
    }

    componentDidMount() {
        const freedoomPreloaded = localStorageManager.get('freedoom-preloaded');
        if (!freedoomPreloaded) {
            this.preUploadFreedoom();
        }

        const { match } = this.props;
        const { params } = match;
        const { wadName, lumpName, lumpType } = params;

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

    getSavedWads() {
        const savedWads = localStorageManager.get('wads');

        if (!savedWads) {
            return {};
        }

        let jsonWads = {};
        try {
            jsonWads = JSON.parse(savedWads);
        } catch (error) {
            console.error('Could not parse WADs in local storage.', error);
            return {};
        }

        const wadsData = Object.keys(jsonWads).map(wadId => jsonWads[wadId]);

        const wadList = wadsData.map((wadData) => {
            // Wad instances must be re-instantiated
            const wad = new Wad();
            wad.restore(wadData);

            const lumps = {};
            Object.keys(wad.lumps).map((lumpType) => {
                const lumpTypes = {};
                Object.keys(wad.lumps[lumpType]).map((lumpName) => {
                    // Lump instances must be re-instantiated
                    const lump = new Lump();
                    lump.setIndexData(wad.lumps[lumpType][lumpName]);
                    lumpTypes[lumpName] = lump;
                    return null;
                });
                lumps[lumpType] = lumpTypes;

                return null;
            });

            wad.lumps = lumps;

            return wad;
        });

        const wads = {};
        for (let i = 0; i < wadList.length; i++) {
            const wad = wadList[i];
            wads[wad.id] = wad;
        }

        return wads;
    }

    preUploadFreedoom = () => {
        const freedoom1 = new Wad();
        freedoom1.readRemoteFile(
            '/public/freedoom1.wad',
            'freedoom1.wad',
            this.addFreedoom,
            true,
        );

        const freedoom2 = new Wad();
        freedoom2.readRemoteFile(
            '/public/freedoom2.wad',
            'freedoom2.wad',
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

    addWad = (wad) => {
        this.setState((prevState) => {
            const updatedWads = {
                ...prevState.wads,
                [wad.id]: wad,
            };

            localStorageManager.set('wads', updatedWads);

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

    deselectAll = () => {
        document.title = `${prefixWindowtitle}`;
        this.setState(() => ({
            selectedWad: {},
            selectedLump: {},
        }));
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

    focusOnWad = () => {
        const element = document.getElementById('wadDetails');
        if (element) {
            element.scrollIntoView();
        }
    }

    focusOnLump = () => {
        const element = document.getElementById('lumpDetails');
        if (element) {
            element.scrollIntoView();
        }
    }

    updateSelectedWadFromList = (updatedWad) => {
        this.setState(prevState => ({
            wads: {
                ...prevState.wads,
                [updatedWad.id]: updatedWad,
            },
        }));
    }

    updateFilename = (name) => {
        const { selectedWad } = this.state;
        const wad = { ...selectedWad };

        if (name === '') {
            const error = 'WAD filename can not be empty.';
            wad.errors.empty_filename = error;
        } else {
            wad.errors.empty_filename = '';
            wad.name = name;
            this.updateSelectedWadFromList(wad);
        }

        this.setState(() => ({
            selectedWad: wad,
        }));
    }

    render() {
        const {
            wads,
            selectedWad,
            selectedLump,
            selectedLumpType,
        } = this.state;
        return (
            <div className={style.app}>
                <Header />
                <div className={style.main}>
                    <Logo />
                    <div className={style.top}>
                        <WadUploader
                            addWad={this.addWad}
                            deselectAll={this.deselectAll}
                        />
                        {Object.keys(wads).length > 0 && (
                            <WadList
                                wads={wads}
                                selectedWad={selectedWad}
                                deleteWad={this.deleteWad}
                                selectWad={this.selectWad}
                                selectedLumpType={selectedLumpType}
                                selectedLump={selectedLump}
                            />
                        )}
                    </div>
                    {selectedWad.id
                        && (
                            <WadDetails
                                selectedWad={selectedWad}
                                selectedLump={selectedLump}
                                selectedLumpType={selectedLumpType}
                                selectLump={this.selectLump}
                                selectLumpType={this.selectLumpType}
                                updateFilename={this.updateFilename}
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
