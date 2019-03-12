import React from 'react';

import style from './WadLumpItem.scss';

import WadLumpDetails from './WadLumpDetails';

const isSelectedLump = ({ selectedLump, lump }) => selectedLump && selectedLump.name === lump.name;

export default ({
    lump,
    selectedLump,
    wad,
    selectLump,
    selectedLumpType,
}) => {
    if (!isSelectedLump({ selectedLump, lump })) {
        return (
            <a
                href={`#/${wad.id}/${selectedLumpType}/${lump.name}`}
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
