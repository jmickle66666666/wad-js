import React from 'react';

import style from './WadMetadata.scss';

export default wad => (
    <div className={style.wadMetadataOuter}>
        <h3 className={style.wadMetadataTitle}>
            Metadata
        </h3>
        <div className={style.wadMetadataInner} />
    </div>
);
