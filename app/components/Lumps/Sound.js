import React from 'react';

import PCM from '../AudioPlayers/PCM';

export default ({
    wad,
    lump,
    pcm,
    selectedPCM,
    playPCM,
    stopPCM,
}) => (
    <div>
        {lump.convertsToPCM && (
            <PCM
                wad={wad}
                lump={lump}
                pcm={pcm}
                selectedPCM={selectedPCM}
                playPCM={playPCM}
                stopPCM={stopPCM}
            />
        )}
    </div>
);
