import {
    TRANSPARENT_PIXEL,
    IMAGE_DATA_BOUNDARY,
} from '../lib/constants';

import convertColorIndexesReferencesToBlob from '../lib/convertColorIndexesReferencesToBlob';

import {
    getCacheItemAsBlob,
    setCacheItemAsBlob,
} from '../lib/cacheManager';

function buildColorIndexReferences(data, width, height) {
    try {
        const colorIndexes = [];

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
        return colorIndexes;
    } catch (error) {
        console.error('An error occurred while building color index references', { error });
        return { error };
    }
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

    // console.log(`Converting '${type}/${name}' from complex image to PNG data URL (WAD: '${wadId}') ...`);

    const requestURL = `/complexImages/${wadId}/${name}`;
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

    const colorIndexReferences = buildColorIndexReferences(data, width, height);

    const image = await convertColorIndexesReferencesToBlob(
        colorIndexReferences,
        width,
        height,
        palette,
    );

    if (image && !image.error) {
        // console.log(`Converted '${type}/${name}' from complex image to blob (WAD: '${wadId}').`);
        setCacheItemAsBlob({ cacheId: wadId, requestURL, responseData: image });
        postMessage({
            wadId,
            lumpId: name,
            lumpType: type,
            output: image,
        });
    } else {
        console.error(`Could not convert '${name}' from complex image to blob (WAD: '${wadId}').`);
        postMessage({
            wadId,
            lumpId: name,
            lumpType: type,
            error: image.error,
        });
    }
};
