import React from 'react';
import moment from 'moment';

import style from './WadMetadata.scss';

import Help from './Help';
import ErrorMessageList from './ErrorMessageList';

export default ({
    wad,
    updateFilename,
    focusOnWad,
}) => (
    <div className={style.wadMetadataOuter}>
        <Help id="wad-metadata" title="the metadata panel">
            <h3 className={style.wadMetadataTitle} onClick={focusOnWad}>
                    Metadata
                </h3>
        </Help>
        <div className={style.wadMetadataInner}>
            <ErrorMessageList errors={wad.errors} />
            <h4 className={style.wadMetadataSubtitle}>General</h4>
            <div className={style.wadMetadataTable}>
                <label htmlFor="filename" className={style.wadMetadataEntry}>
                    <div className={style.wadMetadataLabel}>
                            Filename:
                    </div>
                    <input
                        id="filename"
                        className={style.wadMetadataValue}
                        value={wad.name}
                        onChange={event => updateFilename(event.target.value)}
                    />
                </label>
                <div className={style.wadMetadataEntry}>
                    <div className={style.wadMetadataLabel}>Type:</div>
                    <div className={style.wadMetadataValue}>{wad.wadType}</div>
                </div>
                <div className={style.wadMetadataEntry}>
                    <div className={style.wadMetadataLabel}>Lump count:</div>
                    <div className={style.wadMetadataValue}>{wad.headerLumpCount}</div>
                </div>
                <div className={style.wadMetadataEntry}>
                    <div className={style.wadMetadataLabel}>Size:</div>
                    <div className={style.wadMetadataValue}>
                        {wad.megabyteSize}
                        {' '}
                    </div>
                </div>
            </div>
            <h4 className={style.wadMetadataSubtitle}>Upload</h4>
            <div className={style.wadMetadataTable}>
                <div className={style.wadMetadataEntry}>
                    <div className={style.wadMetadataLabel}>Uploaded on:</div>
                    <div className={style.wadMetadataValue}>
                        <small>{moment(wad.uploadEndAt).format('M/D/YYYY h:mm a')}</small>

                    </div>
                </div>
                <div className={style.wadMetadataEntry}>
                    <div className={style.wadMetadataLabel}>Uploaded with:</div>
                    <div className={style.wadMetadataValue}>
                        {wad.uploadedWith}
                    </div>
                </div>
                {wad.uploadedFrom && (
                    <div className={style.wadMetadataCentered}>
                            Uploaded from
                        {' '}
                        <a href={wad.uploadedFrom}>{wad.uploadedFrom}</a>
                            .
                    </div>
                )}
            </div>
        </div>
    </div>
);
