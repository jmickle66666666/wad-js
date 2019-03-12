import React from 'react';

import style from './WadList.scss';

import Help from './Help';
import WadItem from './WadItem';

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
                    <WadItem
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
