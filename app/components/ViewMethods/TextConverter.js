import SimpleImageConverter from './SimpleImageConverter';

import TextConverter from '../../webWorkers/textConverter';

export default class TextConverterMethods extends SimpleImageConverter {
    textConverter = new TextConverter()

    startTextConverterWorker() {
        this.startWorker({
            workerId: 'textConverter',
            workerClass: TextConverter,
            onmessage: this.saveConvertedText,
        });
    }

    addToTextConversionQueue({ wad }) {
        if (!wad.lumps.uncategorized) {
            return;
        }

        const {
            lumps: textLumps,
            firstLump: firstTextLump,
            count: textLumpCount,
        } = this.getLumps({
            wad,
            lumpType: 'uncategorized',
            targetObject: 'text',
            originalFormat: null,
        });

        if (textLumpCount > 0) {
            const { done } = this.getNextItemInQueue({
                targetObject: 'text',
                wadId: wad.id,
            });

            // get the worker going if there is nothing in the queue
            if (done && firstTextLump) {
                const { name: lumpId, data } = firstTextLump;

                this.startTextConverterWorker();
                this.textConverter.postMessage({
                    wadId: wad.id,
                    lumpId,
                    input: data,
                });
            }

            this.setState((prevState) => {
                const { text } = prevState;

                return this.addItemsToTargetObject({
                    wad,
                    targetObject: 'text',
                    items: text,
                    newQueue: textLumps,
                });
            });
        }
    }

    saveConvertedText = (payload) => {
        const { wadId, lumpId, output } = payload.data;

        // didn't work: remove MUS from queue (otherwise, we get stuck in infinite loop)
        if (!output) {
            this.removeItemFromQueue({
                targetObject: 'text',
                wadId,
                lumpId,
            });
        }

        // it worked
        this.setState((prevState) => {
            const { text } = prevState;
            return this.moveItemFromWadQueueToConvertedItems({
                targetObject: 'text',
                wadId,
                lumpId,
                items: text,
                newItem: output,
            });
        }, () => {
            const { nextLump, nextWadId, done } = this.getNextItemInQueue({
                targetObject: 'text',
                wadId,
            });

            if (!done) {
                this.textConverter.postMessage({
                    wadId: nextWadId,
                    lumpId: nextLump.name,
                    input: nextLump.data,
                });
            }
        });
    }
}
