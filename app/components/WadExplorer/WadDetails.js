import React, { Fragment } from 'react';

import style from './WadDetails.scss';

import Trash from '../../icons/Trash';

import WadMetadata from './WadMetadata';
import WadLumpTypes from './WadLumpTypes';
import WadLumpList from './WadLumpList';

export default ({
    selectedWad: wad,
    selectedLump,
    selectedLumpType,
    selectWad,
    selectLump,
    selectLumpType,
    deleteWad,
    updateFilename,
    focusOnWad,
    focusOnLump,
}) => (
        <Fragment>
            <span id="wadDetails" className={style.wadDetailsAnchor} />
            <div className={style.wadDetailsTitling}>
                <a href={`#/${wad.id}`} onClick={() => focusOnWad(false)}>
                    <h2 className={style.wadDetailsTitle}>
                        {wad.name}
                    </h2>
                </a>
                <div
                    className={style.deleteWad}
                    role="button"
                    onClick={() => deleteWad(wad.id)}
                    onKeyPress={() => deleteWad(wad.id)}
                    tabIndex={0}
                >
                    <Trash inverted />
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
                        selectLump={selectLump}
                        focusOnWad={focusOnWad}
                        focusOnLump={focusOnLump}
                    />
                )
            }
        </Fragment>
    );
