import React from 'react';

import style from './WadLumpList.scss';

import Help from '../Help';
import WadLumpItem from './WadLumpItem';

export default ({
    wad,
    selectedLump,
    selectedLumpType,
    selectedMidi,
    text,
    midis,
    simpleImages,
    complexImages,
    selectLump,
    selectMidi,
    stopMidi,
    focusOnWad,
    focusOnLump,
}) => (
    <div className={style.wadLumpsOuter}>
        <Help id="wad-lumps" title="the lumps panel">
            <h3
                className={style.wadLumpsTitle}
            >
                <div
                    role="button"
                    onClick={focusOnWad}
                    onKeyPress={focusOnWad}
                    tabIndex={0}
                >
                    {selectedLumpType}

                </div>
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
                                    text={text && text[lumpName]}
                                    midi={midis && midis[lumpName]}
                                    simpleImage={simpleImages && simpleImages[lumpName]}
                                    complexImage={complexImages && complexImages[lumpName]}
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
