import React from 'react';

import {
    INTERMISSION,
    STATUS_BAR,
    ANSI,
} from '../../lib/constants';

import TextLump from '../Lumps/TextLump';
import Ansi from '../Lumps/Ansi';
import Palettes from '../Lumps/Palettes';
import Colormaps from '../Lumps/Colormaps';
import Map from '../Lumps/Map';
import PatchNames from '../Lumps/PatchNames';
import TextureNames from '../Lumps/TextureNames';
import ImageLump from '../Lumps/ImageLump';
import Texture from '../Lumps/Texture';
import Music from '../Lumps/Music';

export default ({
    wad,
    lump,
    midi,
    simpleImage,
    text,
    selectedMidi,
    selectMidi,
    stopMidi,
}) => {
    switch (lump.type) {
    default: {
        return null;
    }
    case 'uncategorized': {
        if (lump.originalFormat === ANSI) {
            return (
                <Ansi
                    lump={lump}
                    text={text}
                />
            );
        }

        return (
            <TextLump
                lump={lump}
                text={text}
            />
        );
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
    case 'maps': {
        return (
            <Map wad={wad} lump={lump} />
        );
    }
    case 'flats': {
        return (
            <ImageLump
                wad={wad}
                lump={lump}
                simpleImage={simpleImage}
            />
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
    case INTERMISSION: {
        return (
            <ImageLump
                wad={wad}
                lump={lump}
            />
        );
    }
    case STATUS_BAR: {
        return (
            <ImageLump
                wad={wad}
                lump={lump}
            />
        );
    }
    case 'music': {
        return (
            <Music
                wad={wad}
                lump={lump}
                midi={midi}
                selectedMidi={selectedMidi}
                selectMidi={selectMidi}
                stopMidi={stopMidi}
            />
        );
    }
    }
};
