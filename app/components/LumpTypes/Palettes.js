import React from 'react';

import style from './Palettes.scss';

export default ({ lump }) => (
    (lump.data && lump.data.map((palette, index) => (
        <div key={index}>
            <h5>
                Palette #
                {index}
            </h5>
        </div>
    ))) || null
);
