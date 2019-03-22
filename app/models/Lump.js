import { PNAMES, IMAGE_LUMPS } from '../lib/constants';

export default class Lump {
    setIndexData({
        name,
        type,
        originalFormat,
        index,
        address,
        size,
        width,
        height,
        xOffset,
        yOffset,
        count,
        data,
        midi,
    }) {
        this.name = name;
        this.type = type;
        this.originalFormat = originalFormat;
        this.index = index;
        this.address = address;
        this.size = size;
        this.width = width;
        this.height = height;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.count = count;
        this.data = data;
        this.midi = midi;
    }

    get sizeInBytes() {
        if (this.type === 'maps') {
            const cumulativeSize = Object.keys(this.data).map(dataLumpId => this.data[dataLumpId].size).reduce((sum, value) => sum + value, 0);
            return `${cumulativeSize} bytes`;
        }

        return `${this.size} bytes`;
    }

    get isImage() {
        return this.name !== PNAMES && IMAGE_LUMPS.includes(this.type);
    }

    get isMus() {
        return this.originalFormat === 'MUS';
    }

    get isPNAMES() {
        return this.name === PNAMES;
    }

    get isTEXTUREx() {
        return /TEXTURE[0-9a-zA-Z]$/.test(this.name);
    }
}
