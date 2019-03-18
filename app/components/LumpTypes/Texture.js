import React, { Fragment } from 'react';

import style from './ImageLump.scss';

export default ({ wad, lump }) => (
    <Fragment>
        <div className={style.wadLumpDetailsEntry}>
            Dimensions:
            {' '}
            {lump.width}
            &times;
            {lump.height}
        </div>
        <div className={style.wadLumpDetailsEntry}>
            Patch count:
            {' '}
            {lump.data.patchCount}
        </div>
        <div className={style.image}>
            <img
                title={`${lump.name} (${lump.width}×${lump.height})`}
                alt={lump.name}
                src={lump.data}
                width={lump.width * 2}
                height={lump.height * 2}
            />
        </div>
    </Fragment>
);
