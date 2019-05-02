import ComplexImageConverter from './ComplexImageConverter';

import offscreenCanvasSupport from '../../lib/offscreenCanvasSupport';
import SimpleImageConverter from '../../webWorkers/simpleImageConverter';

const { supported: offscreenCanvasSupported } = offscreenCanvasSupport();

export default class SimpleImageConverterMethods extends ComplexImageConverter {
    startSimpleImageConverterWorker = () => {
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
            workerId: 'simpleImageConverter',
            workerStarter: () => this.startSimpleImageConverterWorker(),
            targetObject: 'simpleImages',
            formatCheck: lumpFormat => lumpFormat === 'simpleImage',
            handleNextLump: this.sendNextSimpleImageLump,
            wad,
        });
    }

    sendNextSimpleImageLump = ({ nextLump, nextWadId }) => {
        this.catchErrors(() => {
            let nextLumpInQueue = {};
            if (!nextLump && nextWadId) {
                const result = this.getNextItemInQueue({
                    targetObject: 'pcmConverter',
                    wadId: nextWadId,
                });

                nextLumpInQueue = result.nextLump;
            }

            const { wads } = this.state;
            const nextWad = wads[nextWadId];

            this.simpleImageConverter.postMessage({
                wadId: nextWadId,
                lump: nextLump || nextLumpInQueue,
                palette: nextWad && nextWad.palette,
            });
        }, () => this.restartSimpleImageConverterWorker({ nextLump, nextWadId }),
        { displayErrorMessage: this.simpleImageConverterRetries === 3 });
    }

    saveConvertedSimpleImage = (payload) => {
        const { output } = payload.data;

        let payloadWithBlobUrl = {};
        let blobUrl = null;

        if (output) {
            blobUrl = URL.createObjectURL(new Blob([output]));

            payloadWithBlobUrl = {
                ...payload,
                data: {
                    ...payload.data,
                    output: blobUrl,
                },
            };
        }

        this.saveConvertedLump({
            targetObject: 'simpleImages',
            handleNextLump: this.sendNextSimpleImageLump,
            payload: payloadWithBlobUrl,
        });
    }

    restartSimpleImageConverterWorker = (nextPayload) => {
        this.addGlobalMessage({
            type: 'info',
            id: 'sic',
            text: 'Restarting simpleImageConverter...',
        });

        this.restartWebWorker({
            workerId: 'simpleImageConverter',
            workerStarter: this.startSimpleImageConverterWorker,
            sendNextLump: () => this.sendNextSimpleImageLump(nextPayload),
        });
    }
}
