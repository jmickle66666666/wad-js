import MediaPlayer from './MediaPlayer';

import offscreenCanvasSupport from '../../lib/offscreenCanvasSupport';
import SimpleImageConverter from '../../webWorkers/simpleImageConverter';

const { supported: offscreenCanvasSupported } = offscreenCanvasSupport();

export default class SimpleImageConverterMethods extends MediaPlayer {
    startSimpleImageConverterWorker() {
        this.startWorker({
            workerId: 'simpleImageConverter',
            workerClass: SimpleImageConverter,
            onmessage: this.saveConvertedSimpleImage,
        });
    }

    addToSimpleImageConversionQueue({ wad }) {
        if (!offscreenCanvasSupported) {
            return;
        }

        this.createAndStartQueue({
            workerStarter: () => this.startSimpleImageConverterWorker(),
            targetObject: 'simpleImages',
            formatCheck: lumpFormat => lumpFormat === 'simpleImage',
            handleNextLump: this.sendNextSimpleImageLump,
            wad,
        });
    }

    sendNextSimpleImageLump = ({ nextLump, nextWadId }) => {
        const { wads } = this.state;
        const nextWad = wads[nextWadId];
        this.simpleImageConverter.postMessage({
            wadId: nextWadId,
            lump: nextLump,
            palette: nextWad && nextWad.palette,
        });
    }

    saveConvertedSimpleImage = (payload) => {
        this.saveConvertedLump({
            targetObject: 'simpleImages',
            handleNextLump: this.sendNextSimpleImageLump,
            payload,
        });
    }
}
