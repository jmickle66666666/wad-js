import React, { Fragment } from 'react';

import style from './ImageLump.scss';

export default ({ wad, lump }) => (
    <Fragment>
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
