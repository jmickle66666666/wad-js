import React, { Fragment } from 'react';

import style from './WadLumpDetails.scss';

import WadLumpDetailDisplay from './WadLumpDetailDisplay';

export default ({
    lump,
    wad,
    midi,
    simpleImage,
    selectedMidi,
    selectMidi,
    stopMidi,
    focusOnLump,
}) => (
    <Fragment>
        <span id="lumpDetails" className={style.wadLumpDetailsAnchor} />
        <div className={style.wadLumpDetailsOuter}>
            <h4 onClick={focusOnLump} className={style.wadLumpDetailsTitle}>
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
                    midi={midi}
                    simpleImage={simpleImage}
                    selectedMidi={selectedMidi}
                    selectMidi={selectMidi}
                    stopMidi={stopMidi}
                />
            </div>
        </div>
    </Fragment>
);
