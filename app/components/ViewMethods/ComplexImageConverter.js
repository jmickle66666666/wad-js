import MediaPlayer from './MediaPlayer';

import offscreenCanvasSupport from '../../lib/offscreenCanvasSupport';
import ComplexImageConverter from '../../webWorkers/complexImageConverter';

const { supported: offscreenCanvasSupported } = offscreenCanvasSupport();

export default class ComplexImageConverterMethods extends MediaPlayer {
    startComplexImageConverterWorker() {
        this.startWorker({
            workerId: 'complexImageConverter',
            workerClass: ComplexImageConverter,
            onmessage: this.saveConvertedComplexImage,
        });
    }

    addToComplexImageConversionQueue({ wad }) {
        if (!offscreenCanvasSupported) {
            return;
        }

        this.createAndStartQueue({
            workerStarter: () => this.startComplexImageConverterWorker(),
            targetObject: 'complexImages',
            formatCheck: lumpFormat => lumpFormat === 'complexImage',
            handleNextLump: this.sendNextComplexImageLump,
            wad,
        });
    }

    sendNextComplexImageLump = ({ nextLump, nextWadId }) => {
        this.catchErrors(() => {
            const { wads } = this.state;
            const nextWad = wads[nextWadId];
            this.complexImageConverter.postMessage({
                wadId: nextWadId,
                lump: nextLump,
                palette: nextWad && nextWad.palette,
            });
        });
    }

    saveConvertedComplexImage = (payload) => {
        this.saveConvertedLump({
            targetObject: 'complexImages',
            handleNextLump: this.sendNextComplexImageLump,
            payload,
        });
    }
}
