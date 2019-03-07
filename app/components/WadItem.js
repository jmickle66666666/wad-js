import React from 'react';
import { NavLink } from 'react-router-dom';
import moment from 'moment';

import style from './WadItem.scss';

export default ({ wad, deleteWad }) => (
    <NavLink to={{ pathname: `/wad/${wad.name}` }} activeClassName={style.active} className={style.wad}>
        <div>
            <div>{wad.name}</div>
            <div>{moment(wad.uploadEndAt).format('MMMM D, YYYY [at] h:mm a')}</div>
        </div>
        <div
            className={style.deleteWad}
            role="button"
            onClick={() => deleteWad(wad.id)}
            onKeyPress={() => deleteWad(wad.id)}
            tabIndex={0}
        >
            &times;
        </div>
    </NavLink>
);
