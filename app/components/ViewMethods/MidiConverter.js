import TextConverter from './TextConverter';

import MidiConverter from '../../webWorkers/midiConverter';

export default class MidiConverterMethods extends TextConverter {
    midiConverter = new MidiConverter()

    startMidiConverterWorker() {
        this.startWorker({
            workerId: 'midiConverter',
            workerClass: MidiConverter,
            onmessage: this.saveConvertedMidi,
        });
    }

    addToMidiConversionQueue({ wad }) {
        if (!wad.lumps.music) {
            return;
        }

        const {
            lumps: musLumps,
            firstLump: firstMusLump,
            count: musLumpCount,
        } = this.getLumps({
            wad,
            lumpType: 'music',
            targetObject: 'midis',
            originalFormat: 'MUS',
        });

        if (musLumpCount > 0) {
            const { done } = this.getNextItemInQueue({
                targetObject: 'midis',
                wadId: wad.id,
            });

            // get the worker going if there is nothing in the queue
            if (done && firstMusLump) {
                const { name: lumpId, data } = firstMusLump;
                this.startMidiConverterWorker();
                this.midiConverter.postMessage({
                    wadId: wad.id,
                    lumpId,
                    input: data,
                });
            }
        }

        const {
            lumps: midiLumps,
            count: midiLumpCount,
        } = this.getLumps({
            wad,
            lumpType: 'music',
            targetObject: 'midis',
            originalFormat: 'MIDI',
            extractLumpData: lump => lump.data,
        });

        this.setState((prevState) => {
            const { midis } = prevState;

            return this.addItemsToTargetObject({
                wad,
                targetObject: 'midis',
                items: midis,
                newQueue: musLumps,
                newConvertedItems: midiLumps,
            });
        }, () => {
            // load the first MIDI into the portable player
            const { preselectedMidi, midis: { converted: midis } } = this.state;
            if (!preselectedMidi && midiLumpCount > 0) {
                this.selectFirstMidi({ midis });
            }
        });
    }

    saveConvertedMidi = (payload) => {
        const { wadId, lumpId, output } = payload.data;
        const targetObject = 'midis';

        // didn't work: remove MUS from queue (otherwise, we get stuck in infinite loop)
        if (!output) {
            this.removeItemFromQueue({
                targetObject,
                wadId,
                lumpId,
            });
        }

        // it worked
        this.setState((prevState) => {
            const { midis } = prevState;
            return this.moveItemFromWadQueueToConvertedItems({
                targetObject,
                wadId,
                lumpId,
                items: midis,
                newItem: output,
            });
        }, () => {
            const { nextLump, nextWadId, done } = this.getNextItemInQueue({
                targetObject,
                wadId,
            });

            if (!done) {
                this.midiConverter.postMessage({
                    wadId: nextWadId,
                    lumpId: nextLump.name,
                    input: nextLump.data,
                });
            }

            const { preselectedMidi } = this.state;
            if (!preselectedMidi) {
                const { midis: { converted: midis } } = this.state;
                this.selectFirstMidi({ midis });
            }
        });
    }
}
