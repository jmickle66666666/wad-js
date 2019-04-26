import convertColorIndexesReferencesToBlob from '../lib/convertColorIndexesReferencesToBlob';

import {
    getCacheItemAsBlob,
    setCacheItemAsBlob,
} from '../lib/cacheManager';

function buildColorIndexReferences(data) {
    const colorIndexReferences = [];

    for (let i = 0; i < data.byteLength; i++) {
        colorIndexReferences.push(data.getUint8(i));
    }

    return colorIndexReferences;
}

onmessage = async (message) => {
    const {
        wadId,
        lump,
        palette,
    } = message.data;

    const {
        name,
        type,
        data,
        width,
        height,
    } = lump;

    // console.log(`Converting '${type}/${name}' from simple color index references to PNG data URL (WAD: '${wadId}') ...`);

    const requestURL = `/simpleImages/${wadId}/${name}`;
    const cachedItem = await getCacheItemAsBlob({ cacheId: wadId, requestURL });

    if (cachedItem) {
        postMessage({
            wadId,
            lumpId: name,
            lumpType: type,
            output: cachedItem,
        });

        return;
    }

    const colorIndexReferences = buildColorIndexReferences(data);

    const output = await convertColorIndexesReferencesToBlob(
        colorIndexReferences,
        width,
        height,
        palette,
    );

    if (output) {
        // console.log(`Converted '${type}/${name}' from simple color index references to blob (WAD: '${wadId}').`);
    } else {
        console.error(`Could not convert '${name}' from simple color index references to blob (WAD: '${wadId}').`);

        postMessage({
            wadId,
            lumpId: name,
            lumpType: type,
        });

        return;
    }

    setCacheItemAsBlob({ cacheId: wadId, requestURL, responseData: output });

    postMessage({
        wadId,
        lumpId: name,
        lumpType: type,
        output,
    });
};
