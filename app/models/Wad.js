import moment from 'moment';
import JSZip from 'jszip';

import Lump from './Lump';

import { MAPLUMPS, THINGS } from '../lib/constants';

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
                console.error(`An error occurred while unzipping '${this.name}'.`, { error });
                this.errors.unzip_error = error.message;
                callback(this);
            });
    }

    processBlob(blob, callback) {
        try {
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
                this.errors.invalid_wad_signature = error;
                callback(this);

                return false;
            }

            this.uploaded = true;
            this.wadType = wadType;
            this.headerLumpCount = headerLumpCount;
            this.indexLumpCount = 0;
            this.indexAddress = indexAddress;
            this.indexOffset = indexAddress;

            callback(this);

            this.readLumpIndex(blob, data, callback);

            return true;
        } catch (error) {
            console.error(`An error occurred while processing the file data of '${this.name}'.`, { error });
            this.errors.data_error = error.message;
            callback(this);

            return false;
        }
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

    handleMapLumpEntry(map, lumps, lumpIndexData, callback) {
        const updatedNonMapLumps = 0;
        let updatedMap = { ...map };
        const updatedLumps = { ...lumps };

        // we assume that 'THINGS' is the first lump that appears after the map name lump
        if (lumpIndexData.name === THINGS) {
            // it's time to dump the map object (which holds data about the previous map) into the list of lumps
            if (map.nameLump.name !== '') {
                const lump = this.createLumpIndex({
                    ...map.nameLump,
                    data: {
                        ...map.dataLumps,
                    },
                });
                updatedLumps[map.nameLump.name] = lump;

                // reset temporary map object
                updatedMap = {
                    nameLump: { name: '' },
                    dataLumps: {},
                };
            }

            // find the lump that holds the name of the map in the map object
            /* eslint-disable-next-line no-loop-func */
            const mapNameLumpId = Object.keys(lumps).find(lumpName => lumps[lumpName].index === lumpIndexData.index - 1);

            if (!mapNameLumpId) {
                const error = `Orphan map lump in '${this.name}': Could not find the map lump that '${lumpIndexData.name}' lump belongs to.`;
                this.errors.map_lump = error;
                callback(this);
            }

            const mapNameLump = lumps[mapNameLumpId];

            updatedMap.nameLump = {
                ...mapNameLump,
                type: 'map',
            };
        }

        updatedMap.dataLumps[lumpIndexData.name] = { ...lumpIndexData };

        return {
            updatedNonMapLumps,
            updatedMap,
            updatedLumps,
        };
    }

    handleLastMapLumpEntry(map, lumps, lumpIndexData, nonMapLumps) {
        let updatedNonMapLumps = nonMapLumps;
        let updatedMap = { ...map };
        const updatedLumps = { ...lumps };

        // we have not encountered map data lumps but we still have data in the temporary object
        updatedNonMapLumps += 1;

        // it looks like we are not going to encounter another map name lump, so dump the data in the proper map name lump and reset the temporary map object
        if (nonMapLumps > 2) {
            const lump = this.createLumpIndex({
                ...map.nameLump,
                data: {
                    ...map.dataLumps,
                },
            });
            updatedLumps[map.nameLump.name] = lump;

            // reset temporary map object
            updatedMap = {
                nameLump: { name: '' },
                dataLumps: {},
            };
        }

        const lump = this.createLumpIndex(lumpIndexData);
        updatedLumps[lumpIndexData.name] = lump;

        return {
            updatedNonMapLumps,
            updatedMap,
            updatedLumps,
        };
    }

    readLumpIndex(blob, data, callback) {
        let lumps = {};
        let nonMapLumps = 0;
        let map = {
            nameLump: { name: '' },
            dataLumps: {},
        };

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

            const lumpIndexData = {
                index: x,
                address,
                size,
                name,
            };

            if (MAPLUMPS.includes(name)) {
                const {
                    updatedNonMapLumps,
                    updatedMap,
                    updatedLumps,
                } = this.handleMapLumpEntry(map, lumps, lumpIndexData, callback);

                nonMapLumps = updatedNonMapLumps;
                map = { ...updatedMap };
                lumps = { ...updatedLumps };
            } else if (map.nameLump.name !== '') {
                const {
                    updatedNonMapLumps,
                    updatedMap,
                    updatedLumps,
                } = this.handleLastMapLumpEntry(map, lumps, lumpIndexData, nonMapLumps);

                nonMapLumps = updatedNonMapLumps;
                map = { ...updatedMap };
                lumps = { ...updatedLumps };
            } else {
                const lump = this.createLumpIndex(lumpIndexData);
                lumps[name] = lump;
            }

            // const lumpData = new DataView(blob, address);
            // console.log({ lumpData });
        }

        this.lumps = lumps;
        this.processed = true;

        callback(this);
    }

    createLumpIndex(lumpIndexData) {
        const lump = new Lump();
        lump.setIndexData(lumpIndexData);
        return lump;
    }

    checkLumpTypeFromHeader(data, string) {
        for (let i = 0; i < string.length; i++) {
            if (string.charCodeAt(i) !== data.getUint8(i)) return false;
        }
        return true;
    }

    readHeader(data) {
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

        if (['', 'application/zip'].includes(file.type)) {
            const reader = this.initReader(callback);
            reader.readAsArrayBuffer(file);
        } else {
            const error = `'${this.name}' is not a valid WAD file.`;
            this.errors.invalid_mime = error;
            callback(this);
        }
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
                console.error(`An error occurred while uploading '${filename}'.`, { error });
                this.errors.upload_error = error.message;
            });
    }

    restore = (wad) => {
        const {
            id,
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
        return Number.isNaN(progress) ? '' : Math.ceil(progress);
    }

    get lumpNames() {
        return Object.keys(this.lumps);
    }

    get errorIds() {
        return Object.keys(this.errors);
    }

    get megabyteSize() {
        const convertedSize = this.size / 1024 / 1024;
        const truncatedSize = convertedSize.toFixed(1);
        return `${truncatedSize} MB`;
    }
}
