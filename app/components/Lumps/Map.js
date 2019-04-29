import React, { Fragment } from 'react';

import style from './ImageLump.scss';

const getMapDataCount = ({ map, lumpName }) => (map && map[lumpName] && map[lumpName].length) || 0;

const renderMapDataDetails = ({ lump, map }) => {
    const thingCount = getMapDataCount({ map, lumpName: 'THINGS' });
    const sectorCount = getMapDataCount({ map, lumpName: 'SECTORS' });
    const linedefCount = getMapDataCount({ map, lumpName: 'LINEDEFS' });
    const vertexCount = getMapDataCount({ map, lumpName: 'VERTEXES' });
    return (
        <Fragment>
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

export default ({
    wad,
    lump,
    map,
    previewOnly,
}) => (
    <Fragment>
        {!previewOnly && renderMapDataDetails({ lump, map })}
    </Fragment>
);
