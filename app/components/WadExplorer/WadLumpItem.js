import React from 'react';

import style from './WadLumpItem.scss';

import offscreenCanvasSupport from '../../lib/offscreenCanvasSupport';

import WadLumpDetails from './WadLumpDetails';
import Midi from '../AudioPlayers/Midi';
import ErrorMessage from '../Messages/ErrorMessage';

const { supported: offscreenCanvasSupported } = offscreenCanvasSupport();

const isSelectedLump = ({ selectedLump, lump }) => selectedLump && selectedLump.name === lump.name;

const renderImage = ({ lump, simpleImage }) => {
    if (!offscreenCanvasSupported || simpleImage === null) {
        return (
            <div>
                <ErrorMessage message="Could not load image." />
            </div>
        );
    }

    if (!simpleImage && lump.data.buffer) {
        return (
            <div className={style.loading}>Loading...</div>
        );
    }

    return (
        <div className={style.wadLumpImage}>
            <img
                title={`${lump.name} (${lump.width}×${lump.height})`}
                alt={lump.name}
                src={simpleImage ? URL.createObjectURL(new Blob([simpleImage])) : lump.data}
            />
        </div>
    );
};

export default ({
    lump,
    midi,
    simpleImage,
    text,
    wad,
    selectedLump,
    selectedLumpType,
    selectedMidi,
    selectLump,
    selectMidi,
    stopMidi,
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
                    {lump.isImage && renderImage({ lump, simpleImage })}
                    {lump.convertsToMidi && (
                        <Midi
                            midi={midi}
                            lump={lump}
                            wad={wad}
                            selectedMidi={selectedMidi}
                            selectMidi={selectMidi}
                            stopMidi={stopMidi}

                        />
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
            midi={midi}
            simpleImage={simpleImage}
            text={text}
            selectedMidi={selectedMidi}
            selectMidi={selectMidi}
            stopMidi={stopMidi}
            selectLump={selectLump}
            focusOnLump={focusOnLump}
        />
    );
};
