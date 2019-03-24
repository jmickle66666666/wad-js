import React, { Component } from 'react';

import style from './Midi.scss';

import ErrorMessage from '../ErrorMessage';

const midiIsPlaying = ({ selectedMidi, wad, lump }) => (
    selectedMidi
    && !selectedMidi.paused
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
    resumeMidi,
    pauseMidi,
    stopMidi,
    customClass,
    children,
}) => {
    if (globalPlayer) {
        return (
            <div className={style.playerButton}>
                <div className={customClass}>
                    {
                        selectedMidi.startedAt && !selectedMidi.paused
                            ? (
                                <div onClick={pauseMidi}>
                                    ⏸️
                                </div>
                            ) : (
                                <div onClick={resumeMidi}>
                                    ▶️
                                </div>
                            )
                    }
                    <div className={style.stop} onClick={stopMidi}>
                        ⏹️
                    </div>
                    {children}
                </div>
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
                                stopMidi();
                            }}
                            >
                                ⏹️
                            </span>
                        ) : (
                            <span onClick={(event) => {
                                // we don't want to show the lump detailed view when interacting with the player
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
