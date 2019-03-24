import React from 'react';

import ErrorMessage from './ErrorMessage';

export default ({ errors }) => (
    (errors && (
        Object.keys(errors).map(errorId => <ErrorMessage key={errorId} message={errors[errorId]} />)
    )) || null
);
