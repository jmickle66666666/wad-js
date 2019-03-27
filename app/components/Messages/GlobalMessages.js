import React from 'react';

import style from './GlobalMessages.scss';

export default ({ messages, dismissGlobalMessage }) => (
    (messages && (
        <div className={style.globalMessages}>
            {
                Object.keys(messages).map((messageId) => {
                    const { type, text } = messages[messageId];
                    return text && (
                        <div
                            key={messageId}
                            className={style[type] || style.error}
                        >
                            <div>
                                {text}
                            </div>
                            <div
                                className={style.dismissGlobalMessage}
                                onClick={() => dismissGlobalMessage(messageId)}
                            >
                                &times;
                            </div>
                        </div>
                    );
                })}
        </div>
    )) || null
);
