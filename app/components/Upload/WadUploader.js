
import React, { Component, Fragment } from 'react';
import moment from 'moment';
import posed from 'react-pose';

import { getInternalWads } from '../../lib/wadUtils';

import style from './WadUploader.scss';

import rocket from '../../assets/rocket.png';

import Wad from '../../models/Wad';

import Help from '../Help';
import ErrorMessage from '../ErrorMessage';
import ErrorMessageList from '../ErrorMessageList';
import WarningMessageList from '../WarningMessageList';

const Rocket = posed.div({
    loading: {
        marginLeft: ({ uploadedPercentage }) => uploadedPercentage,
    },
});

export default class WadUploader extends Component {
    state = {
        iwad: '',
        wads: {
        },
        remoteWadErrors: [],
        remoteWadUrl: '',
        remoteWadFilename: '',
        untouchedFilename: true,
    }

    updateWad = (wad) => {
        this.setState((prevState) => {
            const updatedWads = {
                ...prevState.wads,
                [wad.id]: wad,
            };

            return {
                wads: updatedWads,
            };
        });

        if (wad.uploaded && wad.processed) {
            const { addWad } = this.props;
            addWad(wad);
        }
    }

    getIWadData = () => {
        const { iwad } = this.state;
        const { wads: uploadedWads } = this.props;
        return uploadedWads[iwad] || {};
    }

    handleSelectIWad = (event) => {
        const { value: iwad } = event.target;
        this.setState(() => ({
            iwad,
        }));
    }

    handleLocalWadUpload = (event) => {
        const wads = event.target.files;

        this.setState(() => ({
            wads: {},
            remoteWadErrors: [],
        }));

        for (let i = 0; i < wads.length; i++) {
            const wad = new Wad();
            wad.readLocalFile(
                wads[i],
                this.getIWadData(),
                this.updateWad,
            );
        }
    }

    handleRemoteWadUpload = () => {
        const {
            remoteWadUrl,
            remoteWadFilename,
        } = this.state;
        const wad = new Wad();

        this.setState(() => ({
            wads: {},
            remoteWadErrors: [],
        }));

        if (!remoteWadUrl) {
            this.setState(prevState => ({
                remoteWadErrors: [
                    ...prevState.remoteWadErrors,
                    'WAD URL can not be empty.',
                ],
            }));
        }

        if (!remoteWadFilename) {
            this.setState(prevState => ({
                remoteWadErrors: [
                    ...prevState.remoteWadErrors,
                    'WAD filename can not be empty.',
                ],
            }));
        }

        if (!remoteWadUrl || !remoteWadFilename) {
            return;
        }

        wad.readRemoteFile(
            remoteWadUrl,
            remoteWadFilename,
            this.getIWadData(),
            this.updateWad,
        );

        this.setState(() => ({
            untouchedFilename: true,
        }));
    }

    saveRemoteWadMetadata = (event) => {
        const { id, value } = event.target;
        this.setState(() => ({
            [id]: value,
        }));

        const { untouchedFilename } = this.state;
        if (id === 'remoteWadUrl' && untouchedFilename) {
            const filename = value.substring(value.lastIndexOf('/') + 1);
            this.setState(() => ({
                remoteWadFilename: filename,
            }));
        }

        if (id === 'remoteWadFilename') {
            this.setState(() => ({
                untouchedFilename: false,
            }));
        }
    }

    render() {
        const {
            wads: uploadedWads,
            deselectAll,
        } = this.props;
        const {
            iwad,
            wads,
            remoteWadErrors,
            remoteWadUrl,
            remoteWadFilename,
        } = this.state;
        const iwads = getInternalWads(uploadedWads);
        return (
            <Fragment>
                <span id="uploader" />
                <div className={style.uploaderOuter}>
                    <Help id="uploader" title="how to use the uploader">
                        <a href="#/uploader" onClick={deselectAll}>
                            <h2 className={style.uploaderTitle}>Uploader</h2>
                        </a>
                    </Help>
                    <div className={style.uploaderInner}>
                        <label htmlFor="iwadInput" className={style.uploaderInput}>
                            <div className={style.uploaderLabel}>IWAD:</div>
                            <select
                                id="iwadInput"
                                className={style.iWadInputInner}
                                value={iwad}
                                onChange={this.handleSelectIWad}
                            >
                                <option value="">
                                    None
                                </option>
                                {
                                    iwads.length > 0 && iwads.map(wad => (
                                        <option key={wad.id} value={wad.id}>
                                            {wad.name}
                                            {' '}
                                            (uploaded
                                            {' '}
                                            {moment(wad.uploadEndAt).format('M/D/YY [at] h:mma')}
                                            )
                                        </option>
                                    ))
                                }
                            </select>
                        </label>
                        <label htmlFor="localInput" className={style.uploaderInput}>
                            <div className={style.uploaderLabel}>From device:</div>
                            <input
                                id="localInput"
                                type="file"
                                onInput={this.handleLocalWadUpload}
                                accept=".wad,.zip,.pk3"
                                multiple
                            />
                        </label>
                        <label htmlFor="remoteUrl" className={style.uploaderInput}>
                            <div className={style.uploaderLabel}>From URL:</div>
                            <div className={style.remoteInputOuter}>
                                <div className={style.remoteInputInner}>
                                    <input
                                        id="remoteWadUrl"
                                        value={remoteWadUrl}
                                        placeholder="https://"
                                        onChange={this.saveRemoteWadMetadata}
                                    />
                                    <input
                                        id="remoteWadFilename"
                                        value={remoteWadFilename}
                                        placeholder="doom.wad"
                                        onChange={this.saveRemoteWadMetadata}
                                    />
                                </div>
                                <button type="button" onClick={this.handleRemoteWadUpload}>Upload from URL</button>
                            </div>
                        </label>
                        <div>Supported formats: .wad, .zip, .pk3</div>
                        {Object.keys(wads).length > 0 && Object.keys(wads).map((wadKey) => {
                            const wad = wads[wadKey];
                            return (
                                <div key={wad.id} className={style.uploaderFeedback}>
                                    <div>{wad.name}</div>
                                    {
                                        wad.uploadedPercentage && (
                                            <div>
                                                <div className={style.loadingContainer}>
                                                    <div className={style.loaded}>
                                                        {wad.uploadedPercentage}
                                                        % loaded
                                                    </div>
                                                    <div className={style.rocketContainer}>
                                                        <Rocket
                                                            pose="loading"
                                                            poseKey={wad.errorIds.length > 0 ? 100 : wad.uploadedPercentage}
                                                            uploadedPercentage={`${wad.errorIds.length > 0 ? '100' : wad.uploadedPercentage}%`}
                                                        >
                                                            <img
                                                                className={style.loadingRocket}
                                                                src={rocket}
                                                            />
                                                        </Rocket>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                    {
                                        wad.uploaded && (
                                            <div className={style.processed}>
                                                {wad.indexLumpCount}
                                                /
                                                {wad.headerLumpCount}
                                                {' '}
                                                lumps processed
                                            </div>
                                        )
                                    }
                                    <ErrorMessageList errors={wad.errors} />
                                    <WarningMessageList warnings={wad.warnings} />
                                </div>
                            );
                        })}
                        {remoteWadErrors && remoteWadErrors.map(error => <ErrorMessage key={error} message={error} />)}
                    </div>
                </div>
            </Fragment>
        );
    }
}
