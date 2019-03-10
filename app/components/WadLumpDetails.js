import React, { Fragment } from 'react';

import style from './WadLumpDetails.scss';

export default ({ lump, wad }) => (
    <Fragment>
        <span id="lumpDetails" className={style.wadLumpDetailsAnchor} />
        <div className={style.wadLumpDetailsOuter}>
            <h4>{lump.name}</h4>
            <div className={style.wadLumpDetailsInner}>
                <div>
                    Type:
                    {' '}
                    {lump.type}
                </div>
                <div>
                    Size:
                    {' '}
                    {lump.sizeInBytes}
                </div>
            </div>
        </div>
    </Fragment>
);
