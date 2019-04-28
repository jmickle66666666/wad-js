import {
    MAP_DATA_SCHEMAS,
    HEXEN_MAP_DATA_SCHEMAS,
} from '../lib/constants';

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

    console.log({ data });

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

    console.log({ mapData });


    return mapData;
}

onmessage = (message) => {
    const {
        wadId,
        lump,
        mapFormat, // not used for now
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

    postMessage({
        wadId,
        lumpId: name,
        lumpType: type,
        mapData,
    });
};
