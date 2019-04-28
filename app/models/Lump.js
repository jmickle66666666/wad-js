import {
    PNAMES,
    IMAGE_LUMPS,
    SNDINFO,
} from '../lib/constants';

export default class Lump {
    setIndexData({
        name,
        description,
        type,
        originalFormat,
        index,
        address,
        size,
        width,
        height,
        xOffset,
        yOffset,
        sampleRate,
        lineIndex,
        count,
        data,
    }) {
        this.name = name;
        this.description = description;
        this.type = type;
        this.originalFormat = originalFormat;
        this.index = index;
        this.address = address;
        this.size = size;
        this.width = width;
        this.height = height;
        this.xOffset = xOffset;
        this.yOffset = yOffset;
        this.sampleRate = sampleRate;
        this.lineIndex = lineIndex;
        this.count = count;
        this.data = data;
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

    get convertsToMidi() {
        return this.originalFormat === 'MUS' || this.originalFormat === 'MIDI';
    }

    get convertsToPCM() {
        return this.originalFormat === 'DMX';
    }

    get isPNAMES() {
        return this.name === PNAMES;
    }

    get isTEXTUREx() {
        return /TEXTURE[0-9a-zA-Z]$/.test(this.name);
    }

    get isSNDINFO() {
        return this.name === SNDINFO;
    }
}
