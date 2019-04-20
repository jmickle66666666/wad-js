import MediaPlayer from './MediaPlayer';

import offscreenCanvasSupport from '../../lib/offscreenCanvasSupport';
import SimpleImageConverter from '../../webWorkers/simpleImageConverter';

const {
    supported: offscreenCanvasSupported,
    message: offscreenCanvasSupportMessage,
} = offscreenCanvasSupport();

export default class SimpleImageConverterMethods extends MediaPlayer {
    simpleImageConverter = new SimpleImageConverter();

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

        if (!wad.lumps.flats) {
            return;
        }

        const {
            lumps: flatLumps,
            firstLump: firstFlatLump,
            count: flatLumpCount,
        } = this.getLumps({
            wad,
            lumpType: 'flats',
            targetObject: 'simpleImages',
            originalFormat: null,
        });

        if (flatLumpCount > 0) {
            const { done } = this.getNextItemInQueue({
                targetObject: 'simpleImages',
                wadId: wad.id,
            });

            // get the worker going if there is nothing in the queue
            if (done) {
                this.startSimpleImageConverterWorker();
                this.simpleImageConverter.postMessage({
                    wadId: wad.id,
                    lump: firstFlatLump,
                    palette: wad && wad.palette,
                });
            }
        }

        this.setState((prevState) => {
            const { simpleImages } = prevState;
            return this.addItemsToTargetObject({
                wad,
                targetObject: 'simpleImages',
                items: simpleImages,
                newQueue: flatLumps,
            });
        });
    }

    saveConvertedSimpleImage = (payload) => {
        const { wadId, lumpId, output } = payload.data;

        // didn't work
        if (!output) {
            this.removeItemFromQueue({
                targetObject: 'simpleImages',
                wadId,
                lumpId,
            });
        }

        // it worked
        this.setState((prevState) => {
            const { simpleImages } = prevState;
            return this.moveItemFromWadQueueToConvertedItems({
                targetObject: 'simpleImages',
                wadId,
                lumpId,
                items: simpleImages,
                newItem: output,
            });
        }, () => {
            const { nextLump, nextWadId, done } = this.getNextItemInQueue({
                targetObject: 'simpleImages',
                wadId,
            });

            if (!done) {
                const { wads } = this.state;
                const nextWad = wads[nextWadId];
                this.simpleImageConverter.postMessage({
                    wadId: nextWadId,
                    lump: nextLump,
                    palette: nextWad && nextWad.palette,
                });
            }
        });
    }
}
