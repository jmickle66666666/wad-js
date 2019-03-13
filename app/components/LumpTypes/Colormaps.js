import React from 'react';

import style from './Colormaps.scss';

export default ({ wad, lump }) => (
    (lump.data && lump.data.map((colormap, index) => (
        <div key={index}>
            <h5>
                Colormap #
                {index}
            </h5>
            <div className={style.colormapColorList}>
                {colormap.map((colorIndex, index) => {
                    const palette0 = wad.lumps.palettes.PLAYPAL.data[0];
                    const { red, green, blue } = palette0[colorIndex];
                    return (
                        <div
                            key={index}
                            title={`color #${index}: rgb(${red},${green},${blue})`}
                            className={style.colormapColor}
                            style={{ background: `rgb(${red},${green},${blue})` }}
                        />
                    );
                })}
            </div>
        </div>
    ))) || null
);
