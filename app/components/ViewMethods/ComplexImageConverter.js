import MediaPlayer from './MediaPlayer';

import { WEB_WORKER_MAX_RETRIES } from '../../lib/constants';
import offscreenCanvasSupport from '../../lib/offscreenCanvasSupport';
import ComplexImageConverter from '../../webWorkers/complexImageConverter';

const { supported: offscreenCanvasSupported } = offscreenCanvasSupport();

export default class ComplexImageConverterMethods extends MediaPlayer {
    startComplexImageConverterWorker = () => {
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
            workerId: 'complexImageConverter',
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

            let nextLumpInQueue = {};
            if (!nextLump && nextWadId) {
                const result = this.getNextItemInQueue({
                    targetObject: 'complexImageConverter',
                    wadId: nextWadId,
                });

                nextLumpInQueue = result.nextLump;
            }

            this.complexImageConverter.postMessage({
                wadId: nextWadId,
                lump: nextLump || nextLumpInQueue,
                palette: nextWad && nextWad.palette,
            });
        }, () => this.restartConvertingWads({ nextLump, nextWadId }),
        { displayErrorMessage: this.complexImageConverterRetries === WEB_WORKER_MAX_RETRIES });
    }

    saveConvertedComplexImage = (payload) => {
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
            targetObject: 'complexImages',
            handleNextLump: this.sendNextComplexImageLump,
            payload: payloadWithBlobUrl,
        });
    }

    restartComplexImageConverterWorker = (nextPayload) => {
        this.addGlobalMessage({
            type: 'info',
            id: 'cic',
            text: 'Restarting complexImageConverter...',
        });

        this.restartWebWorker({
            workerId: 'complexImageConverter',
            workerStarter: this.startComplexImageConverterWorker,
            sendNextLump: () => this.sendNextComplexImageLump(nextPayload),
        });
    }
}
