import React from 'react';

import style from './GlobalErrors.scss';

export default ({ errors, dismissGlobalError }) => (
    errors && (
        <div className={style.globalErrors}>
            {(
                Object.keys(errors).map(errorId => (
                    <div
                        key={errorId}
                        className={style.globalErrorOuter}
                    >
                        <div className={style.globalErrorInner}>
                            {errors[errorId]}
                        </div>
                        <div
                            className={style.dismissGlobalError}
                            onClick={() => dismissGlobalError(errorId)}
                        >
                            &times;
                        </div>
                    </div>
                ))) || null}
        </div>
    )
);
