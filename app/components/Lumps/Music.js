import React from 'react';

import Midi from '../AudioPlayers/Midi';

export default ({ wad, lump, midi }) => (
    <div>
        {lump.isMus && <Midi midi={midi} />}
    </div>
);
