import React, { Component } from 'react';

import style from './WadLumpList.scss';

import Help from '../Help';
import WadLumpItem from './WadLumpItem';

const convertMusToMidiWorker = new Worker('./public/workers/midiConverter.js');

export default class WadLumpList extends Component {
    async componentDidMount() {
        this.convertMusToMidi();
    }

    convertMusToMidi() {
        return false;
        const { wad, updateSelectedWadFromList } = this.props;

        const musicLumpIds = Object.keys(wad.lumps.music);
        const musTracks = musicLumpIds.map(musicLumpId => wad.lumps.music[musicLumpId]).filter(musicLump => musicLump.originalFormat === 'MUS' && !musicLump.midi);

        musTracks.map(lump => convertMusToMidiWorker.postMessage({ lump }));

        const handleMidiConversion = (message) => {
            if (message.data.status === 'done') {
                wad.updateLump(message.data.lump, 'music');
                updateSelectedWadFromList(wad);
            }
            convertMusToMidiWorker.removeEventListener('message', handleMidiConversion);
        };

        convertMusToMidiWorker.onmessage = message => handleMidiConversion(message);
    }

    render() {
        const {
            wad,
            selectedLump,
            selectedLumpType,
            midis,
            selectLump,
            focusOnWad,
            focusOnLump,
        } = this.props;

        return (
            <div className={style.wadLumpsOuter}>
                <Help id="wad-lumps" title="the lumps panel">
                    <h3 className={style.wadLumpsTitle} onClick={focusOnWad}>
                        {selectedLumpType}
                    </h3>
                </Help>
                <div className={style.wadLumpsInner}>
                    <div className={style.wadLumpsList}>
                        {Object.keys(wad.lumps[selectedLumpType]).map((lumpName) => {
                            const lump = wad.lumps[selectedLumpType][lumpName];
                            return (lump
                                && (
                                    <WadLumpItem
                                        key={lumpName}
                                        lump={lump}
                                        selectedLump={selectedLump}
                                        selectedLumpType={selectedLumpType}
                                        wad={wad}
                                        midi={midis && midis[lumpName]}
                                        selectLump={selectLump}
                                        focusOnLump={focusOnLump}
                                    />
                                )
                            ) || null;
                        })}
                    </div>
                </div>
            </div>
        );
    }
}
