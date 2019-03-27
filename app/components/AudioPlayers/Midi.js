import React from 'react';

import style from './Midi.scss';

import ErrorMessage from '../Messages/ErrorMessage';

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
            <div className={style.player}>
                <div className={customClass}>
                    {
                        selectedMidi.startedAt && !selectedMidi.paused
                            ? (
                                <span
                                    role="button"
                                    onClick={pauseMidi}
                                    onKeyPress={pauseMidi}
                                    tabIndex={0}
                                >
                                    <span role="img" aria-label="pause">
                                        ⏸️
                                    </span>
                                </span>
                            ) : (
                                <span
                                    role="button"
                                    onClick={resumeMidi}
                                    onKeyPress={resumeMidi}
                                    tabIndex={0}
                                >
                                    <span role="img" aria-label="play">
                                        ▶️
                                    </span>
                                </span>
                            )
                    }
                    <span
                        className={style.stop}
                        role="button"
                        onClick={stopMidi}
                        onKeyPress={pauseMidi}
                        tabIndex={0}
                    >
                        <span role="img" aria-label="stop">
                            ⏹️
                        </span>
                    </span>
                    {children}
                </div>
            </div>
        );
    }

    const midiURL = URL.createObjectURL(new Blob([midi]));
    if (midi) {
        const handleStopMidi = () => {
            // we don't want to show the lump detailed view when interacting with the player
            stopMidi();
        };

        const handleSelectMidi = () => {
            // we don't want to show the lump detailed view when interacting with the player
            selectMidi({
                midiURL,
                lump,
                wadId: wad.id,
            });
        };

        return (
            <div className={style.player}>
                {
                    midiIsPlaying({ selectedMidi, wad, lump })
                        ? (
                            <span
                                role="button"
                                onClick={handleStopMidi}
                                onKeyPress={handleStopMidi}
                                tabIndex={0}
                            >
                                <span role="img" aria-label="stop">
                                    ⏹️
                                </span>
                            </span>
                        ) : (
                            <span
                                role="button"
                                onClick={handleSelectMidi}
                                onKeyPress={handleSelectMidi}
                                tabIndex={0}
                            >
                                <span role="img" aria-label="play">
                                    ▶️
                                </span>
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
