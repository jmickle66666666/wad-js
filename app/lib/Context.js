import { createContext } from 'react';

import { DARK_THEME } from './constants';

export const ThemeContext = createContext(DARK_THEME);

export const getThemeClass = (theme, style) => {
    const themeClass = `${theme}-theme`;
    const themeClassRules = style[themeClass];
    return themeClassRules;
};
