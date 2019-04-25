import React, { Fragment } from 'react';

import style from './WadLumpDetails.scss';

import WadLumpDetailDisplay from './WadLumpDetailDisplay';

export default ({
    lump,
    wad,
    text,
    midi,
    simpleImage,
    complexImage,
    selectedMidi,
    selectMidi,
    stopMidi,
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
                    simpleImage={simpleImage}
                    complexImage={complexImage}
                    selectedMidi={selectedMidi}
                    selectMidi={selectMidi}
                    stopMidi={stopMidi}
                    selectLump={selectLump}
                />
            </div>
        </div>
    </Fragment>
);
