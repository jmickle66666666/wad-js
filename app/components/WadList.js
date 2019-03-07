import React from 'react';

import style from './WadList.scss';

import WadItem from './WadItem';

export default ({ wad }) => (
    <div className={style.wadListOuter}>
        <h2 className={style.wadListTitle}>Your WADs</h2>
        <div className={style.wadListInner}>
            {wad.uploaded && <WadItem wad={wad} />}
        </div>
    </div>
);
