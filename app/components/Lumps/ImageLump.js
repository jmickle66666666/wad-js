import React, { Fragment } from 'react';

import style from './ImageLump.scss';

import offscreenCanvasSupport from '../../lib/offscreenCanvasSupport';

import ErrorMessage from '../Messages/ErrorMessage';

const { supported: offscreenCanvasSupported } = offscreenCanvasSupport();

const renderImage = ({ lump, image }) => {
    if (!offscreenCanvasSupported || image === null) {
        return (
            <div>
                <ErrorMessage message="Could not load image." />
            </div>
        );
    }

    if (!image && lump.data.buffer) {
        return (
            <div className={style.loading}>Loading...</div>
        );
    }

    return (
        <img
            title={`${lump.name} (${lump.width}×${lump.height})`}
            alt={lump.name}
            src={image ? URL.createObjectURL(new Blob([image])) : lump.data}
            width={lump.width * 2}
            height={lump.height * 2}
        />
    );
};

export default ({ lump, image }) => (
    <Fragment>
        <div className={style.wadLumpDetailsEntry}>
            Dimensions:
            {' '}
            {lump.width}
            &times;
            {lump.height}
        </div>
        <div className={style.image}>
            {renderImage({ lump, image })}
        </div>
    </Fragment>
);
