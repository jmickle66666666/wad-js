import React from 'react';

import style from './Flat.scss';

export default ({ wad, lump }) => (
    <div className={style.flatImage}>
        {lump.data && Array.from(Array(lump.size / lump.width).keys()).map(row => (
            <div className={style.flatRow} key={row}>
                {lump.data.filter((val, index) => index >= row * lump.width && index < (row + 1) * lump.width).map((colorIndex, index) => {
                    const palette0 = wad.lumps.palettes.PLAYPAL.data[0];
                    const { red, green, blue } = palette0[colorIndex];
                    return (
                        <div
                            key={index}
                            title={`${index}x${row}: rgb(${red},${green},${blue})`}
                            className={style.colormapColor}
                            style={{ background: `rgb(${red},${green},${blue})` }}
                        />
                    );
                })}
            </div>
        ))}
    </div>
);
