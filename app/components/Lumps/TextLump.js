import React from 'react';

export default ({ lump, text }) => (
    <div>
        {text && text.map((line, index) => <div key={index}>{line}</div>)}
    </div>
);
