import React from 'react';

import style from './SettingsMenu.scss';

export default ({ settings, handleSettingChange, toggleSettingsMenu }) => (
    <div className={style.settingsMenuOuter}>
        <h2
            role="button"
            className={style.settingsMenuTitle}
            onClick={toggleSettingsMenu}
            onKeyPress={toggleSettingsMenu}
            tabIndex={0}
        >
            Settings
        </h2>
        <label className={style.setting} htmlFor="playbackLoop">
            <input
                type="checkbox"
                id="playbackLoop"
                checked={settings.playbackLoop}
                onChange={() => handleSettingChange({ toggle: 'playbackLoop' })}
            />
            Play music in a loop.
        </label>
        <label className={style.setting} htmlFor="playNextTrack">
            <input
                type="checkbox"
                id="playNextTrack"
                checked={settings.playNextTrack}
                onChange={() => handleSettingChange({ toggle: 'playNextTrack' })}
            />
            Play next available track.
        </label>
    </div>
);
