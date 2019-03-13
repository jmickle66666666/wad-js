import React, { Fragment } from 'react';

import style from './WadDetails.scss';

import WadMetadata from './WadMetadata';
import WadLumpTypes from './WadLumpTypes';
import WadLumpList from './WadLumpList';

export default ({
    selectedWad: wad,
    selectedLump,
    selectedLumpType,
    selectLump,
    selectLumpType,
    updateFilename,
    focusOnWad,
    focusOnLump,
}) => (
    <Fragment>
        <span id="wadDetails" className={style.wadDetailsAnchor} />
        <a href={`#/${wad.id}`} onClick={() => focusOnWad(false)}>
            <h2 className={style.wadDetailsTitle}>
                {wad.name}
            </h2>
        </a>
        <WadMetadata
            wad={wad}
            updateFilename={updateFilename}
            focusOnWad={focusOnWad}
        />
        <WadLumpTypes
            wad={wad}
            selectedLumpType={selectedLumpType}
            selectLumpType={selectLumpType}
        />
        {
            wad.lumps[selectedLumpType] && (
                <WadLumpList
                    wad={wad}
                    selectedLump={selectedLump}
                    selectedLumpType={selectedLumpType}
                    selectLump={selectLump}
                    focusOnWad={focusOnWad}
                    focusOnLump={focusOnLump}
                />
            )
        }
    </Fragment>
);
