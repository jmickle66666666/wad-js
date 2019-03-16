import React from 'react';

import style from './UploadedWadList.scss';

import Help from '../Help';
import UploadedWad from './UploadedWad';

export default ({
    wads,
    selectedWad,
    selectedLumpType,
    selectedLump,
    deleteWad,
    selectWad,
}) => (
    <div className={style.wadListOuter}>
        <Help
            id="uploaded-wads"
            title="uploaded wads"
            layoutClass="helpCenterLayout"
            iconClass="helpIconInverted"
        >
            <h2 className={style.wadListTitle}>Uploaded WADs</h2>
        </Help>
        <div className={style.wadListInner}>
            {
                Object.keys(wads).map(wadId => (
                    <UploadedWad
                        key={wadId}
                        wad={wads[wadId]}
                        deleteWad={deleteWad}
                        selectWad={selectWad}
                        selectedWad={selectedWad}
                        selectedLumpType={selectedLumpType}
                        selectedLump={selectedLump}
                    />
                ))
            }
        </div>
    </div>
);
