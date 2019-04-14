import React from 'react';

import style from './SettingsMenu.scss';

import { DARK_THEME, LIGHT_THEME } from '../../lib/constants';

import Help from '../Help';
import Checkbox from '../Input/Checkbox';

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
        <Checkbox
            label="Dark theme."
            valueObject={{ theme: settings.theme === DARK_THEME }}
            handleChange={({ key, value, type }) => handleSettingChange({
                key,
                value: value ? DARK_THEME : LIGHT_THEME,
                type,
            })}
            className={style.setting}
        />
        <Checkbox
            label="Enable offline access."
            valueObject={{ serviceWorker: settings.serviceWorker }}
            handleChange={({ key, value, type }) => {
                let confirmed = false;
                if (!navigator.onLine) {
                    confirmed = confirm('You are currently offline. If you turn this setting off, the app will be unavailable when you refresh the page while offline.');
                }

                if (navigator.onLine || confirmed) {
                    handleSettingChange({ key, value, type });
                }
            }}
            className={style.setting}
        />
        <Checkbox
            label="Play music in a loop."
            valueObject={{ playbackLoop: settings.playbackLoop }}
            handleChange={handleSettingChange}
            className={style.setting}
        />
        <Checkbox
            label="Play next available track."
            valueObject={{ playNextTrack: settings.playNextTrack }}
            handleChange={handleSettingChange}
            className={style.setting}
        />
    </div>
);
