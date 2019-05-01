import PCMConverter from './PCMConverter';

import mapParser from '../../webWorkers/mapParser';

export default class MapParser extends PCMConverter {
    startMapParserWorker() {
        this.startWorker({
            workerId: 'mapParser',
            workerClass: mapParser,
            onmessage: this.saveParsedMap,
        });
    }

    addToMapParserQueue({ wad }) {
        this.createAndStartQueue({
            workerId: 'mapParser',
            workerStarter: () => this.startMapParserWorker(),
            targetObject: 'maps',
            lumpCheck: lump => lump.type === 'maps',
            handleNextLump: this.sendNextMapLump,
            wad,
        });
    }

    sendNextMapLump = ({ nextLump, nextWadId }) => {
        this.catchErrors(() => {
            const { wads } = this.state;
            const nextWad = wads[nextWadId];


            const {
                name,
                type,
                data,
            } = nextLump;

            const {
                SECTORS,
                LINEDEFS,
                SIDEDEFS,
                VERTEXES,
                THINGS,
            } = data;

            const trimmedLump = {
                name,
                type,
                data: {
                    SECTORS,
                    LINEDEFS,
                    SIDEDEFS,
                    VERTEXES,
                    THINGS,
                },
            };

            this.mapParser.postMessage({
                wadId: nextWadId,
                lump: trimmedLump,
                palette: nextWad && nextWad.palette,
            });
        });
    }

    saveParsedMap = (payload) => {
        const { output } = payload.data;

        let payloadWithBlobUrl = {};
        let blobUrl = null;

        if (output) {
            blobUrl = URL.createObjectURL(new Blob([output.preview]));

            payloadWithBlobUrl = {
                ...payload,
                data: {
                    ...payload.data,
                    output: {
                        ...payload.data.output,
                        preview: blobUrl,
                    },
                },
            };
        }

        this.saveConvertedLump({
            targetObject: 'maps',
            handleNextLump: this.sendNextMapLump,
            payload: payloadWithBlobUrl,
        });
    }
}
