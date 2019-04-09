import { COLOR_COUNT_PER_PALETTE } from '../lib/constants';

function buildColorIndexReferences(data) {
    const colorIndexReferences = [];

    for (let i = 0; i < data.byteLength; i++) {
        colorIndexReferences.push(data.getUint8(i));
    }

    return colorIndexReferences;
}

async function convertColorIndexesReferencesToBlob(
    colorIndexReferences,
    width,
    height,
    palette,
) {
    if (!palette || palette.length !== COLOR_COUNT_PER_PALETTE) {
        console.error('The palette does not have enough colors to draw images.');
        return null;
    }

    try {
        const canvas = new OffscreenCanvas(height, width);
        canvas.height = height;
        canvas.width = width;
        const context = canvas.getContext('2d');

        const imageData = context.createImageData(
            canvas.width,
            canvas.height,
        );

        for (let i = 0; i < colorIndexReferences.length; i++) {
            const { red, green, blue } = palette[colorIndexReferences[i]];
            imageData.data[(i * 4) + 0] = red;
            imageData.data[(i * 4) + 1] = green;
            imageData.data[(i * 4) + 2] = blue;
            imageData.data[(i * 4) + 3] = 255;
        }
        const newCanvas = new OffscreenCanvas(height, width);
        newCanvas.height = imageData.height;
        newCanvas.width = imageData.width;
        newCanvas.getContext('2d').putImageData(imageData, 0, 0);
        context.imageSmoothingEnabled = false;
        context.drawImage(newCanvas, 0, 0);

        const blob = await canvas.convertToBlob();

        return blob;
    } catch (error) {
        console.error('An error occurred while converting the color index references to a blob', { error });
        return '';
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
        data,
        width,
        height,
    } = lump;

    // console.log(`Converting '${name}' from simple color index references to PNG data URL (WAD: '${wadId}') ...`);

    const colorIndexReferences = buildColorIndexReferences(data);

    const blob = await convertColorIndexesReferencesToBlob(
        colorIndexReferences,
        width,
        height,
        palette,
    );

    if (blob) {
        // console.log(`Converted '${name}' from simple color index references to blob (WAD: '${wadId}').`);
    } else {
        console.error(`Could not convert '${name}' from simple color index references to blob (WAD: '${wadId}').`);
    }

    postMessage({
        wadId,
        lumpId: name,
        image: blob,
    });
};
