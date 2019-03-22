import React from 'react';

import Midi from '../AudioPlayers/Midi';

export default ({ wad, lump, midi }) => (
    <div>

        {lump.isMus && (
            <div>
                {midi ? <Midi midi={midi} /> : 'Loading...'}
            </div>
        )}
    </div>
);
