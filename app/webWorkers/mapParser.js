import {
} from '../lib/constants';

onmessage = (message) => {
    const { wadId, lumpId, data } = message.data;

    // console.log(`Parsing map '${lumpId}' (WAD: '${wadId}') ...`);

    const mapData = {};


    postMessage({
        wadId,
        lumpId,
        mapData,
    });
};
