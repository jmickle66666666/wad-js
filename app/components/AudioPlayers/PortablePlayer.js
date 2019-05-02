import React, { Fragment } from 'react';

import style from './PortablePlayer.scss';

import Midi from './Midi';

const convertToDisplayTime = (time) => {
    let seconds = time % 60;
    let minutes = time > 59 ? (time - seconds) / 60 : 0;

    if (seconds < 10) {
        seconds = `0${seconds}`;
    }

    if (minutes < 10) {
        minutes = `0${minutes}`;
    }

    return `${minutes}:${seconds}`;
};

export default ({
    selectedMidi,
    selectedLumpType,
    selectedWad,
    resumeMidi,
    pauseMidi,
    stopMidi,
    selectNextMidi,
    selectWadAndLump,
}) => (
    <Midi
        globalPlayer
        selectedMidi={selectedMidi}
        resumeMidi={resumeMidi}
        pauseMidi={pauseMidi}
        stopMidi={stopMidi}
        selectNextMidi={selectNextMidi}
        customClass={style.player}
    >
        <a
            className={style.songName}
            href={`#${selectedMidi.wadId}/${selectedMidi.lumpType}/${selectedMidi.lumpName}`}
            onClick={() => selectWadAndLump(
                selectedMidi.lumpName,
                selectedMidi.lumpType,
                selectedMidi.wadId,
            )}
        >
            {selectedMidi.lumpName}
        </a>
        <div className={style.dataBlock}>
                -
            </div>
        <div className={style.dataBlock}>
            {convertToDisplayTime(selectedMidi.time)}
        </div>
    </Midi>
);
