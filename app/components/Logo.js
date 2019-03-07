import React from 'react';

import style from './Logo.scss';

import archie from '../assets/archie.png';

export default ({
    image,
    customLogoStyle,
    customWadStyle,
    customJSStyle,
}) => (
    <a className={customLogoStyle || style.logo} href="#uploader">
        {image === false ? null : <img alt="archie" src={archie} />}
        <h1>
            <span className={customWadStyle || style.wad}>wad</span>
            <span className={customJSStyle || style.js}>js</span>
        </h1>
    </a>
);
