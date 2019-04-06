import {
    ANSI_LUMPS,
    INVALID_TEXT,
} from '../lib/constants';

const decodeText = data => decodeURI(new TextDecoder('utf-8').decode(data).replace(/\u0000/g, ' '));

const processNewLines = text => text.split('\n');

onmessage = (message) => {
    const { wadId, lumpId, data } = message.data;

    console.log(`Converting '${lumpId}' to text (WAD: '${wadId}') ...`);

    if (ANSI_LUMPS.includes(lumpId)) {
        console.log(`'${lumpId}' is an ANSI screen (WAD: '${wadId}').`);


        // TODO: convert bytes to a renderable object;

        const text = '';

        postMessage({
            wadId,
            lumpId,
            text,
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

        return;
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
