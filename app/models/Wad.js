import moment from 'moment';
import axios from 'axios';
import JSZip from 'jszip';

import Lump from './Lump';

import arrayToQuotedString from '../lib/arrayToQuotedString';

import {
    VALID_FILE_FORMATS,
    VALID_WAD_TYPES,
    IWAD,
    PWAD,
    MAP_LUMPS,
    THINGS,
    PLAYPAL,
    COLORMAP,
    PNAMES,
    MUSIC_LUMPS,
    DEMO_LUMPS,
    UNCATEGORIZED,
    LUMP_INDEX_ENTRY_SIZE,
    LUMP_INDEX_ENTRY_OFFSET_TO_LUMP_SIZE,
    LUMP_INDEX_ENTRY_OFFSET_TO_LUMP_NAME,
    COLOR_COUNT_PER_PALETTE,
    PALETTE_SIZE,
    COLORMAP_SIZE,
    BYTES_PER_COLOR,
    GREEN_COLOR_OFFSET,
    BLUE_COLOR_OFFSET,
    FLAT_DIMENSIONS,
    IMAGE_DATA_HEADER_SIZE,
    IMAGE_DATA_BOUNDARY,
    TRANSPARENT_PIXEL,
    MUS_HEADER,
    MIDI_HEADER_SIZE,
    MIDI_HEADER,
    INTERMISSION,
    INTERMISSION_LUMPS,
    INTERMISSION_MAP_NAME_LUMPS,
    STATUS_BAR_LUMPS,
    STATUS_BAR,
    SBARINFO,
    MAPINFO,
    MAP,
    MENU_SCREENS,
    MENU,
    INTER_SCREENS,
    END_LUMPS,
    ANSI,
    ANSI_LUMPS,
    SNDINFO,
    HEXEN_SOUND_ARCHIVE_PATH,
    HEXEN_SOUND_REGISTERED,
    HEXEN_MUSIC_KEYWORD,
    TEXTURE_LUMPS,
    START_MARKERS,
    END_MARKERS,
} from '../lib/constants';

export default class Wad {
    constructor() {
        this.errors = {};
        this.lumps = {};
    }

    updateLump(lumpData, type) {
        const lump = new Lump();
        lump.setIndexData(lumpData);
        this.lumps = {
            ...this.lumps,
            [type]: {
                ...this.lumps[type],
                [lump.name]: lump,
            },
        };
    }

    getRelevantExternalResources(iwad) {
        const errors = {};
        const warnings = {};

        if (!iwad.lumps) {
            warnings.iwad_missing = 'This PWAD was not linked to an IWAD for missing resources. Graphic lumps might not be visible in the application if the WAD does not include its own palette.';
            return { data: {}, errors, warnings };
        }

        let palettes = {};
        try {
            palettes = iwad.lumps.palettes.PLAYPAL;
        } catch (error) {
            errors.palettes = `An error occurred while parsing the palettes of IWAD '${iwad.name}': ${error} `;
        }

        const data = {
            name: iwad.name,
            id: iwad.id,
            palettes,
        };

        return { data, errors, warnings };
    }

    checkZipFile(blob) {
        const fileSignature = blob.getUint32(0, false).toString(16);
        const isZipped = fileSignature === '504b0304';
        this.isZipped = isZipped;
        return isZipped;
    }

    unZipFile(blob, iwad, callback) {
        const zip = new JSZip();

        zip.loadAsync(blob)
            .then((unzippedContent) => {
                const filenames = Object.keys(unzippedContent.files).map(filename => filename);

                // TODO: have a stronger check for WAD files
                const wadFilenames = filenames.filter(filename => filename.toLowerCase().includes('.wad'));

                if (wadFilenames.length === 0) {
                    this.errors.not_found = `No WAD file found in '${this.name}'.`;
                    callback(this);
                    return;
                }

                // TODO: handle more than 1 zipped wad
                if (wadFilenames.length > 1) {
                    this.errors.zip_multiple_wads = `${wadFilenames.length} WAD files found in '${this.name}'. Extracting multiple WADs from the same ZIP file is not supported at this time.`;
                    callback(this);
                    return;
                }

                console.info(`Extracting '${wadFilenames[0]}' from '${this.name}'...`);

                unzippedContent.file(wadFilenames[0]).async('arrayBuffer')
                    .then((wad) => {
                        this.bytesLoaded = wad.byteLength;
                        this.size = wad.byteLength;
                        this.processBlob(wad, iwad, callback);
                    });
            })
            .catch((error) => {
                console.error(`An error occurred while unzipping '${this.name}'.`, { error });
                this.errors.unzip_error = error.message;
                callback(this);
            });
    }

    processBlob(blob, iwad, callback) {
        try {
            let warnings = {};
            const data = new DataView(blob);

            this.checkZipFile(data);

            if (this.isZipped) {
                this.unZipFile(blob, iwad, callback);
                return false;
            }

            this.bytesLoaded = this.size;
            this.uploadEndAt = moment().utc().format();
            this.uploadedWith = `${PROJECT} v${VERSION}`;

            const {
                type,
                headerLumpCount,
                indexAddress,
            } = this.readHeader(data);

            if (!VALID_WAD_TYPES.includes(type)) {
                const error = `'${type}' is not a valid WAD type. Expected type: ${arrayToQuotedString(VALID_WAD_TYPES)}.`;
                this.errors.invalid_wad_signature = error;
                callback(this);

                return false;
            }

            // ignore IWAD input
            let externalIWad = {};
            if (type === IWAD && iwad.name) {
                console.warn(`An external IWAD '${iwad.name}' was provided but this WAD is also an IWAD. The external source will be ignored.`);
            } else if (type === PWAD) {
                const { data: iwadData, errors, warnings: iwadWarnings } = this.getRelevantExternalResources(iwad);

                if (Object.keys(errors).length > 0) {
                    this.errors = {
                        ...this.errors,
                        ...errors,
                    };

                    callback(this);
                    return false;
                }

                warnings = {
                    ...warnings,
                    ...iwadWarnings,
                };

                externalIWad = iwadData;
            }

            this.uploaded = true;
            this.warnings = warnings;
            this.type = type;
            this.headerLumpCount = headerLumpCount;
            this.indexLumpCount = 0;
            this.indexAddress = indexAddress;
            this.indexOffset = indexAddress;

            callback(this);

            this.readLumpIndex(blob, data, externalIWad, callback);

            return true;
        } catch (error) {
            console.error(`An error occurred while processing the file data of '${this.name}'.`, { error });
            this.errors.data_error = error.message;
            callback(this);

            return false;
        }
    }

    initReader(file, iwad, callback) {
        const reader = new FileReader();
        this.errors = {};

        reader.onerror = (error) => {
            this.errors.read_error = error;
            callback(this, file.type === 'application/json');
        };

        reader.onloadstart = () => {
            // hack to force the browser to show the rocket animation
            this.bytesLoaded = -1;
            this.size = -100;
            this.errors = {};
            callback(this, file.type === 'application/json');
        };

        reader.onprogress = (data) => {
            if (this.size !== data.total) {
                this.size = data.total;
            }

            if (data.lengthComputable) {
                this.bytesLoaded = data.loaded;
                callback(this, file.type === 'application/json');
            }
        };

        reader.onload = (event) => {
            callback(this, file.type === 'application/json');
            const { result } = event.target;

            if (file.type === 'application/json') {
                const json = JSON.parse(result);
                if (Array.isArray(json)) {
                    this.readJSON(json, callback);
                } else {
                    const error = 'Unexpected object. JSON object should be an array.';
                    this.errors.invalid_json = error;
                    callback(this, file.type === 'application/json');
                    return false;
                }
            } else {
                this.processBlob(result, iwad, callback);
            }

            return true;
        };

        return reader;
    }

    handleMapLumpEntry(map, lumps, lumpIndexData, callback) {
        const updatedNonMapLumps = 0;
        let updatedMap = { ...map };
        const updatedLumps = { ...lumps };

        // we assume that 'THINGS' is the first lump that appears after the map name lump
        // it's time to dump the map object (which holds data about the previous map) into the list of lumps
        if (lumpIndexData.name === THINGS) {
            // don't keep originalFormat as it is irrelevant and will trigger unwanted conversion attempts
            const {
                originalFormat,
                ...nameLumpWithoutFormat
            } = map.nameLump;
            if (map.nameLump.name !== '') {
                const lump = this.createLumpIndex({
                    ...nameLumpWithoutFormat,
                    data: {
                        ...map.dataLumps,
                    },
                });
                updatedLumps[map.nameLump.name] = lump;

                // reset temporary map object
                updatedMap = {
                    nameLump: { name: '' },
                    dataLumps: {},
                };
            }

            // find the lump that holds the name of the map in the map object
            /* eslint-disable-next-line no-loop-func */
            const mapNameLumpId = Object.keys(lumps).find(lumpName => lumps[lumpName].index === lumpIndexData.index - 1);

            if (!mapNameLumpId) {
                const error = `Orphan map lump in '${this.name}': Could not find the map lump that '${lumpIndexData.name}' lump belongs to.`;
                this.errors.map_lump = error;
                callback(this);
            }

            const mapNameLump = lumps[mapNameLumpId];

            updatedMap.nameLump = {
                ...mapNameLump,
                type: MAP,
            };
        }

        updatedMap.dataLumps[lumpIndexData.name] = { ...lumpIndexData };

        return {
            updatedNonMapLumps,
            updatedMap,
            updatedLumps,
        };
    }

    handleLastMapLumpEntry(map, lumps, nonMapLumps) {
        let updatedNonMapLumps = nonMapLumps;
        let updatedMap = { ...map };
        const updatedLumps = { ...lumps };

        // we have not encountered map data lumps but we still have data in the temporary object
        updatedNonMapLumps += 1;

        // it looks like we are not going to encounter another map name lump, so dump the data in the proper map name lump and reset the temporary map object
        if (nonMapLumps > 2) {
            // don't keep originalFormat as it is irrelevant and will trigger unwanted conversion attempts
            const {
                originalFormat,
                ...nameLumpWithoutFormat
            } = map.nameLump;
            const lump = this.createLumpIndex({
                ...nameLumpWithoutFormat,
                data: {
                    ...map.dataLumps,
                },
            });
            updatedLumps[map.nameLump.name] = lump;

            // reset temporary map object
            updatedMap = {
                nameLump: { name: '' },
                dataLumps: {},
            };
        }

        return {
            updatedNonMapLumps,
            updatedMap,
            updatedLumps,
        };
    }

    readText(data) {
        return new TextDecoder().decode(data).replace(/\u0000/g, ' ');
    }

    readSoundInfo(data) {
        try {
            const decodedText = decodeURI(new TextDecoder('utf-8').decode(data).replace(/\u0000/g, ' '));
            const lines = decodedText.split('\n');

            const linesWithIndex = lines
                // add line numbers
                .map((line, lineIndex) => ({
                    data: line,
                    lineIndex,
                }));

            const filteredLines = linesWithIndex
                // remove comment lines
                .filter(line => !line.data.match(/^;/g))
                // remove empty lines
                .filter(line => line.data.length > 1
                    || (line.data.length === 1 && line.data.charCodeAt(0) !== 13))
                // remove lines that do not contain sound info
                .filter(line => !line.data.includes(HEXEN_SOUND_ARCHIVE_PATH)
                    && !line.data.includes(HEXEN_SOUND_REGISTERED));

            const sanitizedLines = filteredLines.map((line) => {
                const sanitizedData = line.data
                    // remove inline comments
                    .replace(/;.*./, '')
                    .trimRight()
                    // remove tabs
                    .replace(/\t/g, ' ')
                    // remove extra spaces
                    .replace(/ {1,}/g, ' ');

                return {
                    ...line,
                    data: sanitizedData,
                };
            });

            const soundArray = sanitizedLines.map((line, index) => {
                const splitLine = line.data.split(' ');
                if (splitLine.length === 2) {
                    // this is a sound
                    const description = splitLine[0];
                    const name = String(splitLine[1]).toUpperCase();

                    const audioObject = {
                        name,
                        description,
                        type: 'sounds',
                        lineIndex: line.lineIndex,
                    };

                    // add references to the lump in SNDINFO
                    linesWithIndex[line.lineIndex] = {
                        ...linesWithIndex[line.lineIndex],
                        ...audioObject,
                    };

                    return { ...audioObject };
                } if (splitLine.length === 3 && splitLine[0] === HEXEN_MUSIC_KEYWORD) {
                    // this is music
                    const description = `map${splitLine[1]}`;
                    const name = String(splitLine[2]).toUpperCase();

                    const audioObject = {
                        name,
                        description,
                        type: 'music',
                        lineIndex: line.lineIndex,
                    };

                    // add references to the lump in SNDINFO
                    linesWithIndex[line.lineIndex] = {
                        ...linesWithIndex[line.lineIndex],
                        ...audioObject,
                    };

                    return audioObject;
                }

                console.warn(`SNDINFO: Unrecognized sound data (sound #${index}). Expected pattern 'sounddescription soundlump' or '$MAP 15 musiclump' but got:`, { line, length: line.length });

                return null;
            }).filter(line => line);

            const sounds = {};
            for (let i = 0; i < soundArray.length; i++) {
                const sound = soundArray[i];
                sounds[sound.name] = sound;
            }

            return {
                sounds,
                soundInfoData: linesWithIndex,
            };
        } catch (error) {
            const errorMessage = `Could not convert '${SNDINFO}' to text.`;
            console.error({ errorMessage, error });

            return { soundInfoData: data };
        }
    }

    readPalettes(data) {
        const size = data.byteLength;
        const paletteCount = size / PALETTE_SIZE;
        const palettes = [];

        if (!Number.isInteger(paletteCount)) {
            const error = `Unexpected palette size. Dividing the PLAYPAL lump by the standard palette size (${PALETTE_SIZE} bytes) yields a decimal result (i.e., '${paletteCount}'). The palette(s) might be bigger than the usual size or there might be additional bytes in the lump.`;

            console.error('An error occurred while parsing PLAYPAL', { error });

            this.errors.PLAYPAL = error;
        }

        for (let i = 0; i < paletteCount; i++) {
            const palette = [];
            for (let j = 0; j < PALETTE_SIZE / BYTES_PER_COLOR; j++) {
                const red = data.getUint8((i * PALETTE_SIZE) + (j * BYTES_PER_COLOR) + 0);
                const green = data.getUint8((i * PALETTE_SIZE) + (j * BYTES_PER_COLOR) + GREEN_COLOR_OFFSET);
                const blue = data.getUint8((i * PALETTE_SIZE) + (j * BYTES_PER_COLOR) + BLUE_COLOR_OFFSET);
                palette.push({ red, green, blue });
            }

            palettes.push(palette);
        }

        return palettes;
    }

    readColormaps(data, name) {
        const size = data.byteLength;
        const colormapCount = size / COLORMAP_SIZE;

        const colormaps = [];

        if (!Number.isInteger(colormapCount)) {
            const error = `Unexpected colormap size. Dividing the '${name}' lump by the standard colormap size (${COLORMAP_SIZE} bytes) yields a decimal result (i.e., '${colormapCount}'). The colormap(s) might be bigger than the usual size or there might be additional bytes in the lump.`;

            console.error(`An error occurred while parsing colormaps '${name}'.`, { error });

            this.errors.colormaps = error;
        }

        for (let i = 0; i < colormapCount; i++) {
            const colormap = [];
            for (let j = 0; j < COLORMAP_SIZE; j++) {
                colormap.push(data.getUint8((i * COLORMAP_SIZE) + j));
            }

            colormaps.push(colormap);
        }

        return colormaps;
    }

    readPatchNames(data) {
        const patchCount = data.getUint32(0, true);
        const patchNames = [];
        let patchName = [];

        for (let i = 4; i < data.byteLength; i++) {
            const character = String.fromCharCode(data.getUint8(i, true));
            patchName.push(character);
            if (patchName.length === 8) {
                const formattedPatchName = patchName.join('').replace(/\u0000/g, '');
                patchNames.push(formattedPatchName);
                patchName = [];
            }
        }

        return {
            patchCount,
            patchNames,
        };
    }

    readTextures(data, textureLumpAddress) {
        const textureCount = data.getUint32(0, true);
        const textureNames = [];
        const textures = {};

        const textureAddresses = [];
        for (let i = 0; i < textureCount; i++) {
            textureAddresses[i] = data.getUint32(4 + (i * 4), true);
        }

        for (let i = 0; i < textureCount; i++) {
            const address = textureAddresses[i];
            const textureName = [];

            for (let j = 0; j < 8; j++) {
                const character = String.fromCharCode(data.getUint8(address + j));
                textureName.push(character);
            }

            const name = textureName.join('').replace(/\u0000/g, '');
            textureNames.push(name);

            const width = data.getUint16(address + 11);
            const height = data.getUint16(address + 13);

            const patchCount = data.getUint16(address + 19);

            const patches = [];

            // that's not accurate
            for (let j = 0; j < patchCount; j++) {
                const patch = {
                    xOffset: data.getUint16(address + 20 + j * 10),
                    yOffset: data.getUint16(address + 20 + j * 10 + 2),
                    patchIndex: data.getUint16(address + 20 + j * 10 + 4),
                };
                patches.push(patch);
                // console.log({ name, patch });
            }

            let size = 0;
            if (textureAddresses[i + 1]) {
                size = textureAddresses[i + 1] - textureAddresses[i];
            } else {
                size = textureLumpAddress - textureAddresses[i];
            }


            const texture = new Lump();
            texture.setIndexData({
                name,
                address: textureLumpAddress + address,
                size,
                width,
                height,
                type: 'textures',
                data: {
                    patchCount,
                    patches,
                },
            });

            textures[name] = texture;
        }

        return {
            textureCount,
            textureNames,
            textures,
        };
    }

    convertColorIndexesToDataURL(arrayOfColorIndexes, width, height, name, palette) {
        if (palette.length !== COLOR_COUNT_PER_PALETTE) {
            console.error('The palette does not have enough colors to draw images.');
            return '';
        }

        try {
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const context = canvas.getContext('2d');

            const imageData = context.createImageData(
                canvas.width,
                canvas.height,
            );

            for (let i = 0; i < arrayOfColorIndexes.length; i++) {
                if (arrayOfColorIndexes[i] === TRANSPARENT_PIXEL) {
                    imageData.data[(i * 4) + 3] = 0;
                } else {
                    const { red, green, blue } = palette[arrayOfColorIndexes[i]];
                    imageData.data[(i * 4) + 0] = red;
                    imageData.data[(i * 4) + 1] = green;
                    imageData.data[(i * 4) + 2] = blue;
                    imageData.data[(i * 4) + 3] = 255;
                }
            }
            const newCanvas = document.createElement('CANVAS');
            newCanvas.width = imageData.width;
            newCanvas.height = imageData.height;
            newCanvas.getContext('2d').putImageData(imageData, 0, 0);
            context.imageSmoothingEnabled = false;
            context.drawImage(newCanvas, 0, 0);

            const dataURL = canvas.toDataURL();

            return dataURL;
        } catch (error) {
            console.error(`An error occurred while converting the color indexes of lump '${name}' to a Data URL`, { error });
            return '';
        }
    }

    readFlat(data) {
        // hack for Heretic 65x64 scrolling flats
        const width = data.byteLength === 4160 ? FLAT_DIMENSIONS + 1 : FLAT_DIMENSIONS;

        // hack for Hexen 64x128 flats
        const height = data.byteLength / width;

        // we also need to handle so-called "hi-res" 128x128 ans 256x256 flats

        const metadata = {
            width,
            height,
        };

        return { metadata };
    }

    readImageDataHeader(data) {
        const header = [];
        for (let i = 0; i < IMAGE_DATA_HEADER_SIZE; i += 2) {
            header.push(data.getUint16(i, true));
        }

        return header;
    }

    readImageData(data, name, palette) {
        const colorIndexes = [];

        const [
            width,
            height,
            // the { x,y } offset of patches is usually zero
            xOffset,
            yOffset,
        ] = this.readImageDataHeader(data);

        const metadata = {
            width,
            height,
            xOffset,
            yOffset,
        };

        // assume that the whole image is transparent
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                colorIndexes.push(TRANSPARENT_PIXEL);
            }
        }

        const columnAddresses = [];
        for (let i = 0; i < width; i++) {
            columnAddresses[i] = data.getUint32(8 + (i * 4), true);
        }

        let position = 0;
        let pixelCount = 0;

        for (let i = 0; i < width; i++) {
            position = columnAddresses[i];
            let rowStart = 0;

            while (rowStart !== IMAGE_DATA_BOUNDARY) {
                rowStart = data.getUint8(position);
                position += 1;

                if (rowStart === IMAGE_DATA_BOUNDARY) break;

                pixelCount = data.getUint8(position);
                position += 2;

                for (let j = 0; j < pixelCount; j++) {
                    colorIndexes[((rowStart + j) * width) + i] = data.getUint8(position);
                    position += 1;
                }
                position += 1;
            }
        }

        const image = this.convertColorIndexesToDataURL(colorIndexes, width, height, name, palette);

        return {
            metadata,
            image,
        };
    }

    disambiguateMusicFormat(data) {
        let format;

        const musicHeader = this.readMusicHeader(data);
        if (musicHeader === MIDI_HEADER) {
            format = 'MIDI';
        } else if (musicHeader.includes(MUS_HEADER)) {
            format = 'MUS';
        }

        return { format };
    }

    readMusicHeader(data) {
        const header = [];
        for (let i = 0; i < MIDI_HEADER_SIZE; i++) {
            header.push(String.fromCharCode(data.getUint8(i)));
        }

        return header.join('');
    }

    organizeLumps(lumps) {
        const organizedLumps = {};

        const lumpNames = Object.keys(lumps);

        for (let i = 0; i < lumpNames.length; i++) {
            const lumpName = lumpNames[i];
            const lump = lumps[lumpName];

            if (!organizedLumps[lump.type]) {
                organizedLumps[lump.type] = {};
            }

            organizedLumps[lump.type][lumpName] = lump;
        }

        console.log({ organizedLumps });

        return organizedLumps;
    }

    readLumpName(lumpIndexAddress, data) {
        let name = '';
        for (let i = lumpIndexAddress + LUMP_INDEX_ENTRY_OFFSET_TO_LUMP_NAME; i < lumpIndexAddress + LUMP_INDEX_ENTRY_SIZE; i++) {
            if (data.getUint8(i) !== 0) {
                name += String.fromCharCode(data.getUint8(i));
            }
        }

        return name;
    }

    readLumpIndex(blob, data, iwad, callback) {
        let lumps = {};
        let lumpClusterType = '';
        let nonMapLumps = 0;

        let map = {
            nameLump: { name: '' },
            dataLumps: {},
        };

        let indexLumpCount = 0;
        let paletteData = iwad.palettes ? iwad.palettes.data[0] : [];
        let patchNames = [];
        let soundInfo = {};

        for (let i = 0; i < this.headerLumpCount; i++) {
            try {
                indexLumpCount++;

                let parsedLumpData = {};
                let lumpType;
                let originalFormat;
                let mapLump = false;

                const lumpIndexAddress = this.indexOffset + i * LUMP_INDEX_ENTRY_SIZE;
                const address = data.getInt32(lumpIndexAddress, true);

                const size = data.getInt32(
                    lumpIndexAddress + LUMP_INDEX_ENTRY_OFFSET_TO_LUMP_SIZE,
                    true,
                );

                const name = this.readLumpName(lumpIndexAddress, data);

                let lumpIndexData = {
                    index: i,
                    address,
                    size,
                    name,
                };

                const lumpData = new DataView(blob, address, size);

                // map-related operations
                if (MAP_LUMPS.includes(name)) {
                    mapLump = true;

                    const {
                        updatedNonMapLumps,
                        updatedMap,
                        updatedLumps,
                    } = this.handleMapLumpEntry(
                        map,
                        lumps,
                        lumpIndexData,
                        callback,
                    );

                    nonMapLumps = updatedNonMapLumps;
                    map = { ...updatedMap };
                    lumps = { ...updatedLumps };
                } else if (map.nameLump.name !== '') {
                    const {
                        updatedNonMapLumps,
                        updatedMap,
                        updatedLumps,
                    } = this.handleLastMapLumpEntry(
                        map,
                        lumps,
                        nonMapLumps,
                    );

                    nonMapLumps = updatedNonMapLumps;
                    map = { ...updatedMap };
                    lumps = { ...updatedLumps };
                }

                // non-map lumps
                if (!mapLump) {
                    if (name === PLAYPAL) {
                        lumpType = 'palettes';
                        parsedLumpData = this.readPalettes(lumpData);
                        // shortcut to access palette #0 when parsing graphics into Data URLs
                        [paletteData] = parsedLumpData;
                    } else if (name === COLORMAP) {
                        lumpType = 'colormaps';
                        parsedLumpData = this.readColormaps(lumpData, name);
                    } else if (name === PNAMES) {
                        lumpType = 'patches';
                        const { patchCount, patchNames: pNames } = this.readPatchNames(lumpData);
                        parsedLumpData = pNames;
                        lumpIndexData = {
                            ...lumpIndexData,
                            count: patchCount,
                        };

                        patchNames = pNames;
                    } else if (patchNames.includes(name)) {
                        lumpType = 'patches';
                    } else if (TEXTURE_LUMPS.test(name)) {
                        lumpType = 'textures';
                        const { textureCount, textureNames, textures } = this.readTextures(lumpData, address);
                        parsedLumpData = textureNames;
                        lumpIndexData = {
                            ...lumpIndexData,
                            count: textureCount,
                        };

                        lumps = {
                            ...lumps,
                            ...textures,
                        };

                        // console.log({ textureCount, textureNames, textures });
                    } else if (MUSIC_LUMPS.includes(name)) {
                        lumpType = 'music';
                    } else if (DEMO_LUMPS.includes(name)) {
                        lumpType = 'demos';
                    }

                    if (START_MARKERS.test(name)) {
                        // P*_START
                        if (/^P[0-9a-zA-Z]{0,1}_START$/.test(name)) {
                            lumpClusterType = 'patches';
                            // F*_START
                        } else if (/^F[0-9a-zA-Z]{0,1}_START$/.test(name)) {
                            lumpClusterType = 'flats';
                            // S*_START
                        } else if (/^S[0-9a-zA-Z]{0,1}_START$/.test(name)) {
                            lumpClusterType = 'sprites';
                            // C*_START (Boom)
                        } else if (/^C[0-9a-zA-Z]{0,1}_START$/.test(name)) {
                            lumpClusterType = 'colormaps';
                        }
                    } else if (END_MARKERS.test(name)) {
                        lumpClusterType = '';
                    } else if (lumpClusterType) {
                        switch (lumpClusterType) {
                            default: {
                                break;
                            }
                            case 'colormaps': {
                                parsedLumpData = this.readColormaps(lumpData, name);
                                break;
                            }
                            case 'flats': {
                                const { metadata } = this.readFlat(lumpData, name, paletteData);
                                parsedLumpData = lumpData;
                                lumpIndexData = {
                                    ...lumpIndexData,
                                    ...metadata,
                                    originalFormat: 'simpleImage',
                                };
                                break;
                            }
                            case 'patches': {
                                const { image, metadata } = this.readImageData(lumpData, name, paletteData);
                                parsedLumpData = image;
                                lumpIndexData = {
                                    ...lumpIndexData,
                                    ...metadata,
                                };

                                break;
                            }
                            case 'sprites': {
                                const { image, metadata } = this.readImageData(lumpData, name, paletteData);
                                parsedLumpData = image;
                                lumpIndexData = {
                                    ...lumpIndexData,
                                    ...metadata,
                                };

                                break;
                            }
                        }

                        // we know the type of this lump because it belongs to a cluster
                        // lump cluster type is meant to be applied to a group of consecutive lumps
                        const lumpIndexDataWithType = {
                            ...lumpIndexData,
                            data: parsedLumpData,
                            type: lumpClusterType,
                        };

                        const lump = this.createLumpIndex(lumpIndexDataWithType);
                        lumps[name] = lump;
                    } else {
                        // we didn't already guessed the type with a stronger method
                        // detect the type of individual lumps based on a partial match on name
                        if (!lumpType) {
                            // D_* (Doom) and MUS_* (Heretic)
                            if (/^D_[0-9a-zA-Z_]{1,}$/.test(name) || /^MUS_[0-9a-zA-Z_]{1,}$/.test(name)) {
                                lumpType = 'music';

                                const { format } = this.disambiguateMusicFormat(lumpData);
                                originalFormat = format;

                                parsedLumpData = lumpData;
                                // DS* (DMX) and DP* (speaker)
                            } else if (/^DS[0-9a-zA-Z_]{1,}$/.test(name) || /^DP[0-9a-zA-Z_]{1,}$/.test(name)) {
                                lumpType = 'sounds';
                                // M_*
                            } else if (/^M_[0-9a-zA-Z_]{1,}$/.test(name)) {
                                lumpType = MENU;
                                const { image, metadata } = this.readImageData(
                                    lumpData, name, paletteData,
                                );
                                parsedLumpData = image;
                                lumpIndexData = {
                                    ...lumpIndexData,
                                    ...metadata,
                                };
                            } else if ((
                                INTERMISSION_LUMPS.test(name)
                                || INTERMISSION_MAP_NAME_LUMPS.test(name)
                                || INTER_SCREENS.includes(name)
                                || END_LUMPS.test(name)
                            ) && this.name !== 'HERETIC.WAD' && this.name !== 'HEXEN.WAD') {
                                lumpType = INTERMISSION;
                                const { image, metadata } = this.readImageData(
                                    lumpData, name, paletteData,
                                );
                                parsedLumpData = image;
                                lumpIndexData = {
                                    ...lumpIndexData,
                                    ...metadata,
                                };
                            } else if (STATUS_BAR_LUMPS.test(name) && this.name !== 'HERETIC.WAD' && this.name !== 'HEXEN.WAD') {
                                lumpType = STATUS_BAR;
                                const { image, metadata } = this.readImageData(
                                    lumpData, name, paletteData,
                                );
                                parsedLumpData = image;
                                lumpIndexData = {
                                    ...lumpIndexData,
                                    ...metadata,
                                };
                            } else if (name === SBARINFO) {
                                lumpType = STATUS_BAR;
                            } else if (MAPINFO.includes(name)) {
                                lumpType = MAP;
                            } else if (MENU_SCREENS.includes(name) && this.name !== 'HERETIC.WAD' && this.name !== 'HEXEN.WAD') {
                                lumpType = MENU;
                                const { image, metadata } = this.readImageData(
                                    lumpData, name, paletteData,
                                );
                                parsedLumpData = image;
                                lumpIndexData = {
                                    ...lumpIndexData,
                                    ...metadata,
                                };
                            }
                        }

                        if (name === SNDINFO) {
                            const { sounds, soundInfoData } = this.readSoundInfo(lumpData);
                            soundInfo = { ...sounds };
                            parsedLumpData = soundInfoData;
                        } else if (!lumpType) {
                            // this lump is uncategorized
                            // this also includes lumps that contain map names
                            // since we have not figured out that they are map lumps yet.
                            parsedLumpData = lumpData;
                            originalFormat = 'text';
                        }

                        if (ANSI_LUMPS.includes(name)) {
                            originalFormat = ANSI;
                        }

                        const lumpIndexDataWithType = {
                            ...lumpIndexData,
                            data: parsedLumpData,
                            type: lumpType || UNCATEGORIZED,
                            originalFormat,
                        };

                        const lump = this.createLumpIndex(lumpIndexDataWithType);
                        lumps[name] = lump;
                    }
                }
            } catch (error) {
                const lumpIndexAddress = this.indexOffset + i * LUMP_INDEX_ENTRY_SIZE;
                const name = this.readLumpName(lumpIndexAddress, data);
                console.error(`An error occurred while processing lump '${name}'.`, { error });
            }
        }

        if (this.errorIds.length > 0) {
            callback(this);
            return false;
        }

        // enrich lumps according to what we have found in SNDINFO
        const soundNames = Object.keys(soundInfo || {});
        if (soundNames.length > 0) {
            const lumpNames = Object.keys(lumps);
            for (let i = 0; i < lumpNames.length; i++) {
                const lumpName = lumpNames[i];
                if (soundNames.includes(lumpName)) {
                    const incompleteLump = lumps[lumpName];

                    const soundName = soundNames.find(sndNme => sndNme === lumpName);
                    const sound = soundInfo[soundName];

                    if (sound.type === 'music') {
                        const { format } = this.disambiguateMusicFormat(incompleteLump.data);
                        incompleteLump.originalFormat = format;
                    }

                    const lump = this.createLumpIndex({
                        ...incompleteLump,
                        ...sound,
                    });

                    lumps[lumpName] = lump;
                }
            }
        }

        const organizedLumps = this.organizeLumps(lumps);

        this.indexLumpCount = indexLumpCount;
        this.lumps = organizedLumps;
        this.iwad = iwad;
        this.palette = paletteData;
        this.processed = true;

        callback(this);
        return true;
    }

    createLumpIndex(lumpIndexData) {
        const lump = new Lump();
        lump.setIndexData(lumpIndexData);
        return lump;
    }

    readHeader(data) {
        const wadTypeData = [];

        for (let i = 0; i < 4; i++) {
            wadTypeData.push(String.fromCharCode(data.getUint8(i)));
        }

        const type = wadTypeData.join('');
        const headerLumpCount = data.getInt32(4, true);
        const indexAddress = data.getInt32(8, true);

        return {
            type,
            headerLumpCount,
            indexAddress,
        };
    }

    readLocalFile(file, iwad, callback) {
        const timestamp = moment().utc();

        this.uploadStartAt = timestamp.format();
        this.name = file.name;
        this.id = `${file.name}_${timestamp.unix()}`;

        if (VALID_FILE_FORMATS.includes(file.type)) {
            const reader = this.initReader(file, iwad, callback);
            if (file.type === 'application/json') {
                reader.readAsText(file);
            } else {
                reader.readAsArrayBuffer(file);
            }
        } else {
            const error = `"${file.type}" is not a supported file format. Expected MIME types: ${arrayToQuotedString(VALID_FILE_FORMATS)}.`;
            this.errors.invalid_mime = error;
            callback(this);
        }
    }

    readRemoteFile(url, filename, iwad, callback, unique = false) {
        const timestamp = moment().utc();

        this.uploadStartAt = timestamp.format();
        this.name = filename;
        this.id = unique ? filename : `${filename}_${timestamp.unix()}`;
        this.uploadedFrom = url;

        // hack to force the browser to show the rocket animation
        this.bytesLoaded = -1;
        this.size = -100;
        callback(this);

        axios.get(url, {
            responseType: 'arraybuffer',
            onDownloadProgress: (data) => {
                if (this.size !== data.total) {
                    this.size = data.total;
                }

                if (data.lengthComputable) {
                    this.bytesLoaded = data.loaded;
                    callback(this);
                }
            },
        })
            .then((response) => {
                this.bytesLoaded = response.data.byteLength;
                this.size = response.data.byteLength;

                try {
                    const json = JSON.parse(new TextDecoder().decode(response.data));
                    this.readJSON(json, callback);
                    return true;
                    // eslint-disable-next-line
                } catch (error) { }

                this.errors = {};
                this.processBlob(response.data, iwad, callback);
                return true;
            })
            .catch((error) => {
                console.error(`An error occurred while uploading '${filename}'.`, { error });
                this.errors.upload_error = error.message;
                callback(this);
                return false;
            });
    }

    readJSON(json, callback) {
        for (let i = 0; i < json.length; i++) {
            if (i === 0) {
                this.bytesLoaded = this.size;
                this.uploaded = true;
                callback(this, true);
                this.restore({
                    ...json[i],
                    uploadStartAt: this.uploadStartAt,
                    uploadEndAt: this.uploadEndAt,
                    tempId: this.id,
                });
                this.processed = true;
                this.uploadedWith = `${PROJECT} v${VERSION}`;
                callback(this, true, true);
            } else {
                const newWad = new Wad();
                newWad.uploaded = true;
                newWad.restore({
                    ...json[i],
                    uploadStartAt: this.uploadStartAt,
                    uploadEndAt: this.uploadEndAt,
                });
                newWad.processed = true;
                callback(newWad);
            }
        }
    }

    deleteTempId() {
        this.tempId = undefined;
    }

    replaceId() {
        const timestamp = moment().utc();
        this.id = `${this.name}_${timestamp.unix()}`;
    }

    restore(wad) {
        const {
            id,
            tempId,
            name,
            type,
            iwad,
            palette,
            size,
            bytesLoaded,
            uploadStartAt,
            uploadEndAt,
            uploadedWith,
            uploadedFrom,
            importedAt,
            headerLumpCount,
            indexLumpCount,
            indexAddress,
            indexOffset,
            lumps,
            errors,
            warnings,
        } = wad;

        this.id = id;
        this.tempId = tempId;
        this.name = name;
        this.type = type;
        this.iwad = iwad;
        this.palette = palette;
        this.size = size;
        this.bytesLoaded = bytesLoaded;
        this.uploadStartAt = uploadStartAt;
        this.uploadEndAt = uploadEndAt;
        this.uploadedWith = uploadedWith;
        this.uploadedFrom = uploadedFrom;
        this.importedAt = importedAt;
        this.headerLumpCount = headerLumpCount;
        this.indexLumpCount = indexLumpCount;
        this.indexAddress = indexAddress;
        this.indexOffset = indexOffset;
        this.errors = errors;
        this.warnings = warnings;

        // Lump instances must be re-instantiated
        const instantiatedLumps = {};
        Object.keys(lumps).map((lumpType) => {
            const lumpTypes = {};
            Object.keys(lumps[lumpType]).map((lumpName) => {
                const lump = new Lump();
                lump.setIndexData(wad.lumps[lumpType][lumpName]);
                lumpTypes[lumpName] = lump;
                return null;
            });
            instantiatedLumps[lumpType] = lumpTypes;

            return null;
        });

        this.lumps = instantiatedLumps;
    }

    get json() {
        const relevantProperties = {
            id: this.id,
            name: this.name,
            type: this.type,
            iwad: this.iwad,
            palette: this.palette,
            size: this.size,
            bytesLoaded: this.bytesLoaded,
            uploadStartAt: this.uploadStartAt,
            uploadEndAt: this.uploadEndAt,
            uploadedWith: this.uploadedWith,
            uploadedFrom: this.uploadedFrom,
            headerLumpCount: this.headerLumpCount,
            indexLumpCount: this.indexLumpCount,
            indexAddress: this.indexAddress,
            indexOffset: this.indexOffset,
            lumps: this.lumps,
            errors: this.errors,
            warnings: this.warnings,
        };

        return relevantProperties;
    }

    get jsonObjectURL() {
        const relevantProperties = this.json;
        const stringified = JSON.stringify([relevantProperties]);
        const blob = new Blob([stringified], {
            type: 'application/json',
        });

        const objectURL = URL.createObjectURL(blob);
        return objectURL;
    }

    get uploadedPercentage() {
        if (this.errorIds.length > 0) {
            return 100;
        }

        const progress = (this.bytesLoaded / this.size) * 100;
        return Number.isNaN(progress) ? '' : Math.ceil(progress);
    }

    get isPatchWad() {
        return this.type === PWAD;
    }

    get lumpTypes() {
        return Object.keys(this.lumps);
    }

    get lumpTypeCount() {
        const lumpTypeCount = {};
        this.lumpTypes.map((lumpType) => {
            lumpTypeCount[lumpType] = Object.keys(this.lumps[lumpType]).length;
            return null;
        });

        return lumpTypeCount;
    }

    get errorIds() {
        return Object.keys(this.errors);
    }

    get megabyteSize() {
        const convertedSize = this.size / 1024 / 1024;
        const truncatedSize = convertedSize.toFixed(1);
        return `${truncatedSize} MB`;
    }
}
