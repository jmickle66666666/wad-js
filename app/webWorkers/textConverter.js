import {
    ANSI_LUMPS,
    INVALID_TEXT,
    ANSI_BACKGROUND_COLOR_CODES,
    ANSI_FOREGROUND_COLOR_CODES,
    ANSI_CODE_PAGE_437_TABLES,
    SNDINFO,
} from '../lib/constants';

import {
    getCacheItemAsJson,
    getCacheItemAsText,
    setCacheItemAsBlob,
} from '../lib/cacheManager';

const interpolateBackgroundAnsiCode = int => (
    int === Number.isNaN ? null : ANSI_BACKGROUND_COLOR_CODES[int]
);

const interpolateForegroundAnsiCode = int => (
    int === Number.isNaN ? null : ANSI_FOREGROUND_COLOR_CODES[int]
);

const parseAnsiScreen = (input) => {
    const blocks = [];
    let line = [];

    for (let i = 0; i <= input.byteLength; i += 2) {
        if (i !== 0 && i % 160 === 0) {
            blocks.push(line);
            line = [];
        }

        // last byte is unimportant but necessary to push the last line
        if (i === input.byteLength) {
            break;
        }

        const characterByte = input.getUint8(i);
        const character = ANSI_CODE_PAGE_437_TABLES[characterByte];

        const colorByte = input.getUint8(i + 1);

        // missings bits are replaced by zeroes
        const colorBits = (`000000000${colorByte.toString(2)}`).substr(-8);

        const foregroundBits = colorBits.slice(4, 8);
        const foregroundInt = parseInt(foregroundBits, 2);
        const foreground = interpolateForegroundAnsiCode(foregroundInt);

        const backgroundBits = colorBits.slice(0, 4);
        const backgroundInt = parseInt(backgroundBits, 2);
        const background = interpolateBackgroundAnsiCode(backgroundInt);

        line.push({
            character,
            foreground,
            background,
        });
    }

    return blocks;
};

const firstDecodeTextMethod = input => decodeURI(new TextDecoder('utf-8').decode(input).replace(/\u0000/g, ' '));

const processNewLines = text => text.split('\n');

onmessage = async (message) => {
    const { wadId, lumpId, input } = message.data;

    // console.log(`Converting '${lumpId}' to text (WAD: '${wadId}') ...`);

    let output = null;
    let convertedFormat = 'text';

    if (lumpId === SNDINFO) {
        postMessage({
            wadId,
            lumpId,
            ignored: true,
        });

        return;
    }

    const requestURL = `/text/${wadId}/${lumpId}`;

    if (ANSI_LUMPS.includes(lumpId)) {
        // ANSI
        convertedFormat = 'ANSI';

        const cachedItem = await getCacheItemAsJson({ cacheId: wadId, requestURL });

        if (cachedItem) {
            postMessage({
                wadId,
                lumpId,
                output: cachedItem,
                convertedFormat,
            });

            return;
        }

        output = parseAnsiScreen(input);

        setCacheItemAsBlob({ cacheId: wadId, requestURL, responseData: JSON.stringify(output) });
    } else {
        const cachedItem = await getCacheItemAsText({ cacheId: wadId, requestURL });

        if (cachedItem) {
            postMessage({
                wadId,
                lumpId,
                output: cachedItem,
                convertedFormat,
            });

            return;
        }

        // text
        // rules out certain lumps that are definitively not meant to be rendered as text
        let splitText = null;
        try {
            const decodedText = firstDecodeTextMethod(input);
            splitText = processNewLines(decodedText);
        } catch (err) {
            const errorMessage = `Could not convert '${lumpId}' to text (WAD: '${wadId}').`;
            const id = INVALID_TEXT;
            const error = {
                id,
                message: errorMessage,
            };

            // console.error(error, { err });

            postMessage({
                wadId,
                lumpId,
                error,
            });

            return;
        }

        output = splitText;

        setCacheItemAsBlob({ cacheId: wadId, requestURL, responseData: output });
    }

    postMessage({
        wadId,
        lumpId,
        output,
        convertedFormat,
    });
};
