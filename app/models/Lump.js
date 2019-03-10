export default class Lump {
    setIndexData({ address, size, name }) {
        this.address = address;
        this.size = size;
        this.name = name;
    }

    get sizeInBytes() {
        return `${this.size} bytes`;
    }
}
