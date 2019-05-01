import SimpleImageConverter from './SimpleImageConverter';

import TextConverter from '../../webWorkers/textConverter';

export default class TextConverterMethods extends SimpleImageConverter {
    startTextConverterWorker() {
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
            this.textConverter.postMessage({
                wadId: nextWadId,
                lumpId: nextLump.name,
                lumpType: nextLump.type,
                input: nextLump.data,
            });
        });
    }

    saveConvertedText = (payload) => {
        this.saveConvertedLump({
            targetObject: 'text',
            handleNextLump: this.sendNextTextLump,
            payload,
        });
    }
}
