import React, { Fragment } from 'react';

import style from './WadDetails.scss';

import WadMetadata from './WadMetadata';
import WadLumpList from './WadLumpList';

export default ({
    selectedWad: wad,
    selectedLump,
    selectLump,
    updateFilename,
}) => (
    <Fragment>
        <span id="wadDetails" className={style.wadDetailsAnchor} />
        <h2 className={style.wadDetailsTitle}>
            {wad.name}
        </h2>
        <WadMetadata
            wad={wad}
            updateFilename={updateFilename}
        />
        <WadLumpList
            wad={wad}
            selectedLump={selectedLump}
            selectLump={selectLump}
        />
    </Fragment>
);
