import React from 'react';

import style from './Header.scss';

import Logo from './Logo';

export default () => (
    <div className={style.headerOuter}>
        <Logo
            customLogoStyle={style.logo}
            customWadStyle={style.wad}
            customJSStyle={style.js}
            image={false}
        />
        <div className={style.headerInner}>
            <div>
                <a target="_blank" rel="noopener noreferrer" href={REPO}>
                    version
                    {' '}
                    {VERSION}
                </a>
            </div>
            <div>
                <a target="_blank" rel="noopener noreferrer" href={ISSUES}>
                    report an issue
                </a>
            </div>
        </div>
    </div>
);
