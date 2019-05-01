import React, { Fragment } from 'react';

import offscreenCanvasSupport from '../../lib/offscreenCanvasSupport';

import ErrorMessage from '../Messages/ErrorMessage';

import style from './Map.scss';

const { supported: offscreenCanvasSupported } = offscreenCanvasSupport();

const getMapDataCount = ({ map, lumpName }) => (map && map[lumpName] && map[lumpName].length) || 0;

const renderMapDataDetails = ({ lump, map }) => {
    const thingCount = getMapDataCount({ map, lumpName: 'THINGS' });
    const sectorCount = getMapDataCount({ map, lumpName: 'SECTORS' });
    const linedefCount = getMapDataCount({ map, lumpName: 'LINEDEFS' });
    const vertexCount = getMapDataCount({ map, lumpName: 'VERTEXES' });
    return (
        <Fragment>
            {map && (
                <div className={style.wadLumpDetailsEntry}>
                    Dimensions:
                    {' '}
                    {map.width}
                    &times;
                    {map.height}
                </div>
            )}
            <div className={style.wadLumpDetailsEntry}>
                Things:
                {' '}
                {thingCount}
            </div>
            <div className={style.wadLumpDetailsEntry}>
                Sectors:
                {' '}
                {sectorCount}
            </div>
            <div className={style.wadLumpDetailsEntry}>
                Linedefs:
                {' '}
                {linedefCount}
            </div>
            <div className={style.wadLumpDetailsEntry}>
                Vertices:
                {' '}
                {vertexCount}
            </div>
            {lump.data && (
                <div className={style.wadLumpDetailsEntry}>
                    Map lumps:
                    {' '}
                    {Object.keys(lump.data || {}).map(lumpName => lumpName).join(', ')}
                </div>
            )}
        </Fragment>
    );
};

const renderMapPreview = ({ lump, map }) => {
    if (!offscreenCanvasSupported || (map && map.preview === null)) {
        return (
            <div>
                <ErrorMessage message="Could not load image." />
            </div>
        );
    }

    if (!map) {
        return (
            <div className={style.loading}>Loading...</div>
        );
    }

    return (
        <img
            title={`${lump.name} (${map.width}×${map.height})`}
            alt={lump.name}
            src={map.preview}
            width="100%"
            height="100%"
        />
    );
};

export default ({
    wad,
    lump,
    map,
    previewOnly,
}) => (
    <Fragment>
        {!previewOnly && renderMapDataDetails({ lump, map })}
        {renderMapPreview({ lump, map })}
    </Fragment>
);
