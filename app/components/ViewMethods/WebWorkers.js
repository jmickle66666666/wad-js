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
        formatCheck = () => true,
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
                    && formatCheck(lump.originalFormat);
            });

        const lumpObject = {};
        for (let i = 0; i < unconvertedLumps.length; i++) {
            const lump = unconvertedLumps[i];
            lumpObject[lump.name] = extractLumpData(lump);
        }

        return {
            lumps: lumpObject,
            firstLump: unconvertedLumps[0],
            count: unconvertedLumps.length,
        };
    }

    addItemsToTargetObject = ({
        wad,
        targetObject,
        items,
        newQueue,
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
                    [wad.id]: {},
                },
            },
        };
    }

    removeItemFromQueue = ({
        targetObject,
        wadId,
        lumpType,
        lumpId,
        items,
    }) => {
        // didn't work: remove item from queue (otherwise, we get stuck in infinite loop)
        const wadQueueLumpNames = Object.keys(items.queue[wadId][lumpType] || {});
        const updatedLumpTypeQueue = {};
        for (let i = 0; i < wadQueueLumpNames.length; i++) {
            const lumpName = wadQueueLumpNames[i];
            if (lumpName !== lumpId) {
                updatedLumpTypeQueue[lumpName] = { ...items.queue[wadId][lumpType][lumpName] };
            }
        }

        return {
            [targetObject]: {
                ...items,
                queue: {
                    ...items.queue,
                    [wadId]: {
                        ...items.queue[wadId],
                        [lumpType]: {
                            ...updatedLumpTypeQueue,
                        },
                    },
                },
            },
        };
    }

    moveItemFromWadQueueToConvertedItems = ({
        targetObject,
        wadId,
        lumpType,
        lumpId,
        items,
        newItem,
    }) => {
        if (!lumpType) {
            console.error('An error occurred while moving an item from queue to converted: Invalid lumpType.', { lumpType });
            return {};
        }

        const wadConverted = items.converted[wadId];
        const wadQueueLumpNames = Object.keys(items.queue[wadId][lumpType] || {});
        const updatedLumpTypeQueue = {};
        for (let i = 0; i < wadQueueLumpNames.length; i++) {
            const lumpName = wadQueueLumpNames[i];
            if (lumpName !== lumpId) {
                updatedLumpTypeQueue[lumpName] = { ...items.queue[wadId][lumpType][lumpName] };
            }
        }

        return {
            [targetObject]: {
                ...items,
                queue: {
                    ...items.queue,
                    [wadId]: {
                        ...items.queue[wadId],
                        [lumpType]: {
                            ...updatedLumpTypeQueue,
                        },
                    },
                },
                converted: {
                    ...items.converted,
                    [wadId]: {
                        ...wadConverted,
                        [lumpType]: {
                            ...wadConverted[lumpType],
                            [lumpId]: newItem,
                        },
                    },
                },
            },
        };
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

    getNextItemInQueue = ({ targetObject, wadId }) => {
        const { [targetObject]: { queue } } = this.state;

        let nextLump = {};

        const currentWadQueue = queue[wadId];
        const currentWadQueueLumpTypes = Object.keys(currentWadQueue || {});

        if (currentWadQueueLumpTypes.length > 0) {
            for (let i = 0; i < currentWadQueueLumpTypes.length; i++) {
                const lumpType = currentWadQueueLumpTypes[i];
                const currentWadQueueLumpNames = Object.keys(queue[wadId][lumpType] || {});
                if (currentWadQueueLumpNames.length > 0) {
                    const nextLumpName = currentWadQueueLumpNames[0];
                    nextLump = queue[wadId][lumpType][nextLumpName];

                    return {
                        nextLump,
                        nextLumpType: lumpType,
                        nextWadId: wadId,
                    };
                }
            }
        }

        console.log(`Conversion queue for '${targetObject}/${wadId}' is empty.`);
        return { done: true };
    }

    workerError(error) {
        console.error('A worker errored out.', { error });
    }

    createAndStartQueue = ({
        workerStarter,
        targetObject,
        formatCheck,
        handleNextLump,
        queueStarted = () => {},
        wad,
    }) => {
        const lumpTypes = Object.keys(wad.lumps || {});

        let lumps = {};
        let totalLumpCount = 0;
        let firstLump = null;
        for (let i = 0; i < lumpTypes.length; i++) {
            const lumpType = lumpTypes[i];

            const {
                lumps: lumpsInType,
                firstLump: firstLumpInType,
                count: lumpCountInType,
            } = this.getLumps({
                wad,
                lumpType,
                targetObject,
                formatCheck,
            });

            lumps = {
                ...lumps,
                [lumpType]: {
                    ...lumpsInType,
                },
            };

            totalLumpCount += lumpCountInType;

            if (!firstLump) {
                firstLump = firstLumpInType;
            }
        }

        if (totalLumpCount > 0) {
            const { done } = this.getNextItemInQueue({
                targetObject,
                wadId: wad.id,
            });

            // get the worker going if there is nothing in the queue
            if (done && firstLump) {
                workerStarter();
                handleNextLump({
                    nextLump: firstLump,
                    nextWadId: wad.id,
                });
            }

            this.setState((prevState) => {
                const items = prevState[targetObject];
                return this.addItemsToTargetObject({
                    wad,
                    targetObject,
                    items,
                    newQueue: lumps,
                });
            }, () => queueStarted());
        }
    }

    saveConvertedLump = ({
        targetObject,
        handleNextLump,
        lumpSaved,
        payload,
    }) => {
        const {
            wadId,
            lumpType,
            lumpId,
            output,
        } = payload.data;

        // didn't work: remove MUS from queue (otherwise, we get stuck in infinite loop)
        if (!output) {
            this.setState((prevState) => {
                const items = prevState[targetObject];
                return this.removeItemFromQueue({
                    targetObject,
                    wadId,
                    lumpType,
                    lumpId,
                    items,
                });
            }, () => {
                const {
                    nextLump,
                    nextWadId,
                    done,
                } = this.getNextItemInQueue({
                    targetObject,
                    wadId,
                });

                if (!done) {
                    handleNextLump({
                        nextLump,
                        nextWadId,
                    });
                }
            });
            return;
        }

        // it worked
        this.setState((prevState) => {
            const items = prevState[targetObject];
            return this.moveItemFromWadQueueToConvertedItems({
                targetObject,
                wadId,
                lumpType,
                lumpId,
                items,
                newItem: output,
            });
        }, () => {
            const {
                nextLump,
                nextLumpType,
                nextWadId,
                done,
            } = this.getNextItemInQueue({
                targetObject,
                wadId,
            });

            if (!done) {
                handleNextLump({ nextLump, nextLumpType, nextWadId });
            }

            if (lumpSaved) {
                lumpSaved();
            }
        });
    }

    // Web worker instances control

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
