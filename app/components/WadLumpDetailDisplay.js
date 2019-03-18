import React from 'react';

import Palettes from './Lumps/Palettes';
import Colormaps from './Lumps/Colormaps';
import PatchNames from './Lumps/PatchNames';
import TextureNames from './Lumps/TextureNames';
import ImageLump from './Lumps/ImageLump';
import Texture from './Lumps/Texture';

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
                <Texture wad={wad} lump={lump} />
            );
        }
        case 'sprites': {
            return (
                <ImageLump wad={wad} lump={lump} />
            );
        }
        case 'menu': {
            return (
                <ImageLump
                    wad={wad}
                    lump={lump}
                />
            );
        }
    }
};
