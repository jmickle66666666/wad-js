import React, { Fragment } from 'react';

export default () => {
    if ('serviceWorker' in navigator) {
        return {
            supported: true,
        };
    }

    const message = (
        <Fragment>
            This application uses Service Workers
            <span role="img" aria-label="worker">👷</span>
            to run offline. Unfortunately, it looks like your browser does not support this feature.
        </Fragment>
    );

    return {
        message,
        supported: false,
    };
};
