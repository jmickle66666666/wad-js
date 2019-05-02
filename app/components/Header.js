import React from 'react';

import style from './Header.scss';

import Logo from './Logo';

export default () => (
    <div className={style.headerOuter}>
        <input
            className={style.hamburgerInput}
            type="checkbox"
            id="hamburger"
        />
        <div className={style.headerMobile}>
            <div className={style.headerLogoMobile}>
                <Logo
                    customLogoStyle={style.logo}
                    customWadStyle={style.wad}
                    customJSStyle={style.js}
                    image={false}
                />
                <div className={style.mobileVersion}>
                    <a target="_blank" rel="noopener noreferrer" href={REPO}>
                        v
                        {VERSION}
                    </a>
                </div>
            </div>
            <div>
                <label
                    className={style.hamburgerIcon}
                    htmlFor="hamburger"
                >
                    <span className={style.navIcon} />
                </label>
            </div>
        </div>
        <div className={style.headerInner}>
            <div>
                <a target="_blank" rel="noopener noreferrer" href={`${REPO}/blob/master/doc/HELP.md`}>
                    help
                </a>
            </div>
            <div>
                <a target="_blank" rel="noopener noreferrer" href={`${REPO}/blob/master/doc/CHANGELOG.md`}>
                    changelog
                </a>
            </div>
            <div>
                <a target="_blank" rel="noopener noreferrer" href={ISSUES}>
                    report an issue
                </a>
            </div>
            <div className={style.desktopVersion}>
                <a target="_blank" rel="noopener noreferrer" href={REPO}>
                    v
                    {VERSION}
                </a>
            </div>
        </div>
    </div>
);
