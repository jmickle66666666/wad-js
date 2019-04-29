import React from 'react';

import {
    INTERMISSION,
    STATUS_BAR,
    ANSI,
} from '../../lib/constants';

import TextLump from '../Lumps/TextLump';
import Palettes from '../Lumps/Palettes';
import Colormaps from '../Lumps/Colormaps';
import Map from '../Lumps/Map';
import ImageLump from '../Lumps/ImageLump';
import Texture from '../Lumps/Texture';
import Music from '../Lumps/Music';
import Sound from '../Lumps/Sound';

import PatchNames from '../Lumps/PatchNames';
import TextureNames from '../Lumps/TextureNames';
import Ansi from '../Lumps/Ansi';
import SoundInfo from '../Lumps/SoundInfo';

export default ({
    wad,
    lump,
    text,
    midi,
    pcm,
    simpleImage,
    complexImage,
    map,
    selectedMidi,
    selectedPCM,
    selectMidi,
    stopMidi,
    playPCM,
    stopPCM,
    selectLump,
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

            if (lump.isSNDINFO) {
                return (
                    <SoundInfo
                        lump={lump}
                        wad={wad}
                        selectLump={selectLump}
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
                <Map
                    wad={wad}
                    lump={lump}
                    map={map}
                />
            );
        }
        case 'flats': {
            return (
                <ImageLump
                    wad={wad}
                    lump={lump}
                    image={simpleImage}
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
                <ImageLump
                    wad={wad}
                    lump={lump}
                    image={simpleImage || complexImage}
                />
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
                <ImageLump
                    wad={wad}
                    lump={lump}
                    image={simpleImage || complexImage}
                />
            );
        }
        case 'menu': {
            return (
                <ImageLump
                    wad={wad}
                    lump={lump}
                    image={simpleImage || complexImage}
                />
            );
        }
        case INTERMISSION: {
            return (
                <ImageLump
                    wad={wad}
                    lump={lump}
                    image={simpleImage || complexImage}
                />
            );
        }
        case STATUS_BAR: {
            return (
                <ImageLump
                    wad={wad}
                    lump={lump}
                    image={simpleImage || complexImage}
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
        case 'sounds': {
            return (
                <Sound
                    wad={wad}
                    lump={lump}
                    pcm={pcm}
                    selectedPCM={selectedPCM}
                    playPCM={playPCM}
                    stopPCM={stopPCM}
                />
            );
        }
    }
};
