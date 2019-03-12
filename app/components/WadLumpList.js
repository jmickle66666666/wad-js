import React from 'react';

import style from './WadLumpList.scss';

import Help from './Help';
import WadLumpItem from './WadLumpItem';

export default ({
    wad,
    selectedLump,
    selectedLumpType,
    selectLump,
    focusOnWad,
}) => (
    <div className={style.wadLumpsOuter}>
        <Help id="wad-lumps" title="the lumps panel">
            <h3 className={style.wadLumpsTitle} onClick={focusOnWad}>
                {selectedLumpType}
            </h3>
        </Help>
        <div className={style.wadLumpsInner}>
            <div className={style.wadLumpsList}>
                {Object.keys(wad.lumps[selectedLumpType]).map((lumpName) => {
                    const lump = wad.lumps[selectedLumpType][lumpName];
                    return (lump
                            && (
                                <WadLumpItem
                                    key={lumpName}
                                    lump={lump}
                                    selectedLump={selectedLump}
                                    selectedLumpType={selectedLumpType}
                                    wad={wad}
                                    selectLump={selectLump}
                                />
                            )
                    ) || null;
                })}
            </div>
        </div>
    </div>
);
