import React from 'react';

import style from './Header.scss';

export default () => (
    <div className={style.header}>
        <div>
            <a href={REPO}>
                version
                {' '}
                {VERSION}
            </a>
        </div>
        <div>
            <a href={ISSUES}>
                report an issue
            </a>
        </div>
    </div>
);
