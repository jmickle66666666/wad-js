import React from 'react';

import style from './WadLumpItem.scss';

import offscreenCanvasSupport from '../../lib/offscreenCanvasSupport';

import WadLumpDetails from './WadLumpDetails';
import Midi from '../AudioPlayers/Midi';
import PCM from '../AudioPlayers/PCM';
import ErrorMessage from '../Messages/ErrorMessage';

const { supported: offscreenCanvasSupported } = offscreenCanvasSupport();

const isSelectedLump = ({ selectedLump, lump }) => selectedLump && selectedLump.name === lump.name;

const renderImage = ({ lump, image }) => {
    if (!offscreenCanvasSupported || image === null) {
        return (
            <div>
                <ErrorMessage message="Could not load image." />
            </div>
        );
    }

    if (!image && lump.data.buffer) {
        return (
            <div className={style.loading}>Loading...</div>
        );
    }

    return (
        <div className={style.wadLumpImage}>
            <img
                title={`${lump.name} (${lump.width}×${lump.height})`}
                alt={lump.name}
                src={image ? URL.createObjectURL(new Blob([image])) : lump.data}
            />
        </div>
    );
};

export default ({
    lump,
    text,
    midi,
    pcm,
    simpleImage,
    complexImage,
    wad,
    selectedLump,
    selectedLumpType,
    selectedMidi,
    selectLump,
    selectMidi,
    stopMidi,
    selectedPCM,
    playPCM,
    stopPCM,
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
                    {lump.isImage && renderImage({ lump, image: simpleImage || complexImage })}
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
                    {lump.convertsToPCM && (
                        <PCM
                            pcm={pcm}
                            lump={lump}
                            wad={wad}
                            selectedPCM={selectedPCM}
                            playPCM={playPCM}
                            stopPCM={stopPCM}

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
            text={text}
            midi={midi}
            pcm={pcm}
            simpleImage={simpleImage}
            complexImage={complexImage}
            selectedMidi={selectedMidi}
            selectedPCM={selectedPCM}
            selectMidi={selectMidi}
            stopMidi={stopMidi}
            playPCM={playPCM}
            stopPCM={stopPCM}
            selectLump={selectLump}
            focusOnLump={focusOnLump}
        />
    );
};
