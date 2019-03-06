import React from 'react';

import style from './Uploader.scss';

import ErrorMessage from './ErrorMessage';

export default ({ handleWadUpload, wad: { progress, name, errors } }) => (
    <div className={style.uploader}>
        <h2>Uploader</h2>
        <input type="file" onInput={handleWadUpload} />
        {progress && (
            <div className={style.loaded}>
                {progress}
                % loaded
            </div>
        )}
        {errors && errors.map(error => <ErrorMessage key={error} message={error} />)}
    </div>
);
