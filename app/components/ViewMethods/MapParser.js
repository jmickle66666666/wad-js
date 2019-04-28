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
            workerStarter: () => this.startMapParserWorker(),
            targetObject: 'maps',
            lumpCheck: lump => lump.type === 'maps',
            handleNextLump: this.sendNextMapLump,
            wad,
        });
    }

    sendNextMapLump = ({ nextLump, nextWadId }) => {
        this.mapParser.postMessage({
            wadId: nextWadId,
            lump: nextLump,
        });
    }

    saveParsedMap = (payload) => {
        this.saveConvertedLump({
            targetObject: 'maps',
            handleNextLump: this.sendNextMapLump,
            payload,
        });
    }
}
