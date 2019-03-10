import React, { Fragment } from 'react';

import style from './WadLumpDetails.scss';

export default ({ lump, wad }) => (
    <Fragment>
        <span id="lumpDetails" className={style.wadLumpDetailsAnchor} />
        <div className={style.wadLumpDetailsOuter}>
            {lump.name}
        </div>
    </Fragment>
);
