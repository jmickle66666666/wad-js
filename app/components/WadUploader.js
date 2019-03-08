import React, { Component, Fragment } from 'react';

import style from './WadUploader.scss';

import Wad from '../models/Wad';

import ErrorMessage from './ErrorMessage';

export default class WadUploader extends Component {
    state = { wad: {} }

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
        const wad = new Wad();
        wad.readRemoteFile(
            '/public/freedoom1.wad',
            this.updateWad,
        );
    }

    render() {
        const { wad } = this.state;
        return (
            <Fragment>
                <span id="uploader" />
                <div className={style.uploaderOuter}>
                    <h2 className={style.uploaderTitle}>Uploader</h2>
                    <div className={style.uploaderInner}>
                        <input type="file" onInput={this.handleLocalWadUpload} />
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
