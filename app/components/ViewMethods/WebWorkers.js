import MidiConverter from './MidiConverter';

export default class WebWorkers extends MidiConverter {
    startWorker({
        workerId,
        workerClass,
        onmessage = () => { },
        onerror = this.workerError,
    }) {
        // eslint-disable-next-line new-cap
        this[workerId] = new workerClass();
        this[workerId].onmessage = onmessage;
        this[workerId].onerror = onerror;
    }

    getLumps = ({
        targetObject,
        wad,
        lumpType,
        originalFormat,
        extractLumpData = lump => lump,
    }) => {
        const lumpIds = Object.keys(wad.lumps[lumpType] || {});

        const unconvertedLumps = lumpIds
            .map(lumpId => wad.lumps[lumpType][lumpId])
            .filter((lump) => {
                // eslint-disable-next-line react/destructuring-assignment
                const items = this.state[targetObject];
                const alreadyExists = (
                    items.converted[wad.id]
                    && items.converted[wad.id][lump.name]
                );
                return !alreadyExists
                    && (!originalFormat || lump.originalFormat === originalFormat);
            });

        const lumpObject = {};
        for (let i = 0; i < unconvertedLumps.length; i++) {
            const lump = unconvertedLumps[i];
            lumpObject[lump.name] = extractLumpData(lump);
        }

        return {
            lumps: lumpObject,
            firstLump: unconvertedLumps[0],
            count: lumpIds.length,
        };
    }

    addItemsToTargetObject = ({
        wad,
        targetObject,
        items,
        newQueue,
        newConvertedItems = {},
    }) => {
        const wadItems = items.queue[wad.id];
        return {
            [targetObject]: {
                ...items,
                queue: {
                    ...items.queue,
                    [wad.id]: {
                        ...wadItems,
                        ...newQueue,
                    },
                },
                converted: {
                    ...items.converted,
                    [wad.id]: {
                        ...wadItems,
                        ...newConvertedItems,
                    },
                },
            },
        };
    }

    removeItemFromQueue = ({ targetObject, wadId, lumpId }) => {
        // didn't work: remove item from queue (otherwise, we get stuck in infinite loop)
        this.setState((prevState) => {
            const items = prevState[targetObject];
            const wadQueueIds = Object.keys(items.queue[wadId] || {});
            const updatedWadQueue = {};
            for (let i = 0; i < wadQueueIds.length; i++) {
                const lumpName = wadQueueIds[i];
                if (lumpName !== lumpId) {
                    updatedWadQueue[lumpName] = { ...items.queue[wadId][lumpName] };
                }
            }

            return {
                [targetObject]: {
                    ...items,
                    queue: {
                        ...items.queue,
                        [wadId]: {
                            ...updatedWadQueue,
                        },
                    },
                },
            };
        });
    }

    removeWadFromTargetObject = ({ targetObject, wadId }, callback) => {
        this.setState((prevState) => {
            const items = prevState[targetObject];

            return {
                [targetObject]: {
                    ...items,
                    queue: {
                        ...items.queue,
                        [wadId]: {},
                    },
                    converted: {
                        ...items.converted,
                        [wadId]: {},
                    },
                },
            };
        }, () => {
            if (callback) {
                callback(wadId);
            }
        });
    }

    clearTargetObject = ({ targetObject }) => {
        this.setState(() => ({
            [targetObject]: {
                queue: {},
                converted: {},
            },
        }));
    }

    moveItemFromWadQueueToConvertedItems = ({
        targetObject,
        wadId,
        lumpId,
        items,
        newItem,
    }) => {
        const wadConverted = items.converted[wadId];
        const wadQueueIds = Object.keys(items.queue[wadId] || {});
        const updatedWadQueue = {};
        for (let i = 0; i < wadQueueIds.length; i++) {
            const lumpName = wadQueueIds[i];
            if (lumpName !== lumpId) {
                updatedWadQueue[lumpName] = { ...items.queue[wadId][lumpName] };
            }
        }

        return {
            [targetObject]: {
                ...items,
                queue: {
                    ...items.queue,
                    [wadId]: {
                        ...updatedWadQueue,
                    },
                },
                converted: {
                    ...items.converted,
                    [wadId]: {
                        ...wadConverted,
                        [lumpId]: newItem,
                    },
                },
            },
        };
    }

    getNextItemInQueue = ({ targetObject, wadId }) => {
        const { [targetObject]: { queue } } = this.state;

        let nextLump = {};

        const currentWadQueueIds = Object.keys(queue[wadId] || {});

        if (currentWadQueueIds.length > 0) {
            nextLump = queue[wadId][currentWadQueueIds[0]];
            return {
                nextLump,
                nextWadId: wadId,
            };
        }

        const wadIds = Object.keys(queue);

        let foundLumps = false;
        let j = 0;
        while (!foundLumps) {
            if (j === wadIds.length) {
                break;
            }

            const nextWadId = wadIds[j];
            const nextWadQueue = queue[nextWadId];
            const nextWadQueueIds = Object.keys(nextWadQueue);

            if (nextWadQueueIds.length > 0) {
                foundLumps = true;
                const nextLumpId = nextWadQueueIds[0];
                return {
                    nextLump: nextWadQueue[nextLumpId],
                    nextWadId,
                };
            }

            j++;
        }

        console.log(`Conversion queue for '${targetObject}' is empty.`);
        return { done: true };
    }

    workerError(error) {
        console.error('A worker errored out.', { error });
    }

    convertLumps = ({ wad }) => {
        this.addToMidiConversionQueue({ wad });
        this.addToSimpleImageConversionQueue({ wad });
        this.addToTextConversionQueue({ wad });
    }

    stopConvertingWadItems = ({ wadId }) => {
        this.removeWadFromTargetObject({ targetObject: 'midis', wadId }, this.updateMidiSelection);
        this.removeWadFromTargetObject({ targetObject: 'simpleImages', wadId });
        this.removeWadFromTargetObject({ targetObject: 'text', wadId });
    }

    stopConvertingAllWads = () => {
        this.clearTargetObject({ targetObject: 'midis' });
        this.clearTargetObject({ targetObject: 'simpleImages' });
        this.removeWadFromTargetObject({ targetObject: 'text' });
    }
}
