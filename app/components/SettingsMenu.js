import React from 'react';

import style from './SettingsMenu.scss';

import Help from './Help';

export default ({ settings, handleSettingChange, toggleSettingsMenu }) => (
    <div className={style.settingsMenuOuter}>
        <div className={style.settingsMenuTitleOuter}>
            <Help id="settings" title="settings" iconClass="helpIconInvertedNoMargin">
                <h2
                    role="button"
                    className={style.settingsMenuTitle}
                    onClick={toggleSettingsMenu}
                    onKeyPress={toggleSettingsMenu}
                    tabIndex={0}
                >
                    Settings
                </h2>
            </Help>
        </div>
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
