import {
    TRANSPARENT_PIXEL,
    COLOR_COUNT_PER_PALETTE,
} from './constants';

export default async function convertColorIndexesReferencesToBlob(
    colorIndexReferences,
    width,
    height,
    palette,
) {
    if (!palette || palette.length !== COLOR_COUNT_PER_PALETTE) {
        console.error('The palette does not have enough colors to draw images.', palette);
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
            if (colorIndexReferences[i] === TRANSPARENT_PIXEL) {
                imageData.data[(i * 4) + 3] = 0;
            } else {
                const { red, green, blue } = palette[colorIndexReferences[i]];
                imageData.data[(i * 4) + 0] = red;
                imageData.data[(i * 4) + 1] = green;
                imageData.data[(i * 4) + 2] = blue;
                imageData.data[(i * 4) + 3] = 255;
            }
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
        console.error('An error occurred while converting color index references to a blob', { error });
        return '';
    }
}
