import React, { Fragment } from 'react';

import style from './TextureNames.scss';

export default ({ lump }) => (
    <Fragment>
        <div className={style.textureCount}>
            Texture count:
            {' '}
            {lump.count}
        </div>
        <div className={style.textureNames}>
            {lump.data && lump.data.map((textureName, index) => (
                <div key={textureName} title={`texture #${index}`}>
                    {textureName}
                </div>
            ))}
        </div>
    </Fragment>
);
