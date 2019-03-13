import React from 'react';

import style from './WadLumpDetailDisplay.scss';

import Palettes from './LumpTypes/Palettes';

export default ({ lump }) => {
    switch (lump.type) {
    default: {
        return null;
    }
    case 'palettes': {
        return (
            <Palettes lump={lump} />
        );
    }
    }
};
