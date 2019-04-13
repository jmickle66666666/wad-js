import React from 'react';

import style from './SettingsIcon.scss';

import CogIcon from '../../icons/Cog';

export default ({ toggleSettingsMenu }) => (
    <div
        className={style.settingsIcon}
        onClick={toggleSettingsMenu}
    >
        <CogIcon inverted />
    </div>
);
