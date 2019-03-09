import React from 'react';

import style from './WadMetadata.scss';

import Help from './Help';
import ErrorMessageList from './ErrorMessageList';

export default ({ wad, updateFilename }) => (
    <div className={style.wadMetadataOuter}>
        <Help id="wad-metadata" title="the metadata panel">
            <h3 className={style.wadMetadataTitle}>
                Metadata
            </h3>
        </Help>
        <div className={style.wadMetadataInner}>
            <ErrorMessageList errors={wad.errors} />
            <div>
                <label>
                    Filename:
                    <input value={wad.name} onChange={event => updateFilename(event.target.value)} />
                </label>
            </div>
        </div>
    </div>
);
