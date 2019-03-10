import React, { Component } from 'react';

import style from './App.scss';

import Wad from '../models/Wad';

import LocalStorageManager from '../lib/LocalStorageManager';

import Header from './Header';
import Logo from './Logo';
import WadUploader from './WadUploader';
import WadList from './WadList';
import WadDetails from './WadDetails';

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
        };
    }

    componentDidMount() {
        const freedoomPreloaded = localStorageManager.get('freedoom-preloaded');
        if (!freedoomPreloaded) {
            this.preUploadFreedoom();
        }

        const { match } = this.props;
        const { params } = match;
        const { wadName, lumpName } = params;
        if (wadName) {
            this.selectWad(wadName, true);
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
        if (wad.errorIds.length === 0 && wad.bytesLoaded === wad.size && wad.indexLumpCount === wad.headerLumpCount) {
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

            return ({
                wads: updatedWads,
            });
        });
    }

    selectWad = (wadId, init) => {
        this.setState((prevState) => {
            const selectedWad = prevState.wads[wadId];
            if (!selectedWad) {
                document.title = prefixWindowtitle;
                return {};
            }

            document.title = `${prefixWindowtitle} / ${selectedWad.name}`;

            return {
                selectedWad,
                selectedLump: {},
            };
        }, () => {
            if (init) {
                setTimeout(() => {
                    const element = document.getElementById('wadDetails');
                    if (element) {
                        element.scrollIntoView();
                    }
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

            const selectedLump = prevState.selectedWad.lumps[lumpName];
            if (!selectedLump) {
                document.title = `${prefixWindowtitle} / ${prevState.selectedWad.name}`;
                return {};
            }

            document.title = `${prefixWindowtitle} / ${prevState.selectedWad.name} / ${selectedLump.name}`;

            return {
                selectedLump,
            };
        }, () => {
            if (init) {
                setTimeout(() => {
                    const element = document.getElementById('lumpDetails');
                    if (element) {
                        element.scrollIntoView();
                    }
                }, 200);
            }
        });
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
        } = this.state;
        return (
            <div className={style.app}>
                <Header />
                <div className={style.main}>
                    <Logo />
                    <div className={style.top}>
                        <WadUploader addWad={this.addWad} />
                        {Object.keys(wads).length > 0 && (
                            <WadList
                                wads={wads}
                                selectedWad={selectedWad}
                                deleteWad={this.deleteWad}
                                selectWad={this.selectWad}
                            />
                        )}
                    </div>
                    {selectedWad.id
                        && (
                            <WadDetails
                                selectedWad={selectedWad}
                                selectedLump={selectedLump}
                                selectLump={this.selectLump}
                                updateFilename={this.updateFilename}
                            />
                        )}
                </div>
            </div>
        );
    }
}
