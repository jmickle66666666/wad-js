import React, { Fragment } from 'react';

import style from './WadLumpDetails.scss';

import WadLumpDetailDisplay from './WadLumpDetailDisplay';

export default ({
    lump,
    wad,
    text,
    midi,
    pcm,
    simpleImage,
    complexImage,
    map,
    selectedMidi,
    selectedPCM,
    selectMidi,
    stopMidi,
    playPCM,
    stopPCM,
    focusOnLump,
    selectLump,
}) => (
    <Fragment>
        <span id="lumpDetails" className={style.wadLumpDetailsAnchor} />
        <div className={style.wadLumpDetailsOuter}>
            <h4
                className={style.wadLumpDetailsTitle}
                onClick={focusOnLump}
                onKeyPress={focusOnLump}
            >
                {lump.name}
            </h4>
            <div className={style.wadLumpDetailsInner}>
                <div className={style.wadLumpDetailsEntry}>
                        Type:
                    {' '}
                    {lump.type}
                </div>
                {lump.originalFormat && (
                    <div className={style.wadLumpDetailsEntry}>
                            Format:
                        {' '}
                        {lump.originalFormat}
                    </div>
                )}
                <div className={style.wadLumpDetailsEntry}>
                        Size:
                    {' '}
                    {lump.sizeInBytes}
                </div>
                <WadLumpDetailDisplay
                    wad={wad}
                    lump={lump}
                    text={text}
                    midi={midi}
                    pcm={pcm}
                    simpleImage={simpleImage}
                    complexImage={complexImage}
                    map={map}
                    selectedMidi={selectedMidi}
                    selectedPCM={selectedPCM}
                    selectMidi={selectMidi}
                    stopMidi={stopMidi}
                    playPCM={playPCM}
                    stopPCM={stopPCM}
                    selectLump={selectLump}
                />
            </div>
        </div>
    </Fragment>
);
