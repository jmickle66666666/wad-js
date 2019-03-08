import React, { Component, Fragment } from 'react';

import style from './WadUploader.scss';

import Wad from '../models/Wad';

import ErrorMessage from './ErrorMessage';

export default class WadUploader extends Component {
    state = { wad: { errors: [] } }

    updateWad = (wad) => {
        this.setState(() => ({ wad }));

        if (wad.errors.length === 0 && wad.bytesLoaded === wad.size) {
            const { addWad } = this.props;
            addWad(wad);
        }
    }

    handleLocalWadUpload = (event) => {
        const wad = new Wad();
        wad.readLocalFile(
            event.target.files[0],
            this.updateWad,
        );
    }

    handleRemoteWadUpload = () => {
        const {
            remoteWadUrl,
            remoteWadFilename,
        } = this.state;
        const wad = new Wad();

        this.setState(() => ({
            wad: {
                errors: [],
            },
        }));

        if (!remoteWadUrl) {
            this.setState(prevState => ({
                wad: {
                    errors: [
                        ...prevState.wad.errors,
                        'WAD URL can not be empty.',
                    ],
                },
            }));
        }

        if (!remoteWadFilename) {
            this.setState(prevState => ({
                wad: {
                    errors: [
                        ...prevState.wad.errors,
                        'WAD filename can not be empty.',
                    ],
                },
            }));
        }

        if (!remoteWadUrl || !remoteWadFilename) {
            return;
        }

        wad.readRemoteFile(
            remoteWadUrl,
            remoteWadFilename,
            this.updateWad,
        );
    }

    saveRemoteWadMetadata = (event) => {
        const { id, value } = event.target;
        this.setState(() => ({
            [id]: value,
        }));
    }

    render() {
        const { wad } = this.state;
        return (
            <Fragment>
                <span id="uploader" />
                <div className={style.uploaderOuter}>
                    <h2 className={style.uploaderTitle}>Uploader</h2>
                    <div className={style.uploaderInner}>
                        <label htmlFor="localInput" className={style.uploaderInput}>
                            <div className={style.uploaderLabel}>From device:</div>
                            <input id="localInput" type="file" onInput={this.handleLocalWadUpload} />
                        </label>
                        <label htmlFor="remoteUrl" className={style.uploaderInput}>
                            <div className={style.uploaderLabel}>From URL:</div>
                            <div className={style.remoteInputOuter}>
                                <div className={style.remoteInputInner}>
                                    <input id="remoteWadUrl" placeholder="https://" onInput={this.saveRemoteWadMetadata} />
                                    <input id="remoteWadFilename" placeholder="doom.wad" onInput={this.saveRemoteWadMetadata} />
                                </div>
                                <button onClick={this.handleRemoteWadUpload}>Upload from URL</button>
                            </div>
                        </label>
                        {wad.uploadedPercentage && (
                            <div className={style.loaded}>
                                {wad.uploadedPercentage}
                                % loaded
                            </div>
                        )}
                        {wad.uploaded && (
                            <div className={style.processed}>
                                {wad.indexLumpCount}
                                /
                                {wad.headerLumpCount}
                                {' '}
                                lumps processed
                            </div>
                        )}
                        {wad.errors && wad.errors.map(error => <ErrorMessage key={error} message={error} />)}
                    </div>
                </div>
            </Fragment>
        );
    }
}
