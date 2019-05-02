import React from 'react';

import { ThemeContext, getThemeClass } from '../../lib/Context';
import { DARK_THEME } from '../../lib/constants';

import style from './WadLumpTypes.scss';

import Help from '../Help';

export default ({ wad, selectedLumpType, selectLumpType }) => (
    <ThemeContext.Consumer>
        {theme => (
            <div className={`${style.wadListOuter} ${getThemeClass(theme, style)}`}>
                <Help
                    id="lump-types"
                    title="lump types"
                    layoutClass="helpCenterLayout"
                    iconClass={theme === DARK_THEME ? 'helpIconInverted' : null}
                >
                    <h2 className={style.wadLumpTypeTitle}>Lumps</h2>
                </Help>
                <div className={style.wadListInner}>
                    <div className={style.wadLumpTypes}>
                        {wad.lumpTypes && wad.lumpTypes.map(lumpType => (
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
        )}
    </ThemeContext.Consumer>
);
