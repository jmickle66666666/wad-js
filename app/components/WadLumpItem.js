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
    focusOnLump,
}) => {
    if (!isSelectedLump({ selectedLump, lump })) {
        return (
            <a
                href={`#/${wad.id}/${selectedLumpType}/${lump.name}`}
                className={style.wadLumpOuter}
                onClick={() => selectLump(lump.name)}
            >
                <h4>{lump.name}</h4>
                <div className={style.wadLumpSummary}>
                    {lump.isImage && (
                        <div className={style.wadLumpImage}>
                            <img
                                title={`${lump.name} (${lump.width}×${lump.height})`}
                                alt={lump.name}
                                src={lump.data}
                            />
                        </div>
                    )}
                    <div>{lump.sizeInBytes}</div>
                </div>
            </a>
        );
    }

    return (
        <WadLumpDetails
            lump={lump}
            wad={wad}
            focusOnLump={focusOnLump}
        />
    );
};
