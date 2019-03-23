import React, { Component, Fragment } from 'react';

import style from './WadDetails.scss';

import TrashIcon from '../../icons/Trash';
import CodeFileIcon from '../../icons/CodeFile';

import WadMetadata from './WadMetadata';
import WadLumpTypes from './WadLumpTypes';
import WadLumpList from './WadLumpList';

export default class WadDetails extends Component {
    state = { download: false }

    toggleDownload = () => {
        this.setState((prevState) => {
            if (!prevState.download) {
                setTimeout(() => this.getJSON(), 100);
            }
            return ({
                download: !prevState.download,
            });
        });
    }

    getJSON = () => {
        const link = document.getElementById('selectedJsonDownload');
        link.click();
        this.toggleDownload();
    }

    render() {
        const {
            selectedWad: wad,
            selectedLump,
            selectedLumpType,
            selectedMidi,
            midis,
            selectWad,
            selectLump,
            selectLumpType,
            selectMidi,
            stopMidi,
            deleteWad,
            updateFilename,
            focusOnWad,
            focusOnLump,
            updateSelectedWadFromList,
        } = this.props;
        const { download } = this.state;
        return (
            <Fragment>
                <span id="wadDetails" className={style.wadDetailsAnchor} />
                <div className={style.wadDetailsTitling}>
                    <a href={`#/${wad.id}`} onClick={() => focusOnWad(false)}>
                        <h2 className={style.wadDetailsTitle}>
                            {wad.name}
                        </h2>
                    </a>
                    <div
                        onClick={download ? this.getJSON : this.toggleDownload}
                        className={style.exportWad}
                        role="button"
                        title={`Export ${wad.name} into a JSON file.`}
                        tabIndex={0}
                    >
                        <CodeFileIcon inverted />
                    </div>
                    {(download && (
                        <a
                            id="selectedJsonDownload"
                            href={wad.jsonObjectURL}
                            download={`${wad.id}.json`}
                        />
                    )) || null}
                    <div
                        className={style.deleteWad}
                        role="button"
                        title={`Remove '${wad.name}' from your list of uploaded files.`}
                        onClick={() => deleteWad(wad.id)}
                        onKeyPress={() => deleteWad(wad.id)}
                        tabIndex={0}
                    >
                        <TrashIcon inverted />
                    </div>
                </div>
                <WadMetadata
                    wad={wad}
                    selectWad={selectWad}
                    updateFilename={updateFilename}
                    focusOnWad={focusOnWad}
                    selectedLump={selectedLump}
                    selectedLumpType={selectedLumpType}
                />
                <WadLumpTypes
                    wad={wad}
                    selectedLumpType={selectedLumpType}
                    selectLumpType={selectLumpType}
                />
                {
                    wad.lumps[selectedLumpType] && (
                        <WadLumpList
                            wad={wad}
                            selectedLump={selectedLump}
                            selectedLumpType={selectedLumpType}
                            selectedMidi={selectedMidi}
                            midis={selectedLumpType === 'music' && midis}
                            selectLump={selectLump}
                            selectMidi={selectMidi}
                            stopMidi={stopMidi}
                            focusOnWad={focusOnWad}
                            focusOnLump={focusOnLump}
                            updateSelectedWadFromList={updateSelectedWadFromList}
                        />
                    )
                }
            </Fragment>
        );
    }
}
