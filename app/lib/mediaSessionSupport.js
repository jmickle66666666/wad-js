import React, { Fragment } from 'react';

export default () => {
    const isMobile = navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)|(Mobile)|(Phone)|(Silk)/i);
    if (!isMobile) {
        return {
            ignored: true,
        };
    }

    if ('mediaSession' in navigator) {
        return {
            supported: true,
        };
    }


    const message = (
        <Fragment>
            The Media Session API is not supported by your mobile device.
            You will not be able to control playback from your phone&apos;s notification screen.
            {' '}
            <span role="img" aria-label="sad face">😢</span>
        </Fragment>
    );

    return {
        message,
        supported: false,
    };
};
