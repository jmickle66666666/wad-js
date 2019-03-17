import React from 'react';

import style from './ErrorMessage.scss';

export default ({ message }) => message && (
    <div className={style.error}>
        {message}
    </div>
);
