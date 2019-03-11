import React, { Fragment } from 'react';

import style from './WadDetails.scss';

import WadMetadata from './WadMetadata';
import WadLumpList from './WadLumpList';

export default ({
    selectedWad: wad,
    selectedLump,
    selectLump,
    updateFilename,
    focusOnWad,
    focusOnLump,
}) => (
    <Fragment>
        <span id="wadDetails" className={style.wadDetailsAnchor} />
        <h2 className={style.wadDetailsTitle} onClick={focusOnWad}>
            {wad.name}
        </h2>
        <WadMetadata
            wad={wad}
            updateFilename={updateFilename}
            focusOnWad={focusOnWad}
        />
        <WadLumpList
            wad={wad}
            selectedLump={selectedLump}
            selectLump={selectLump}
            focusOnWad={focusOnWad}
            focusOnLump={focusOnLump}
        />
    </Fragment>
);
