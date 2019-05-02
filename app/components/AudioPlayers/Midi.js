import React, { Fragment } from 'react';

import style from './Midi.scss';

import PlayIcon from '../../icons/Play';
import PauseIcon from '../../icons/Pause';
import StopIcon from '../../icons/Stop';
import ForwardIcon from '../../icons/Forward';

import ErrorMessage from '../Messages/ErrorMessage';

const midiIsPlaying = ({ selectedMidi, wad, lump }) => (
    selectedMidi
    && !selectedMidi.paused
    && !selectedMidi.ended
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
    selectNextMidi,
    customClass,
    children,
}) => {
    if (globalPlayer) {
        const { startedAt, paused, ended } = selectedMidi;
        return (
            <div className={style.portablePlayer}>
                <div className={customClass}>
                    {
                        startedAt && !paused && !ended
                            ? (
                                <Fragment>
                                    <div
                                        role="button"
                                        onClick={pauseMidi}
                                        onKeyPress={pauseMidi}
                                        tabIndex={0}
                                    >
                                        <PauseIcon inverted />
                                    </div>
                                    <div
                                        className={style.stop}
                                        role="button"
                                        onClick={stopMidi}
                                        onKeyPress={stopMidi}
                                        tabIndex={0}
                                    >
                                        <StopIcon inverted />
                                    </div>
                                </Fragment>
                            ) : (
                                <Fragment>
                                    <div
                                        role="button"
                                        onClick={resumeMidi}
                                        onKeyPress={resumeMidi}
                                        tabIndex={0}
                                    >
                                        <PlayIcon inverted />
                                    </div>
                                    <div
                                        className={style.forward}
                                        role="button"
                                        onClick={selectNextMidi}
                                        onKeyPress={selectNextMidi}
                                        tabIndex={0}
                                    >
                                        <ForwardIcon inverted />
                                    </div>
                                </Fragment>
                            )
                    }
                    {children}
                </div>
            </div>
        );
    }

    if (midi) {
        const handleStopMidi = () => {
            // we don't want to show the lump detailed view when interacting with the player
            stopMidi();
        };

        const handleSelectMidi = () => {
            // we don't want to show the lump detailed view when interacting with the player
            selectMidi({
                midiURL: midi,
                lump,
                wadId: wad.id,
            });
        };

        return (
            <div className={style.player}>
                {
                    midiIsPlaying({ selectedMidi, wad, lump })
                        ? (
                            <div
                                role="button"
                                onClick={handleStopMidi}
                                onKeyPress={handleStopMidi}
                                tabIndex={0}
                            >
                                <StopIcon />
                            </div>
                        ) : (
                            <div
                                role="button"
                                onClick={handleSelectMidi}
                                onKeyPress={handleSelectMidi}
                                tabIndex={0}
                            >
                                <PlayIcon />
                            </div>
                        )
                }
            </div>
        );
    }

    if (midi === false) {
        return (
            <ErrorMessage message="Could not convert lump to MIDI." />
        );
    }

    return <div className={style.loading}>Loading...</div>;
};
