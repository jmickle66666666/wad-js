import React from 'react';

import Midi from '../AudioPlayers/Midi';

export default ({
    wad,
    lump,
    midi,
    selectedMidi,
    selectMidi,
    stopMidi,
}) => (
    <div>
        {lump.isMus && (
            <Midi
                wad={wad}
                lump={lump}
                midi={midi}
                selectedMidi={selectedMidi}
                selectMidi={selectMidi}
                stopMidi={stopMidi}
            />
        )}
    </div>
);
