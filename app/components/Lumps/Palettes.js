import React from 'react';

import style from './Palettes.scss';

export default ({ lump }) => (
    (lump.data && lump.data.map((palette, index) => (
        <div key={index}>
            <h5>
                Palette #
                {index}
            </h5>
            <div className={style.paletteColorList}>
                {palette.map(({ red, green, blue }, index) => (
                    <div
                        key={index}
                        title={`color #${index}: rgb(${red},${green},${blue})`}
                        className={style.paletteColor}
                        style={{ background: `rgb(${red},${green},${blue})` }}
                    />
                ))}
            </div>
        </div>
    ))) || null
);
