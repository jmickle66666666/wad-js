import {
    DMX_HEADER_SIZE,
    DMX_TAIL_PADDING,
} from '../lib/constants';

import {
    getCacheItemAsArrayBuffer,
    setCacheItemAsBlob,
} from '../lib/cacheManager';

function getDMXBody({ data }) {
    const offsetWithoutHeader = data.byteOffset + DMX_HEADER_SIZE;
    const byteLengthWithoutHeaderNorTail = data.byteLength - DMX_HEADER_SIZE - DMX_TAIL_PADDING;

    const dataWithoutHeader = new Uint8Array(
        data.buffer,
        offsetWithoutHeader,
        byteLengthWithoutHeaderNorTail,
    );

    return dataWithoutHeader;
}

onmessage = async (message) => {
    const {
        wadId,
        lump,
    } = message.data;

    const {
        name,
        type,
        data,
    } = lump;

    // console.log(`Converting '${type}/${name}' from DMX to PCM (WAD: '${wadId}') ...`);

    const requestURL = `/pcms/${wadId}/${name}`;
    const cachedItem = await getCacheItemAsArrayBuffer({ cacheId: wadId, requestURL });

    if (cachedItem) {
        postMessage({
            wadId,
            lumpId: name,
            lumpType: type,
            output: cachedItem,
        });

        return;
    }

    try {
        const pcm = getDMXBody({ data });

        console.log(`Converted '${type}/${name}' from DMX to PCM (WAD: '${wadId}').`);
        setCacheItemAsBlob({ cacheId: wadId, requestURL, responseData: pcm });

        postMessage({
            wadId,
            lumpId: name,
            lumpType: type,
            output: pcm,
        });
    } catch (error) {
        console.error(`Could not convert '${name}' from DMX to PCM (WAD: '${wadId}').`, { error });

        postMessage({
            wadId,
            lumpId: name,
            lumpType: type,
            error: error.message,
        });
    }
};
