import moment from 'moment';

export default class Wad {
    initReader = (callback) => {
        const reader = new FileReader();
        this.errors = [];

        reader.onerror = (error) => {
            this.errors.push(error);
            callback(this);
        };

        reader.onloadstart = () => {
            this.errors = [];
        };

        reader.onprogress = (data) => {
            if (this.size === undefined) {
                this.size = data.total;
            }

            if (data.lengthComputable) {
                this.bytesLoaded = data.loaded;
                callback(this);
            }
        };

        reader.onload = (event) => {
            const { result } = event.target;
            const data = new DataView(result);

            this.bytesLoaded = this.size;
            this.uploadEndAt = moment().utc().format();

            const {
                wadType,
                headerLumpCount,
                indexAddress,
            } = this.readHeader(data);

            if (!this.isValidType(wadType)) {
                const error = `'${this.name}' is not a valid WAD file.`;
                this.errors.push(error);
                callback(this);

                return false;
            }

            this.wadType = wadType;
            this.headerLumpCount = headerLumpCount;
            this.indexLumpCount = 0;
            this.indexAddress = indexAddress;
            this.indexOffset = indexAddress;

            callback(this);

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

    get uploadedPercentage() {
        const progress = this.bytesLoaded / this.size * 100;
        return Math.ceil(progress);
    }

    get uploaded() {
        return this.errors.length === 0 && this.uploadedPercentage >= 100;
    }

    get processed() {
        return this.headerLumpCount === this.indexLumpCount;
    }

    readHeader = (data) => {
        const wadTypeData = [];

        for (let i = 0; i < 4; i++) {
            wadTypeData.push(String.fromCharCode(data.getUint8(i)));
        }

        const wadType = wadTypeData.join('');
        const headerLumpCount = data.getInt32(4, true);
        const indexAddress = data.getInt32(8, true);

        return {
            wadType,
            headerLumpCount,
            indexAddress,
        };
    }

    readFile = (file, callback) => {
        this.name = file.name;

        const timestamp = moment().utc();
        this.uploadStartAt = timestamp.format();
        this.id = `${file.name}_${timestamp.unix()}`;

        const reader = this.initReader(callback);
        reader.readAsArrayBuffer(file);
    }

    restore = (wad) => {
        const {
            name,
            wadType,
            headerLumpCount,
            indexLumpCount,
            indexAddress,
            indexOffset,
            bytesLoaded,
            size,
            errors,
            uploadStartAt,
            uploadEndAt,
            id,
        } = wad;

        this.name = name;
        this.wadType = wadType;
        this.headerLumpCount = headerLumpCount;
        this.indexLumpCount = indexLumpCount;
        this.indexAddress = indexAddress;
        this.indexOffset = indexOffset;
        this.bytesLoaded = bytesLoaded;
        this.size = size;
        this.errors = errors;
        this.uploadStartAt = uploadStartAt;
        this.uploadEndAt = uploadEndAt;
        this.id = id;
    }
}
