export default ({ height, width }) => {
    const canvas = new OffscreenCanvas(height, width);
    canvas.height = height;
    canvas.width = width;
    const context = canvas.getContext('2d');

    return {
        canvas,
        context,
    };
};
