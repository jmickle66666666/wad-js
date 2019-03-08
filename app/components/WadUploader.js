import React, { Component, Fragment } from 'react';

import style from './WadUploader.scss';

import Wad from '../models/Wad';

import ErrorMessage from './ErrorMessage';

export default class WadUploader extends Component {
    state = {
        wad: { errors: [] },
        remoteWadUrl: '',
        remoteWadFilename: '',
        untouchedFilename: true,
    }

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
            wad,
            remoteWadUrl,
            remoteWadFilename,
        } = this.state;
        return (
            <Fragment>
                <span id="uploader" />
                <div className={style.uploaderOuter}>
                    <h2 className={style.uploaderTitle}>Uploader</h2>
                    <div className={style.uploaderInner}>
                        <label htmlFor="localInput" className={style.uploaderInput}>
                            <div className={style.uploaderLabel}>From device:</div>
                            <input
                                id="localInput"
                                type="file"
                                onInput={this.handleLocalWadUpload}
                                accept=".wad,.zip,.pk3"
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
                                <button onClick={this.handleRemoteWadUpload}>Upload from URL</button>
                            </div>
                        </label>
                        <div>Supported formats: .wad, .zip, .pk3</div>
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
