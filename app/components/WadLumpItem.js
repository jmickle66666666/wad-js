import React from 'react';

import style from './WadLumpItem.scss';

import WadLumpDetails from './WadLumpDetails';

const isSelectedLump = ({ selectedLump, lump }) => selectedLump && selectedLump.name === lump.name;

export default ({
    lump,
    selectedLump,
    wad,
    selectLump,
}) => {
    if (!isSelectedLump({ selectedLump, lump })) {
        return (
            <a
                href={`#/view/${wad.id}/lump/${lump.name}`}
                className={style.wadLumpOuter}
                onClick={() => selectLump(lump.name)}
            >
                <h4>{lump.name}</h4>
                <div>{lump.sizeInBytes}</div>
            </a>
        );
    }

    return (
        <WadLumpDetails
            lump={lump}
            wad={wad}
        />
    );
};
