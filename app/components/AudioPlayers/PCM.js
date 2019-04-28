import React from 'react';

import style from './Midi.scss';

import PlayIcon from '../../icons/Play';
import StopIcon from '../../icons/Stop';

import ErrorMessage from '../Messages/ErrorMessage';

const pcmIsPlaying = ({ selectedPCM, wad, lump }) => (
    selectedPCM
    && !selectedPCM.ended
    && selectedPCM.startedAt
    && selectedPCM.wadId === wad.id
    && selectedPCM.lumpName === lump.name
);

export default ({
    pcm,
    lump,
    wad,
    selectedPCM,
    playPCM,
    stopPCM,
}) => {
    if (pcm) {
        const handleStopPCM = () => stopPCM();

        const handlePlayPCM = () => {
            playPCM({
                data: pcm,
                lump,
                wadId: wad.id,
            });
        };

        return (
            <div className={style.player}>
                {
                    pcmIsPlaying({ selectedPCM, wad, lump })
                        ? (
                            <div
                                role="button"
                                onClick={handleStopPCM}
                                onKeyPress={handleStopPCM}
                                tabIndex={0}
                            >
                                <StopIcon />
                            </div>
                        ) : (
                            <div
                                role="button"
                                onClick={handlePlayPCM}
                                onKeyPress={handlePlayPCM}
                                tabIndex={0}
                            >
                                <PlayIcon />
                            </div>
                        )
                }
            </div>
        );
    }

    if (pcm === false) {
        return (
            <ErrorMessage message="Could not convert lump to PCM." />
        );
    }

    return <div className={style.loading}>Loading...</div>;
};
