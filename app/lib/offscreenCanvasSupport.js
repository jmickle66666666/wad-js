import React, { Fragment } from 'react';

export default () => {
    if ('OffscreenCanvas' in window) {
        return {
            supported: true,
        };
    }

    const message = (
        <Fragment>
            This application uses the
            {' '}
            <code>OffscreenCanvas</code>
            {' '}
            feature in order to process graphic lumps. Please enable it in your browser&apos;s settings if possible.
        </Fragment>
    );

    return {
        message,
        supported: false,
    };
};
