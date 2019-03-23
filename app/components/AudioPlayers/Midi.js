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
    midi,
    lump,
    wad,
    selectedMidi,
    selectMidi,
    stopMidi,
}) => {
    const midiURL = URL.createObjectURL(new Blob([midi]));

    if (midi) {
        console.log({ selectedMidi, wad, lump });
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
            <ErrorMessage message="Could not convert MUS to MIDI." />
        );
    }

    return 'Loading...';
};
