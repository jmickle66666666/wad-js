import React, { Fragment } from 'react';
import ReactRouterPropTypes from 'react-router-prop-types';
import moment from 'moment';

import style from './App.scss';

import Wad from '../models/Wad';

import { ThemeContext } from '../lib/Context';
import LocalStorageManager from '../lib/LocalStorageManager';
import offscreenCanvasSupport from '../lib/offscreenCanvasSupport';
import serviceWorkerSupport from '../lib/serviceWorkerSupport';
import {
    deleteCache,
    deleteAllCache,
} from '../lib/cacheManager';
import {
    SERVICE_WORKER_CORE,
    CHECKBOX,
} from '../lib/constants';

import Header from './Header';
import GlobalMessages from './Messages/GlobalMessages';
import Logo from './Logo';
import WadUploader from './Upload/WadUploader';
import UploadedWadList from './Upload/UploadedWadList';
import WadDetails from './WadExplorer/WadDetails';
import PortablePlayer from './AudioPlayers/PortablePlayer';
import SettingsMenu from './Settings/SettingsMenu';
import SettingsIcon from './Settings/SettingsIcon';

import AllMethods from './ViewMethods/AllMethods';

const localStorageManager = new LocalStorageManager();

const prefixWindowtitle = document.title;

const { message: offscreenCanvasSupportMessage } = offscreenCanvasSupport();

const {
    supported: serviceWorkerSupported,
    message: serviceWorkerSupportMessage,
} = serviceWorkerSupport();


export default class App extends AllMethods {
    static propTypes = {
        match: ReactRouterPropTypes.match.isRequired,
    }

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
        text: {
            queue: {},
            converted: {},
        },
        showSettings: false,
        settings: {
            theme: 'dark',
            playbackLoop: true,
            playNextTrack: true,
            offlineMode: true,
        },
        displayError: {},
    }

    async componentDidMount() {
        if (offscreenCanvasSupportMessage) {
            this.addGlobalMessage({
                type: 'error',
                id: 'offscreenCanvasSupport',
                text: offscreenCanvasSupportMessage,
            });
        }

        this.initMediaSession();

        const { result: settings } = await this.getSettingsFromLocalMemory();

        this.setState(prevState => ({
            settings: {
                ...prevState.settings,
                ...settings && { ...settings },
            },
        }), () => {
            const { settings: newSettings } = this.state;
            if (newSettings.offlineMode) {
                if (serviceWorkerSupported) {
                    this.registerCoreServiceWorkerAndListenForUpdate();
                } else {
                    this.addGlobalMessage({
                        type: 'warning',
                        id: 'offlineMode',
                        text: serviceWorkerSupportMessage,
                    });
                }
            }
        });

        this.addGlobalMessage({
            type: 'info',
            id: 'savedWads',
            text: 'Loading WADs from previous session...',
        });

        const { wads, error } = await this.getWadsFromLocalMemory();
        if (error) {
            this.dismissGlobalMessage('savedWads');
            this.addGlobalMessage({
                type: 'error',
                id: 'localForage',
                text: `localForage: ${error}`,
            });
        } else {
            this.setState(() => ({ wads }), () => {
                this.dismissGlobalMessage('savedWads');
                const wadIds = Object.keys(wads || {});
                wadIds.map(wadId => this.convertLumps({ wad: wads[wadId] }));
            });
        }

        const { result: freedoomPreloaded } = await localStorageManager.get('freedoom-preloaded');
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

    async getWadsFromLocalMemory() {
        const { result: savedWads, error } = await localStorageManager.get('wads');

        if (error) {
            return { error };
        }

        if (!savedWads) {
            return { wads: {} };
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

        return { wads };
    }

    async saveWadsInLocalMemory(wads) {
        const { error } = await localStorageManager.set('wads', wads);
        if (error) {
            this.addGlobalMessage({
                type: 'error',
                id: 'localForage',
                text: `localForage: ${error}`,
            });
        }
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
        localStorageManager.set('freedoom-preloaded', true);
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

            return ({ wads: updatedWads });
        }, () => this.convertLumps({ wad }));
    }


    deleteWad = (wadId) => {
        this.setState((prevState) => {
            const {
                wads,
                selectedWad,
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

                return ({
                    wads: updatedWads,
                    selectedWad: {},
                    selectedLump: {},
                });
            }

            deleteCache({ cacheId: wadId });

            return ({ wads: updatedWads });
        }, () => this.stopConvertingWadItems({ wadId }));
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
        deleteAllCache();
        this.stopConvertingAllWads();
        this.clearMidiPlayer();
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
                    selectedLump = {
                        ...selectedWad.lumps[prevState.selectedLumpType][prevState.selectedLump.name],
                    };
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

    selectLump = (lumpName, init, newLumpType) => {
        this.setState((prevState) => {
            const lumpType = newLumpType || prevState.selectedLumpType;
            if (!prevState.selectedWad) {
                return {};
            }

            if (!prevState.selectedWad.lumps) {
                return {};
            }

            if (!lumpType) {
                return {};
            }

            if (!prevState.selectedWad.lumps[lumpType]) {
                return {};
            }

            const selectedLump = prevState.selectedWad.lumps[lumpType][lumpName];

            if (!selectedLump && !newLumpType) {
                document.title = `${prefixWindowtitle} / ${prevState.selectedWad.name} / ${lumpType}`;
                return {};
            }

            document.title = `${prefixWindowtitle} / ${prevState.selectedWad.name} / ${lumpType} / ${selectedLump.name}`;

            return {
                selectedLump,
                ...newLumpType && { selectedLumpType: newLumpType },
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
        this.setState((prevState) => {
            const updatedWads = {
                ...prevState.wads,
                [updatedWad.id]: { ...updatedWad },
            };

            this.saveWadsInLocalMemory(updatedWads);

            return {
                wads: updatedWads,
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

    toggleSettingsMenu = () => {
        this.setState(prevState => ({
            showSettings: !prevState.showSettings,
        }));
    }

    handleSettingChange = async ({ key, value, type }) => {
        if (key === 'offlineMode') {
            if (value) {
                const { error } = await this.registerCoreServiceWorker();
                if (error) {
                    return;
                }
            } else {
                this.unregisterServiceWorkers({ targetScriptURL: SERVICE_WORKER_CORE });
            }
        }

        if (type === CHECKBOX) {
            this.setState(prevState => ({
                settings: {
                    ...prevState.settings,
                    [key]: value,
                },
            }), () => {
                const { settings } = this.state;
                this.saveSettingsInLocalMemory(settings);

                if (key === 'theme') {
                    toggleThemeOnBody(value);
                    if (localStorage) {
                        localStorage.setItem('wadjs-theme', value);
                    }
                }
            });
        }
    }

    getSettingsFromLocalMemory = async () => localStorageManager.get('settings')

    saveSettingsInLocalMemory = settings => localStorageManager.set('settings', settings)

    getThemeClass = () => {
        const { settings: { theme } } = this.state;
        const themeClass = `${theme}-theme`;
        const themeClassRules = style[themeClass];
        return themeClassRules;
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
            text,
            globalMessages,
            showSettings,
            settings,
        } = this.state;

        if (displayError.error) {
            return (
                <ThemeContext.Provider value={settings.theme}>
                    <div className={`${style.app} ${this.getThemeClass()}`}>
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
                    </div>
                </ThemeContext.Provider>
            );
        }

        return (
            <ThemeContext.Provider value={settings.theme}>
                <div className={`${style.app} ${this.getThemeClass()}`}>
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
                                    text={text.converted[selectedWad.id]}
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
                    {
                        showSettings && (
                            <SettingsMenu
                                settings={settings}
                                handleSettingChange={this.handleSettingChange}
                                toggleSettingsMenu={this.toggleSettingsMenu}
                                addGlobalMessage={this.addGlobalMessage}
                            />
                        )
                    }
                    <div className={style.helper}>
                        {selectedWad.name && (
                            <div className={style.selectedWadOuter}>
                                <a
                                    href={`# /${selectedWad.id} ${selectedLumpType ? `/${selectedLumpType}` : ''} ${selectedLump.name ? `/${selectedLump.name}` : ''} `}
                                    className={style.selectedWadInner}
                                    onClick={this.focusOnWad}
                                >
                                    {selectedWad.name}
                                </a>
                            </div>
                        )}
                        {selectedMidi.lumpName && (
                            <PortablePlayer
                                selectedMidi={selectedMidi}
                                selectedLumpType={selectedLumpType}
                                selectedWad={selectedWad}
                                selectNextMidi={this.selectNextMidi}
                                resumeMidi={this.resumeMidi}
                                pauseMidi={this.pauseMidi}
                                stopMidi={this.stopMidi}
                                selectWadAndLump={this.selectWadAndLump}
                            />
                        )}
                        <SettingsIcon toggleSettingsMenu={this.toggleSettingsMenu} />
                    </div>
                </div>
            </ThemeContext.Provider>
        );
    }
}
