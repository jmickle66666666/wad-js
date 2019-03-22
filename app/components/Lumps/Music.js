import React, { Fragment } from 'react';

export default ({ wad, lump }) => (
    <div>
        {!lump.midi ? 'Loading...' : 'Loaded.'}
    </div>
);
