import React from 'react';

import style from './Uploader.scss';

export default ({ handleWadUpload, wad: { progress, name, error } }) => (
    <div className={style.uploader}>
        <h2>Uploader</h2>
        <input type="file" onInput={handleWadUpload} />
        {progress && (
            <div className={style.loaded}>
                {progress}
                % loaded
            </div>
        )}
        {error && (
            <div className={style.error}>
                Error:
                {' '}
                {error}
            </div>
        )}
    </div>
);
