import {
    ANSI_LUMPS,
    INVALID_TEXT,
    ANSI_BACKGROUND_COLOR_CODES,
    ANSI_FOREGROUND_COLOR_CODES,
    ANSI_CODE_PAGE_437_TABLES,
} from '../lib/constants';

const interpolateBackgroundAnsiCode = int => (
    int === Number.isNaN ? null : ANSI_BACKGROUND_COLOR_CODES[int]
);

const interpolateForegroundAnsiCode = int => (
    int === Number.isNaN ? null : ANSI_FOREGROUND_COLOR_CODES[int]
);

const parseAnsiScreen = (data) => {
    const blocks = [];
    let line = [];

    for (let i = 0; i <= data.byteLength; i += 2) {
        if (i !== 0 && i % 160 === 0) {
            blocks.push(line);
            line = [];
        }

        // last byte is unimportant but necessary to push the last line
        if (i === data.byteLength) {
            break;
        }

        const characterByte = data.getUint8(i);
        const character = ANSI_CODE_PAGE_437_TABLES[characterByte];

        const colorByte = data.getUint8(i + 1);

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

const decodeText = data => decodeURI(new TextDecoder('utf-8').decode(data).replace(/\u0000/g, ' '));

const processNewLines = text => text.split('\n');

onmessage = (message) => {
    const { wadId, lumpId, data } = message.data;

    console.log(`Converting '${lumpId}' to text (WAD: '${wadId}') ...`);

    if (ANSI_LUMPS.includes(lumpId)) {
        const screenData = parseAnsiScreen(data);

        postMessage({
            wadId,
            lumpId,
            text: screenData,
        });

        return;
    }

    // rules out certain lumps that are definitively not meant to be rendered as text
    let decodedText = null;
    try {
        decodedText = decodeText(data);
    } catch (err) {
        const errorMessage = `Could not convert '${lumpId}' to text (WAD: '${wadId}').`;
        const id = INVALID_TEXT;
        const error = {
            id,
            message: errorMessage,
        };

        console.error(error, { err });

        postMessage({
            wadId,
            lumpId,
            text: null,
            error,
        });
    }

    const splitText = processNewLines(decodedText);
    const text = splitText;


    console.log({ text });


    postMessage({
        wadId,
        lumpId,
        text,
    });
};
