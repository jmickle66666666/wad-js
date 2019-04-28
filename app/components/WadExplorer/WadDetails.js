import React, { Component, Fragment } from 'react';

import { ThemeContext, getThemeClass } from '../../lib/Context';
import { DARK_THEME } from '../../lib/constants';

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
            selectedPCM,
            text,
            midis,
            pcms,
            simpleImages,
            complexImages,
            selectWad,
            selectLump,
            selectLumpType,
            selectMidi,
            stopMidi,
            playPCM,
            stopPCM,
            deleteWad,
            updateFilename,
            focusOnWad,
            focusOnLump,
            updateSelectedWadFromList,
        } = this.props;
        const { download } = this.state;
        const handleExportToJSON = download ? this.getJSON : this.toggleDownload;
        return (
            <ThemeContext.Consumer>
                {theme => (
                    <Fragment>
                        <span id="wadDetails" className={style.wadDetailsAnchor} />
                        <div className={`${style.wadDetailsTitling} ${getThemeClass(theme, style)}`}>
                            <a href={`#/${wad.id}`} onClick={() => focusOnWad(false)}>
                                <h2 className={style.wadDetailsTitle}>
                                    {wad.name}
                                </h2>
                            </a>
                            <div
                                onClick={handleExportToJSON}
                                onKeyPress={handleExportToJSON}
                                className={style.exportWad}
                                role="button"
                                title={`Export ${wad.name} into a JSON file.`}
                                tabIndex={0}
                            >
                                <CodeFileIcon inverted={theme === DARK_THEME} />
                            </div>
                            {(download && (
                                // eslint-disable-next-line jsx-a11y/anchor-has-content
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
                                <TrashIcon inverted={theme === DARK_THEME} />
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
                                    selectedPCM={selectedPCM}
                                    text={text && text[selectedLumpType]}
                                    midis={midis && midis[selectedLumpType]}
                                    pcms={pcms && pcms[selectedLumpType]}
                                    simpleImages={simpleImages && simpleImages[selectedLumpType]}
                                    complexImages={complexImages && complexImages[selectedLumpType]}
                                    selectLump={selectLump}
                                    selectMidi={selectMidi}
                                    stopMidi={stopMidi}
                                    playPCM={playPCM}
                                    stopPCM={stopPCM}
                                    focusOnWad={focusOnWad}
                                    focusOnLump={focusOnLump}
                                    updateSelectedWadFromList={updateSelectedWadFromList}
                                />
                            )
                        }
                    </Fragment>
                )}
            </ThemeContext.Consumer>
        );
    }
}
