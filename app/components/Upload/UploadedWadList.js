import React, { Fragment } from 'react';

import { getInternalWads, getPatchWads } from '../../lib/wadUtils';

import style from './UploadedWadList.scss';

import Trash from '../../icons/Trash';
import FileIcon from '../../icons/File';

import Help from '../Help';
import UploadedWad from './UploadedWad';

export default ({
    wads,
    selectedWad,
    selectedLumpType,
    selectedLump,
    deleteWad,
    deleteWads,
    selectWad,
}) => {
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
                    className={style.exportWads}
                    role="button"
                    onClick={deleteWads}
                    onKeyPress={deleteWads}
                    tabIndex={0}
                >
                    <FileIcon inverted />
                </div>
                <div
                    className={style.deleteWads}
                    role="button"
                    onClick={deleteWads}
                    onKeyPress={deleteWads}
                    tabIndex={0}
                >
                    <Trash inverted />
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
};
