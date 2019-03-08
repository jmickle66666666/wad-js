import React, { Fragment } from 'react';

import style from './WadDetails.scss';

import WadMetadata from './WadMetadata';

export default ({ selectedWad: wad }) => (
    <Fragment>
        <h2 className={style.wadDetailsTitle}>
            {wad.name}
        </h2>
        <WadMetadata wad={style.wad} />
    </Fragment>
);
