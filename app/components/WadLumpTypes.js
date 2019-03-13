import React from 'react';

import style from './WadLumpTypes.scss';

import { UNCATEGORIZED } from '../lib/constants';

import Help from './Help';

export default ({ wad, selectedLumpType, selectLumpType }) => (
    <div className={style.wadListOuter}>
        <Help
            id="lump-types"
            title="lump types"
            layoutClass="helpCenterLayout"
            iconClass="helpIconInverted"
        >
            <h2 className={style.wadLumpTypeTitle}>Lumps Types</h2>
        </Help>
        <div className={style.wadListInner}>
            <div className={style.wadLumpTypes}>
                {wad.lumpTypes.map(lumpType => (
                    <a
                        href={`#/${wad.id}/${selectedLumpType}`}
                        id={(selectedLumpType && selectedLumpType === lumpType && style.selectedLumpType) || null}
                        key={lumpType}
                        className={style.wadLumpTypeOuter}
                        onClick={() => selectLumpType(lumpType)}
                    >
                        <div className={style.wadLumpType}>{lumpType}</div>
                        <div className={style.wadTypeCount}>
                            {wad.lumpTypeCount[lumpType]}
                            {' '}
                            objects
                        </div>
                    </a>
                ))}
            </div>
        </div>
    </div>
);
