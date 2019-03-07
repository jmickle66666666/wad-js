import React from 'react';

import style from './WadList.scss';

import WadItem from './WadItem';

export default ({ wad }) => (
    <div className={style.wadList}>
        {wad.uploaded && <WadItem wad={wad} />}
    </div>
);
