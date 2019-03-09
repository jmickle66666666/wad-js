import moment from 'moment';

import JSZip from 'jszip';

export default class Wad {
    constructor() {
        this.errors = {};
        this.lumps = {};
    }

    isValidType = (wadType) => {
        const type = wadType || this.wadType;

        if (type === 'IWAD' || type === 'PWAD') {
            return true;
        }

        return false;
    }

    checkZipFile = (blob) => {
        const fileSignature = blob.getUint32(0, false).toString(16);
        const isZipped = fileSignature === '504b0304';
        this.isZipped = isZipped;
        return isZipped;
    }

    unZipFile = (blob, callback) => {
        const zip = new JSZip();

        zip.loadAsync(blob)
            .then((unzippedContent) => {
                const filenames = Object.keys(unzippedContent.files).map(filename => filename);

                // TODO: have a stronger check for WAD files
                const wadFilenames = filenames.filter(filename => filename.toLowerCase().includes('.wad'));

                if (wadFilenames.length === 0) {
                    this.errors.not_found = `No WAD file found in '${this.name}'.`;
                    callback(this);
                    return;
                }

                // TODO: handle more than 1 zipped wad
                if (wadFilenames.length > 1) {
                    this.errors.zip_multiple_wads = `${wadFilenames.length} WAD files found in '${this.name}'. Extracting multiple WADs from the same ZIP file is not supported at this time.`;
                    callback(this);
                    return;
                }

                console.info(`Extracting '${wadFilenames[0]}' from '${this.name}'...`);

                unzippedContent.file(wadFilenames[0]).async('arrayBuffer')
                    .then((wad) => {
                        this.bytesLoaded = wad.byteLength;
                        this.size = wad.byteLength;
                        this.processBlob(wad, callback);
                    });
            })
            .catch((error) => {
                console.error(`An error occurred while unzipping '${this.name}'.`, error);
                this.errors.unzip_error = error;
                callback(this);
            });
    }

    processBlob = (blob, callback) => {
        const data = new DataView(blob);

        this.checkZipFile(data);

        if (this.isZipped) {
            this.unZipFile(blob, callback);
            return false;
        }

        this.bytesLoaded = this.size;
        this.uploadEndAt = moment().utc().format();

        const {
            wadType,
            headerLumpCount,
            indexAddress,
        } = this.readHeader(data);

        if (!this.isValidType(wadType)) {
            const error = `'${this.name}' is not a valid WAD file.`;
            this.errors.invalidType = error;
            callback(this);

            return false;
        }

        this.wadType = wadType;
        this.headerLumpCount = headerLumpCount;
        this.indexLumpCount = 0;
        this.indexAddress = indexAddress;
        this.indexOffset = indexAddress;

        callback(this);

        this.readLumpIndex(data, callback);

        return true;
    }

    initReader = (callback) => {
        const reader = new FileReader();
        this.errors = {};

        reader.onerror = (error) => {
            this.errors.read_error = error;
            callback(this);
        };

        reader.onloadstart = () => {
            this.errors = {};
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

            this.processBlob(result, callback);
        };

        return reader;
    }

    readLumpIndex = (data, callback) => {
        let x = 0;
        for (let i = this.indexOffset; i < data.byteLength; i += 16) {
            x++;
            this.indexLumpCount = x;

            const address = data.getInt32(i, true);
            const size = data.getInt32(i + 4, true);

            let name = '';

            for (let j = i + 8; j < i + 16; j++) {
                if (data.getUint8(j) !== 0) {
                    name += String.fromCharCode(data.getUint8(j));
                }
            }

            const lump = {
                address,
                size,
                name,
            };

            this.lumps[name] = lump;
        }

        callback(this);
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

    readLocalFile = (file, callback) => {
        const timestamp = moment().utc();

        this.uploadStartAt = timestamp.format();
        this.name = file.name;
        this.id = `${file.name}_${timestamp.unix()}`;

        const reader = this.initReader(callback);
        reader.readAsArrayBuffer(file);
    }

    readRemoteFile = (url, filename, callback, unique = false) => {
        const timestamp = moment().utc();

        this.uploadStartAt = timestamp.format();
        this.name = filename;
        this.id = unique ? filename : `${filename}_${timestamp.unix()}`;

        fetch(url)
            .then(response => response.arrayBuffer())
            .then((result) => {
                this.bytesLoaded = result.byteLength;
                this.size = result.byteLength;

                this.processBlob(result, callback);
            })
            .catch((error) => {
                console.error(`An error occurred while uploading '${filename}'.`, error);
                this.errors.upload_error = error;
            });
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
            lumps,
        } = wad;

        this.id = id;
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
        this.lumps = lumps;
    }

    get uploadedPercentage() {
        const progress = this.bytesLoaded / this.size * 100;
        return Math.ceil(progress);
    }

    get uploaded() {
        return this.uploadedPercentage >= 100;
    }

    get processed() {
        return this.headerLumpCount === this.indexLumpCount;
    }
}
