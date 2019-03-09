import React from 'react';

import style from './WadLumpList.scss';

import Help from './Help';
import WadLumpItem from './WadLumpItem';

export default ({ wad }) => (
    <div className={style.wadLumpsOuter}>
        <Help id="wad-lumps" title="the lumps panel">
            <h3 className={style.wadLumpsTitle}>
                Lumps
            </h3>
        </Help>
        <div className={style.wadLumpsInner}>
            {Object.keys(wad.lumps).map((lumpName) => {
                const lump = wad.lumps[lumpName];
                return (
                    <WadLumpItem key={lump.name} lump={lump} />
                );
            })}
        </div>
    </div>
);
