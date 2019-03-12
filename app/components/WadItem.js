import React from 'react';
import { Link } from 'react-router-dom';
import moment from 'moment';

import style from './WadItem.scss';

export default ({
    wad,
    selectedWad,
    selectedLumpType,
    selectedLump,
    deleteWad,
    selectWad,
}) => (
    <div className={style.wadOuter}>
        <a
            href={`#/${wad.id}${selectedLumpType ? `/${selectedLumpType}` : ''}${selectedLump.name ? `/${selectedLump.name}` : ''}`}
            id={(selectedWad && selectedWad.id === wad.id && style.selectedWad) || null}
            className={style.wadInner}
            onClick={() => selectWad(wad.id)}
        >
            <div>
                <div>{wad.name}</div>
                <div className={style.timestamp}>{moment(wad.uploadEndAt).format('MMMM D, YYYY [at] h:mm a')}</div>
            </div>
            <div
                className={style.deleteWad}
                role="button"
                onClick={(event) => { event.preventDefault(); deleteWad(wad.id); }}
                onKeyPress={(event) => { event.preventDefault(); deleteWad(wad.id); }}
                tabIndex={0}
            >
                    &times;
                </div>
        </a>
    </div>
);
