import MapParser from './MapParser';
import { deleteCache } from '../../lib/cacheManager';

export default class WebWorkers extends MapParser {
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
        lumpCheck = () => true,
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
                    && formatCheck(lump.originalFormat)
                    && lumpCheck(lump);
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

        const wadConverted = items.converted[wadId] || {};
        const wadQueueLumpNames = Object.keys((items.queue[wadId] && items.queue[wadId][lumpType]) || {});
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

    getNextItemInQueue = ({
        targetObject,
        lumpType,
        wadId,
    }) => {
        const { [targetObject]: { queue } } = this.state;

        let nextLump = {};

        const currentWadQueue = queue[wadId];
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

        const currentWadQueueLumpTypes = Object.keys(currentWadQueue || {});

        if (currentWadQueueLumpTypes.length > 0) {
            for (let i = 0; i < currentWadQueueLumpTypes.length; i++) {
                const scrutinizedLumpType = currentWadQueueLumpTypes[i];
                const scrutinizedWadQueueLumpNames = Object.keys(queue[wadId][scrutinizedLumpType] || {});
                if (scrutinizedWadQueueLumpNames.length > 0) {
                    const nextLumpName = scrutinizedWadQueueLumpNames[0];
                    nextLump = queue[wadId][scrutinizedLumpType][nextLumpName];

                    return {
                        nextLump,
                        nextLumpType: scrutinizedLumpType,
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
        lumpCheck,
        handleNextLump,
        queueStarted = () => { },
        wad,
    }) => {
        this.setState((prevState) => {
            const items = prevState[targetObject];
            // the target object does not exist yet
            // initialize with an empty queue and empty list of converted items
            if (!items) {
                return {
                    [targetObject]: {
                        converted: {},
                        queue: {},
                        ...prevState[targetObject],
                    },
                };
            }

            return {};
        }, () => {
            const lumpTypes = Object.keys(wad.lumps || {});

            let lumps = {};
            let totalLumpCount = 0;
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
                    lumpCheck,
                });

                lumps = {
                    ...lumps,
                    [lumpType]: {
                        ...lumpsInType,
                    },
                };

                totalLumpCount += lumpCountInType;

                if (firstLumpInType) {
                    workerStarter();
                    handleNextLump({
                        nextLump: firstLumpInType,
                        nextWadId: wad.id,
                    });
                }
            }

            if (totalLumpCount > 0) {
                this.setState((prevState) => {
                    const prevItems = prevState[targetObject];
                    return this.addItemsToTargetObject({
                        wad,
                        targetObject,
                        items: prevItems,
                        newQueue: lumps,
                    });
                }, () => queueStarted());
            }
        });
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

        const { wads } = this.state;
        if (!wads[wadId]) {
            deleteCache({ cacheId: wadId });
        }

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
                    lumpType,
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
                lumpType,
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
        this.addToTextConversionQueue({ wad });
        this.addToMidiConversionQueue({ wad });
        this.addToPCMConversionQueue({ wad });
        this.addToSimpleImageConversionQueue({ wad });
        this.addToComplexImageConversionQueue({ wad });
        this.addToMapParserQueue({ wad });
    }

    stopConvertingWadItems = ({ wadId }) => {
        this.removeWadFromTargetObject({ targetObject: 'text', wadId });
        this.removeWadFromTargetObject({ targetObject: 'midis', wadId }, this.updateMidiSelection);
        this.removeWadFromTargetObject({ targetObject: 'pcms', wadId });
        this.removeWadFromTargetObject({ targetObject: 'simpleImages', wadId });
        this.removeWadFromTargetObject({ targetObject: 'complexImages', wadId });
        this.removeWadFromTargetObject({ targetObject: 'maps', wadId });
    }

    stopConvertingAllWads = () => {
        this.clearTargetObject({ targetObject: 'text' });
        this.clearTargetObject({ targetObject: 'midis' });
        this.clearTargetObject({ targetObject: 'pcms' });
        this.clearTargetObject({ targetObject: 'simpleImages' });
        this.clearTargetObject({ targetObject: 'complexImages' });
        this.clearTargetObject({ targetObject: 'maps' });
    }
}
