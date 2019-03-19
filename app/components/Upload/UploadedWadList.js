import React, { Component, Fragment } from 'react';
import moment from 'moment';

import { getInternalWads, getPatchWads } from '../../lib/wadUtils';

import style from './UploadedWadList.scss';

import TrashIcon from '../../icons/Trash';
import CodeFileIcon from '../../icons/CodeFile';

import Help from '../Help';
import UploadedWad from './UploadedWad';

export default class UploadedWadList extends Component {
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
        const link = document.getElementById('allJsonDownload');
        link.click();
        this.toggleDownload();
    }

    renderBlob = () => {
        const { wads } = this.props;
        const json = Object.keys(wads).map(wadId => wads[wadId].json);
        const stringified = JSON.stringify(json);
        const blob = new Blob([stringified], {
            type: 'application/json',
        });

        const objectURL = URL.createObjectURL(blob);
        return objectURL;
    }

    render() {
        const {
            wads,
            wadsObjectURL,
            selectedWad,
            selectedLumpType,
            selectedLump,
            selectWad,
            deleteWad,
            deleteWads,
        } = this.props;
        const { download } = this.state;
        const iwads = getInternalWads(wads);
        const pwads = getPatchWads(wads);
        return (
            <div className={style.wadListOuter}>
                <Help
                    id="uploaded-wads"
                    title="uploaded wads"
                    layoutClass="helpCenterLayout"
                    iconClass="helpIconInverted"
                >
                    <h2 className={style.wadListTitle}>Uploaded WADs</h2>
                    <div
                        onClick={download ? this.getJSON : this.toggleDownload}
                        className={style.exportWads}
                        role="button"
                        title="Export all WADs into a JSON file."
                        tabIndex={0}
                    >
                        <CodeFileIcon inverted />
                    </div>
                    {(download && (
                        <a
                            id="allJsonDownload"
                            href={this.renderBlob()}
                            download={`wads_${moment().format('YYYY_MM_DD_HH_mm_SS')}.json`}
                        />
                    )) || null}
                    <div
                        className={style.deleteWads}
                        role="button"
                        title="Remove all WADs from your list of uploaded files."
                        onClick={deleteWads}
                        onKeyPress={deleteWads}
                        tabIndex={0}
                    >
                        <TrashIcon inverted />
                    </div>
                </Help>
                {iwads.length > 0 && (
                    <Fragment>
                        <h3 className={style.wadListSubtitle}>IWADs</h3>
                        <div className={style.wadListInner}>
                            {
                                iwads.map(wad => (
                                    <UploadedWad
                                        key={wad.id}
                                        wad={wad}
                                        deleteWad={deleteWad}
                                        selectWad={selectWad}
                                        selectedWad={selectedWad}
                                        selectedLumpType={selectedLumpType}
                                        selectedLump={selectedLump}
                                    />
                                ))
                            }
                        </div>
                    </Fragment>
                )}
                {pwads.length > 0 && (
                    <Fragment>
                        <h3 className={style.wadListSubtitle}>PWADs</h3>
                        <div className={style.wadListInner}>
                            {
                                pwads.map(wad => (
                                    <UploadedWad
                                        key={wad.id}
                                        wad={wad}
                                        deleteWad={deleteWad}
                                        selectWad={selectWad}
                                        selectedWad={selectedWad}
                                        selectedLumpType={selectedLumpType}
                                        selectedLump={selectedLump}
                                    />
                                ))
                            }
                        </div>
                    </Fragment>
                )}
            </div>
        );
    }
}
