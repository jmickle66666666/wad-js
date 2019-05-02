import React from 'react';
import moment from 'moment';

import style from './UploadedWad.scss';

import TrashIcon from '../../icons/Trash';

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
                    <div className={style.timestamp}>{moment(wad.uploadEndAt).format('MMMM D, YYYY [at] h:mma')}</div>
                </div>
                <div
                    className={style.deleteWad}
                    role="button"
                    title={`Remove '${wad.name}' from your list of uploaded files.`}
                    onClick={(event) => { event.preventDefault(); deleteWad(wad.id); }}
                    onKeyPress={(event) => { event.preventDefault(); deleteWad(wad.id); }}
                    tabIndex={0}
                >
                    <TrashIcon />
                </div>
            </a>
        </div>
    );
