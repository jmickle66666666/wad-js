import React from 'react';

import style from './ErrorMessage.scss';

export default props => props.message && (
    <div className={style.error}>
        {props.message}
    </div>
);
