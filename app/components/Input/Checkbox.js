import React from 'react';
import PropTypes from 'prop-types';

import { CHECKBOX } from '../../lib/constants';

const Checkbox = ({
    valueObject,
    label,
    className,
    handleChange,
}) => {
    const key = Object.keys(valueObject)[0];
    const checked = Object.values(valueObject)[0];
    return (
        <label className={className} htmlFor={key}>
            <input
                type={CHECKBOX}
                id={key}
                checked={checked}
                onChange={() => handleChange({ key, value: !checked, type: CHECKBOX })}
            />
            {label}
        </label>
    );
};

Checkbox.propTypes = {
    valueObject: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    label: PropTypes.string,
    className: PropTypes.string,
};


Checkbox.defaultProps = {
    label: '',
    className: '',
};

export default Checkbox;
