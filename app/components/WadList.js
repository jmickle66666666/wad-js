import React from 'react';

import style from './WadList.scss';

import WadItem from './WadItem';

export default ({ wads, deleteWad, selectWad }) => (
    <div className={style.wadListOuter}>
        <h2 className={style.wadListTitle}>Uploaded WADs</h2>
        <div className={style.wadListInner}>
            {
                Object.keys(wads).map(wadId => (
                    <WadItem
                        key={wadId}
                        wad={wads[wadId]}
                        deleteWad={deleteWad}
                        selectWad={selectWad}
                    />
                ))
            }
        </div>
    </div>
);
