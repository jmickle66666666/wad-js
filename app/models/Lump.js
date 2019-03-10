export default class Lump {
    setIndexData({
        name,
        type,
        index,
        address,
        size,
        data,
    }) {
        this.name = name;
        this.type = type;
        this.index = index;
        this.address = address;
        this.size = size;
        this.data = data;
    }

    get sizeInBytes() {
        if (this.type === 'map') {
            const cumulativeSize = Object.keys(this.data).map(dataLumpId => this.data[dataLumpId].size).reduce((sum, value) => sum + value, 0);
            return `${cumulativeSize} bytes`;
        }

        return `${this.size} bytes`;
    }
}
