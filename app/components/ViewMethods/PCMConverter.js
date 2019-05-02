import MidiConverter from './MidiConverter';

import { WEB_WORKER_MAX_RETRIES } from '../../lib/constants';
import PCMConverter from '../../webWorkers/pcmConverter';

export default class PCMConverterMethods extends MidiConverter {
    startPCMConverterWorker = () => {
        this.startWorker({
            workerId: 'pcmConverter',
            workerClass: PCMConverter,
            onmessage: this.saveConvertedPCM,
        });
    }

    addToPCMConversionQueue({ wad }) {
        this.createAndStartQueue({
            workerId: 'pcmConverter',
            workerStarter: () => this.startPCMConverterWorker(),
            targetObject: 'pcms',
            formatCheck: lumpFormat => lumpFormat === 'DMX',
            handleNextLump: this.sendNextPCMLump,
            wad,
        });
    }

    sendNextPCMLump = ({ nextLump, nextWadId }) => {
        this.catchErrors(() => {
            let nextLumpInQueue = {};
            if (!nextLump && nextWadId) {
                const result = this.getNextItemInQueue({
                    targetObject: 'pcmConverter',
                    wadId: nextWadId,
                });

                nextLumpInQueue = result.nextLump;
            }

            this.pcmConverter.postMessage({
                wadId: nextWadId,
                lump: nextLump || nextLumpInQueue,
            });
        }, () => this.restartConvertingWads({ nextLump, nextWadId }),
        { displayErrorMessage: this.pcmConverterRetries === WEB_WORKER_MAX_RETRIES });
    }

    saveConvertedPCM = (payload) => {
        this.saveConvertedLump({
            targetObject: 'pcms',
            handleNextLump: this.sendNextPCMLump,
            payload,
        });
    }

    restartPCMConverterWorker = (nextPayload) => {
        this.addGlobalMessage({
            type: 'info',
            id: 'pc',
            text: 'Restarting pcmConverter...',
        });

        this.restartWebWorker({
            workerId: 'pcmConverter',
            workerStarter: this.startPCMConverterWorker,
            sendNextLump: () => this.sendNextPCMLump(nextPayload),
        });
    }
}
