import React from 'react';

import style from './WadLumpDetailDisplay.scss';

import Palettes from './LumpTypes/Palettes';
import Colormaps from './LumpTypes/Colormaps';

export default ({ wad, lump }) => {
    switch (lump.type) {
    default: {
        return null;
    }
    case 'palettes': {
        return (
            <Palettes lump={lump} />
        );
    }
    case 'colormaps': {
        return (
            <Colormaps wad={wad} lump={lump} />
        );
    }
    }
};
