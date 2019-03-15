export default class Lump {
    setIndexData({
        name,
        type,
        index,
        address,
        size,
        width,
        height,
        count,
        data,
        canvas,
    }) {
        this.name = name;
        this.type = type;
        this.index = index;
        this.address = address;
        this.size = size;
        this.width = width;
        this.height = height;
        this.count = count;
        this.data = data;
        this.canvas = canvas;
    }

    get sizeInBytes() {
        if (this.type === 'maps') {
            const cumulativeSize = Object.keys(this.data).map(dataLumpId => this.data[dataLumpId].size).reduce((sum, value) => sum + value, 0);
            return `${cumulativeSize} bytes`;
        }

        return `${this.size} bytes`;
    }
}
