import {
} from '../lib/constants';

onmessage = (message) => {
    const { wadId, lumpId, data } = message.data;

    console.log(`Converting '${lumpId}' to text (WAD: '${wadId}') ...`);

    const text = new TextDecoder().decode(data).replace(/\u0000/g, ' ');


    postMessage({
        wadId,
        lumpId,
        text,
    });
};
