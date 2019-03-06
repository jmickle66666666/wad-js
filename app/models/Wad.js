export default class Wad {
    constructor(file, callback) {
        this.raw = file;
        this.name = file.name;
        this.callback = callback;
        this.read();
    }

    initReader = () => {
        const reader = new FileReader();

        reader.onerror = (error) => {
            console.error(`An error occurred while uploading '${this.name}'.`, error);
            this.error = error;

            this.callback(this);
        };

        reader.onprogress = (data) => {
            if (data.lengthComputable) {
                const progress = data.loaded / data.total * 100;
                this.progress = Math.ceil(progress);
                this.error = null;

                this.callback(this);
            }
        };

        reader.onload = (event) => {
            const { result } = event.target;
            const data = new DataView(result);

            const {
                wadType,
                lumpCount,
                directoryPosition,
            } = this.readHeader(data);

            if (!this.isValidType(wadType)) {
                this.progress = 100;
                const error = `'${this.name}' is not a valid WAD file.`;
                this.error = error;
                console.error(error);

                this.callback(this);

                return false;
            }

            this.wadType = wadType;
            this.lumpCount = lumpCount;
            this.directoryPosition = directoryPosition;
            this.offset = directoryPosition;
            this.progress = 100;

            this.callback(this);

            return true;
        };

        return reader;
    }

    isValidType = (wadType) => {
        const type = wadType || this.wadType;

        if (type === 'IWAD' || type === 'PWAD') {
            return true;
        }

        return false;
    }

    readHeader = (data) => {
        const wadTypeData = [];

        for (let i = 0; i < 4; i++) {
            wadTypeData.push(String.fromCharCode(data.getUint8(i)));
        }

        const wadType = wadTypeData.join('');
        const lumpCount = data.getInt32(4, true);
        const directoryPosition = data.getInt32(8, true);

        return {
            wadType,
            lumpCount,
            directoryPosition,
        };
    }

    read = () => {
        const reader = this.initReader();
        this.reader = reader;

        reader.readAsArrayBuffer(this.raw);
    }
}
