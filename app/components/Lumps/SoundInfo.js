import React from 'react';

import style from './SoundInfo.scss';

export default ({ lump, wad, selectLump }) => (
    <div className={style.soundInfoOuter}>
        {lump && lump.data.map((line, index) => {
            const audioLumpName = line.name;
            const audioLumpType = line.type;

            if (audioLumpName && audioLumpType) {
                return (
                    <a
                        key={index}
                        href={`#/${wad.id}/${audioLumpType}/${audioLumpName}`}
                        onClick={() => selectLump(audioLumpName, true, audioLumpType)}
                    >
                        <div>{line.data}</div>
                    </a>
                );
            }

            return (
                <div key={index}>{line.data}</div>
            );
        })}
    </div>
);
