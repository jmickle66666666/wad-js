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
        return `${this.size} bytes`;
    }
}
