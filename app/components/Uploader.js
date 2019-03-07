import React from 'react';

import style from './Uploader.scss';

import ErrorMessage from './ErrorMessage';

export default ({ handleWadUpload, wad }) => (
    <div className={style.uploaderOuter}>
        <h2>Uploader</h2>
        <div className={style.uploaderInner}>
            <input type="file" onInput={handleWadUpload} />
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
);
