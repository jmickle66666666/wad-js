import React, { Fragment } from 'react';

import style from './ImageLump.scss';

import ErrorMessage from '../Messages/ErrorMessage';

const renderImage = ({ lump, simpleImage }) => {
    if (simpleImage === null) {
        return (
            <div>
                <ErrorMessage message="Could not load image." />
            </div>
        );
    }

    if (!simpleImage && lump.data.buffer) {
        return (
            <div className={style.loading}>Loading...</div>
        );
    }

    return (
        <img
            title={`${lump.name} (${lump.width}×${lump.height})`}
            alt={lump.name}
            src={simpleImage ? URL.createObjectURL(new Blob([simpleImage])) : lump.data}
            width={lump.width * 2}
            height={lump.height * 2}
        />
    );
};

export default ({ wad, lump, simpleImage }) => (
    <Fragment>
        <div className={style.wadLumpDetailsEntry}>
            Dimensions:
            {' '}
            {lump.width}
            &times;
            {lump.height}
        </div>
        <div className={style.image}>
            {renderImage({ lump, simpleImage })}
        </div>
    </Fragment>
);
