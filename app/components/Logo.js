import React from 'react';

import style from './Logo.scss';

import archie from '../assets/archie.png';

export default () => (
    <a className={style.logo} href="#uploader">
        <img alt="archie" src={archie} />
        <h1>
            <span className={style.wad}>wad</span>
            <span className={style.js}>js</span>
        </h1>
    </a>
);
