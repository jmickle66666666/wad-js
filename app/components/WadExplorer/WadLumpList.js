import React from 'react';

import style from './WadLumpList.scss';

import Help from '../Help';
import WadLumpItem from './WadLumpItem';

export default ({
    wad,
    selectedLump,
    selectedLumpType,
    selectedMidi,
    midis,
    selectLump,
    selectMidi,
    stopMidi,
    focusOnWad,
    focusOnLump,
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
                                    midi={midis && midis[lumpName]}
                                    lump={lump}
                                    wad={wad}
                                    selectedLump={selectedLump}
                                    selectedLumpType={selectedLumpType}
                                    selectedMidi={selectedMidi}
                                    selectLump={selectLump}
                                    selectMidi={selectMidi}
                                    stopMidi={stopMidi}
                                    focusOnLump={focusOnLump}
                                />
                            )
                    ) || null;
                })}
            </div>
        </div>
    </div>
);
