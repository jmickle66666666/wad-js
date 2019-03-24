import React from 'react';

import style from './WarningMessageList.scss';

export default ({ warnings }) => (warnings && (
    Object.keys(warnings).map(warningId => (
        <div key={warningId} className={style.warning}>
            {warnings[warningId]}
        </div>
    ))
)) || null;
