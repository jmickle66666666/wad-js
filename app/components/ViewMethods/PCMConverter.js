import MidiConverter from './MidiConverter';

import PCMConverter from '../../webWorkers/pcmConverter';

export default class PCMConverterMethods extends MidiConverter {
    startPCMConverterWorker() {
        this.startWorker({
            workerId: 'pcmConverter',
            workerClass: PCMConverter,
            onmessage: this.saveConvertedPCM,
        });
    }

    addToPCMConversionQueue({ wad }) {
        this.createAndStartQueue({
            workerStarter: () => this.startPCMConverterWorker(),
            targetObject: 'pcms',
            formatCheck: lumpFormat => lumpFormat === 'DMX',
            handleNextLump: this.sendNextPCMLump,
            wad,
        });
    }

    sendNextPCMLump = ({ nextLump, nextWadId }) => {
        this.catchErrors(() => {
            this.pcmConverter.postMessage({
                wadId: nextWadId,
                lump: nextLump,
            });
        });
    }

    saveConvertedPCM = (payload) => {
        this.saveConvertedLump({
            targetObject: 'pcms',
            handleNextLump: this.sendNextPCMLump,
            payload,
        });
    }
}
