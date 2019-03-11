import React from 'react';

import style from './BackToTop.scss';

import AngleUp from '../icons/AngleUp';

export default ({ focusOnWad }) => (
    <div className={style.backToTopOuter} onClick={focusOnWad}>
        <AngleUp />
    </div>
);
