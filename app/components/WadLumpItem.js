import React from 'react';

import style from './WadLumpItem.scss';

export default ({ lump }) => (
    <div className={style.wadLumpOuter}>
        {lump.name}
    </div>
);
