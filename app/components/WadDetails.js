import React, { Fragment } from 'react';

import style from './WadDetails.scss';

import WadMetadata from './WadMetadata';
import WadLumpList from './WadLumpList';

export default ({ selectedWad: wad, updateFilename }) => (
    <Fragment>
        <h2 className={style.wadDetailsTitle}>
            {wad.name}
        </h2>
        <WadMetadata
            wad={wad}
            updateFilename={updateFilename}
        />
        <WadLumpList wad={wad} />
    </Fragment>
);
