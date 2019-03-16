import React from 'react';

import style from './WadLumpDetailDisplay.scss';

import Palettes from './LumpTypes/Palettes';
import Colormaps from './LumpTypes/Colormaps';
import PatchNames from './LumpTypes/PatchNames';
import TextureNames from './LumpTypes/TextureNames';
import ImageLump from './LumpTypes/ImageLump';

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
            <ImageLump wad={wad} lump={lump} />
        );
    }
    case 'patches': {
        if (lump.isPNAMES) {
            return (
                <PatchNames lump={lump} />
            );
        }
        return (
            <ImageLump wad={wad} lump={lump} />
        );
    }
    case 'textures': {
        if (lump.isTEXTUREx) {
            return (
                <TextureNames lump={lump} />
            );
        }
        return (
            <ImageLump wad={wad} lump={lump} />
        );
    }
    case 'sprites': {
        return (
            <ImageLump wad={wad} lump={lump} />
        );
    }
    }
};
