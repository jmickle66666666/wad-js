import { IWAD, PWAD } from './constants';

export const getWadIds = wads => Object.keys(wads);

export const getInternalWads = (wads) => {
    const wadIds = getWadIds(wads);
    return wadIds.length > 0 && wadIds.filter((wadId) => {
        const wad = wads[wadId];
        return wad.type === IWAD;
    }).map(wadId => wads[wadId]);
};

export const getPatchWads = (wads) => {
    const wadIds = getWadIds(wads);
    return wadIds.length > 0 && wadIds.filter((wadId) => {
        const wad = wads[wadId];
        return wad.type === PWAD;
    }).map(wadId => wads[wadId]);
};
