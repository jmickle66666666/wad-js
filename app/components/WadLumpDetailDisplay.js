import React from 'react';

import style from './WadLumpDetailDisplay.scss';

import { PNAMES } from '../lib/constants';

import Palettes from './LumpTypes/Palettes';
import Colormaps from './LumpTypes/Colormaps';
import PatchNames from './LumpTypes/PatchNames';
import Flat from './LumpTypes/Flat';

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
    case 'flats': {
        return (
            <Flat wad={wad} lump={lump} />
        );
    }
    case 'patches': {
        if (lump.name === PNAMES) {
            return (
                <PatchNames lump={lump} />
            );
        }
        return null;
    }
    }
};
