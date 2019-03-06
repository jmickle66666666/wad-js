import React from 'react';

import style from './Header.scss';

export default () => (
    <div className={style.header}>
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
);
