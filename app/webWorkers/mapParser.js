import createOffscreenCanvas from '../lib/createOffscreenCanvas';

import {
    MAP_DATA_SCHEMAS,
    HEXEN_MAP_DATA_SCHEMAS,
    // COLOR_COUNT_PER_PALETTE,
    DEFAULT_MAP_PALETTE,
    MAP_PADDING,
} from '../lib/constants';

function getHeightDiff({
    rightSidedefSector,
    leftSidedefSector,
}) {
    let heightDifference = null;

    if (rightSidedefSector.zFloor !== leftSidedefSector.zFloor) {
        heightDifference = 'lowerWall';
    } else if (rightSidedefSector.zCeil !== leftSidedefSector.zCeil) {
        heightDifference = 'upperWall';
    }

    return heightDifference;
}

async function createMapPreview({
    mapData,
    mapFormat,
    mapSizeData,
    palette,
}) {
    const {
        SECTORS: sectors,
        LINEDEFS: linedefs,
        SIDEDEFS: sidedefs,
        VERTEXES: vertices,
    } = mapData || {};
    if (!mapData || !sectors || !linedefs || !sidedefs || !vertices) {
        console.error('Invalid mapData.');
        return null;
    }

    let mapPalette = {};
    /*
    if (!palette || palette.length !== COLOR_COUNT_PER_PALETTE) {
        console.warn('No valid palette found. Map preview will be drawn with default color scheme.', { palette });
    */
    mapPalette = DEFAULT_MAP_PALETTE;
    /*
    } else {
        mapPalette = {
            background: palette[0],
            solidWall: palette[176],
            lowerWall: palette[64],
            upperWall: palette[231],
            sameHeight: palette[96],
        };
    }
    */

    if (mapFormat === 'UDMF') {
        console.error(`Unable to render '${mapFormat}' format maps.`);
        return null;
    }

    const {
        height,
        width,
        minX,
        minY,
    } = mapSizeData;

    const { canvas, context } = createOffscreenCanvas({
        height: height + (MAP_PADDING * 2),
        width: width + (MAP_PADDING * 2),
    });

    context.fillStyle = mapPalette.background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.lineWidth = 4;
    context.imageSmoothingEnabled = false;

    for (let i = 0; i < linedefs.length; i++) {
        const linedef = linedefs[i];

        const {
            vertex1,
            vertex2,
            rightSidedef: rightSidedefIndex,
            leftSidedef: leftSidedefIndex,
        } = linedef;

        let { x: x1, y: y1 } = vertices[vertex1];
        let { x: x2, y: y2 } = vertices[vertex2];

        // for some reason, Y coordinates need to be flipped in order to be displayed correctly
        y1 *= -1;
        y2 *= -1;

        // map should be drawn relatively to { 0, 0 } instead of { minX, minY }
        x1 -= minX - MAP_PADDING;
        x2 -= minX - MAP_PADDING;
        y1 -= minY - MAP_PADDING;
        y2 -= minY - MAP_PADDING;

        context.strokeStyle = mapPalette.solidWall;

        // linedef is two-sided
        if (leftSidedefIndex !== 65535) {
            const rightSidedef = sidedefs[rightSidedefIndex];
            const leftSidedef = sidedefs[leftSidedefIndex];
            const rightSidedefSector = sectors[rightSidedef.sector];
            const leftSidedefSector = sectors[leftSidedef.sector];

            const heightDifference = getHeightDiff({
                rightSidedefSector,
                leftSidedefSector,
            });

            if (heightDifference) {
                const { red, green, blue } = mapPalette[heightDifference];
                context.strokeStyle = `rgb(${red},${green},${blue})`;
            } else {
                const { red, green, blue } = mapPalette.sameHeight;
                context.strokeStyle = `rgb(${red},${green},${blue})`;
            }
        } else {
            const { red, green, blue } = mapPalette.solidWall;
            context.strokeStyle = `rgb(${red},${green},${blue})`;
        }

        context.beginPath();
        context.moveTo(x1, y1);
        context.lineTo(x2, y2);
        context.stroke();
    }

    const blob = await canvas.convertToBlob();

    return blob;
}

function getMapSize({ vertices }) {
    if (!vertices) {
        return null;
    }

    const minX = vertices.reduce((mX, vertex) => {
        if (mX === null || vertex.x < mX) {
            return vertex.x;
        }

        return mX;
    }, null);

    const maxX = vertices.reduce((mX, vertex) => {
        if (mX === null || vertex.x > mX) {
            return vertex.x;
        }

        return mX;
    }, null);

    const minY = vertices.reduce((mX, vertex) => {
        // for some reason, Y coordinates need to be flipped in order to be displayed correctly
        if (mX === null || vertex.y * -1 < mX) {
            return vertex.y * -1;
        }

        return mX;
    }, null);

    const maxY = vertices.reduce((mX, vertex) => {
        // for some reason, Y coordinates need to be flipped in order to be displayed correctly
        if (mX === null || vertex.y * -1 > mX) {
            return vertex.y * -1;
        }

        return mX;
    }, null);

    const width = maxX - minX;
    const height = maxY - minY;

    return {
        minX,
        maxX,
        minY,
        maxY,
        width,
        height,
    };
}

function get8BitNameString({ data, position }) {
    let output = '';
    for (let i = 0; i < 8; i++) {
        if (data.getUint8(position + i) !== 0) {
            output += String.fromCharCode(data.getUint8(position + i));
        }
    }
    return output;
}

function parseMapDataTypeEntry({
    i,
    data,
    properties,
    size,
}) {
    const entry = {};

    let position = 0;
    for (let j = 0; j < properties.length; j++) {
        const {
            name,
            format = 'Uint16',
            littleEndian = true,
        } = properties[j];

        if (format === 'name') {
            entry[name] = get8BitNameString({ data, position });
            position += 8;
        } else {
            const propertySize = format.replace(/\D/g, '') / 8;
            entry[name] = data[`get${format}`](
                (i * size) + position,
                littleEndian,
            );
            position += propertySize;
        }
    }

    return entry;
}

function parseMapDataType({ dataType, data, mapFormat }) {
    if (!data) {
        return {};
    }

    let schemas = MAP_DATA_SCHEMAS;

    if (mapFormat === 'Hexen' && (
        dataType === 'THINGS'
        || dataType === 'LINEDEFS')
    ) {
        console.log('Hexen map detected.');
        schemas = HEXEN_MAP_DATA_SCHEMAS;
    }

    const { size, properties } = schemas[dataType] || {};

    if (!size) {
        return null;
    }

    if (!properties) {
        return null;
    }

    const mapDataType = [];

    const numberOfEntries = data.byteLength / size;

    for (let i = 0; i < numberOfEntries; i++) {
        let mapDataTypeEntry = {};
        mapDataTypeEntry = parseMapDataTypeEntry({
            i,
            data,
            properties,
            size,
        });

        mapDataType.push(mapDataTypeEntry);
    }

    return mapDataType;
}

function parseMapData({ data, mapFormat }) {
    const mapData = {};

    const dataTypes = Object.keys(data || {});

    for (let i = 0; i < dataTypes.length; i++) {
        const dataType = dataTypes[i];
        const parsedData = parseMapDataType({
            dataType,
            data: data[dataType].data,
            mapFormat,
        });
        mapData[dataType] = parsedData;
    }


    return mapData;
}

onmessage = async (message) => {
    const {
        wadId,
        lump,
        mapFormat, // not used for now
        palette,
    } = message.data;

    const {
        name,
        type,
        data,
    } = lump;

    console.log(`Parsing map '${type}/${name}' (WAD: '${wadId}') ...`);

    let mapData = {};
    try {
        mapData = parseMapData({ data, mapFormat });
        const mapSizeData = getMapSize({ vertices: mapData.VERTEXES });

        if (mapSizeData) {
            const mapPreview = await createMapPreview({
                mapData,
                mapFormat,
                mapSizeData,
                palette,
            });

            mapData = {
                ...mapData,
                ...mapSizeData,
                preview: mapPreview,
            };
        }
    } catch (error) {
        console.error(`An error occurred while parsing map '${type}/${name}' (WAD: '${wadId}').`, { error });

        postMessage({
            wadId,
            lumpId: name,
            lumpType: type,
            error: error.message,
        });

        return;
    }

    // console.log(`Parsed map '${type}/${name}' (WAD: '${wadId}') ...`);

    console.log({ mapData });

    postMessage({
        wadId,
        lumpId: name,
        lumpType: type,
        output: mapData,
    });
};
