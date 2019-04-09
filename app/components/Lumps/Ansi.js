import React from 'react';

import style from './Ansi.scss';

const getForegroundClass = foreground => (foreground ? `ansi-foreground-${foreground}` : '');
const getBackgroundClass = background => (background ? `ansi-background-${background}` : '');
const getBlinkClass = blinking => (blinking ? 'ansi-blinking' : '');

const getClassNames = ({ foreground, background, blinking }) => (
    `${getForegroundClass(foreground)} ${getBackgroundClass(background)} ${getBlinkClass(blinking)}`
);

export default ({ lump, text }) => (
    <pre className={style.ansiOuter}>
        {text && text.map((line, i) => (
            <div key={i}>
                {line.map((block, j) => (
                    <span
                        key={i + j}
                        className={getClassNames(block)}
                    >
                        {block.character}
                    </span>
                ))}
            </div>
        ))}
    </pre>
);
