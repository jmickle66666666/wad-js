import React from 'react';

import style from './WadDetails.scss';

export default ({ selectedWad: wad }) => (
    <div className={style.wadDetailsOuter}>
        <h2 className={style.wadDetailsTitle}>
            Lumps for
            {' '}
            {wad.name}
        </h2>
        <div className={style.wadDetailsInner} />
    </div>
);
