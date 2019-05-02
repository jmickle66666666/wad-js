import SimpleImageConverter from './SimpleImageConverter';

import { WEB_WORKER_MAX_RETRIES } from '../../lib/constants';
import TextConverter from '../../webWorkers/textConverter';

export default class TextConverterMethods extends SimpleImageConverter {
    startTextConverterWorker = () => {
        this.startWorker({
            workerId: 'textConverter',
            workerClass: TextConverter,
            onmessage: this.saveConvertedText,
        });
    }

    addToTextConversionQueue({ wad }) {
        this.createAndStartQueue({
            workerId: 'textConverter',
            workerStarter: () => this.startTextConverterWorker(),
            targetObject: 'text',
            formatCheck: lumpFormat => lumpFormat === 'text' || lumpFormat === 'ANSI',
            handleNextLump: this.sendNextTextLump,
            wad,
        });
    }

    sendNextTextLump = ({ nextLump, nextWadId }) => {
        this.catchErrors(() => {
            let nextLumpInQueue = {};
            if (!nextLump && nextWadId) {
                const result = this.getNextItemInQueue({
                    targetObject: 'pcmConverter',
                    wadId: nextWadId,
                });

                nextLumpInQueue = result.nextLump;
            }

            this.textConverter.postMessage({
                wadId: nextWadId,
                lump: nextLump || nextLumpInQueue,
            });
        }, () => this.restartConvertingWads({ nextLump, nextWadId }),
            { displayErrorMessage: this.textConverterRetries === WEB_WORKER_MAX_RETRIES });
    }

    saveConvertedText = (payload) => {
        this.saveConvertedLump({
            targetObject: 'text',
            handleNextLump: this.sendNextTextLump,
            payload,
        });
    }

    restartTextConverterWorker = (nextPayload) => {
        this.addGlobalMessage({
            type: 'info',
            id: 'tc',
            text: 'Restarting textConverter...',
        });

        this.restartWebWorker({
            workerId: 'textConverter',
            workerStarter: this.startTextConverterWorker,
            sendNextLump: () => this.sendNextTextLump(nextPayload),
        });
    }
}
