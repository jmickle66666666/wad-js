import React, { Component } from 'react';

import style from './Midi.scss';

import ErrorMessage from '../ErrorMessage';

const midiIsPlaying = ({ selectedMidi, wad, lump }) => (
    selectedMidi
    && selectedMidi.startedAt
    && selectedMidi.wadId === wad.id
    && selectedMidi.lumpName === lump.name
);

export default ({
    globalPlayer,
    midi,
    lump,
    wad,
    selectedMidi,
    selectMidi,
    startMidi,
    stopMidi,
    customClass,
    children,
}) => {
    if (globalPlayer) {
        const midiURL = URL.createObjectURL(new Blob([selectedMidi.data]));
        return (
            <div className={style.playerButton}>
                {
                    selectedMidi.startedAt
                        ? (
                            <div className={customClass} onClick={stopMidi}>
                                <span>⏹️️</span>
                                {children}
                            </div>
                        ) : (
                            <div className={customClass} onClick={() => startMidi({ midiURL })}>
                                <span>▶️</span>
                                {children}
                            </div>
                        )
                }
            </div>
        );
    }

    const midiURL = URL.createObjectURL(new Blob([midi]));
    if (midi) {
        return (
            <div className={style.playerButton}>
                {
                    midiIsPlaying({ selectedMidi, wad, lump })
                        ? (
                            <span onClick={(event) => {
                                // we don't want to show the lump detailed view when interacting with the player
                                event.stopPropagation();
                                stopMidi();
                            }}
                            >
                                ⏹️️
                            </span>
                        ) : (
                            <span onClick={(event) => {
                                // we don't want to show the lump detailed view when interacting with the player
                                event.stopPropagation();
                                selectMidi({
                                    midiURL,
                                    lump,
                                    wadId: wad.id,
                                });
                            }}
                            >
                                ▶️
                            </span>
                        )
                }
            </div>
        );
    }

    if (midi === false) {
        return (
            <div>
                <ErrorMessage message="Could not convert MUS to MIDI." />
            </div>
        );
    }

    return <div className={style.loading}>Loading...</div>;
};
