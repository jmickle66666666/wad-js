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
    startMidi,
    stopMidi,
}) => (
    <Midi
        globalPlayer
        selectedMidi={selectedMidi}
        startMidi={startMidi}
        stopMidi={stopMidi}
        customClass={style.player}
    >
        <div className={style.songName}>
            {selectedMidi.lumpName}
        </div>
        <Fragment>
            <div className={style.dataBlock}>
                    -
            </div>
            <div className={style.dataBlock}>
                {convertToDisplayTime(selectedMidi.time)}
            </div>
        </Fragment>
    </Midi>
);
