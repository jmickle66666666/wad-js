import React, { Component, createRef } from 'react';

import style from './WadLumpItem.scss';

import WadLumpDetails from './WadLumpDetails';

const isSelectedLump = ({ selectedLump, lump }) => selectedLump && selectedLump.name === lump.name;

export default class WadLumpItem extends Component {
    state = {}

    constructor(props) {
        super(props);

        const { lump, wad } = this.props;

        if (lump.type === 'flats') {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = lump.width;
                canvas.height = lump.height;
                const context = canvas.getContext('2d');
                const imageData = context.createImageData(64, 64);

                const palette0 = wad.lumps.palettes.PLAYPAL.data[0];
                for (let i = 0; i < lump.size; i++) {
                    const { red, green, blue } = palette0[lump.data[i]];
                    imageData.data[(i * 4) + 0] = red;
                    imageData.data[(i * 4) + 1] = green;
                    imageData.data[(i * 4) + 2] = blue;
                    imageData.data[(i * 4) + 3] = 255;
                }
                const newCanvas = document.createElement('CANVAS');
                newCanvas.width = imageData.width;
                newCanvas.height = imageData.height;
                newCanvas.getContext('2d').putImageData(imageData, 0, 0);
                context.imageSmoothingEnabled = false;
                context.drawImage(newCanvas, 0, 0);

                this.thumbnail = canvas.toDataURL();
            } catch (error) {
                console.error(`An error occurred while generating thumbnail for ${lump.name}`, { error });
            }
        }
    }

    render() {
        const {
            lump,
            selectedLump,
            wad,
            selectLump,
            selectedLumpType,
            focusOnLump,
        } = this.props;
        if (this.state.displayError) {
            return (
                <div>
                    <h4>{lump.name}</h4>
                    <div>{lump.sizeInBytes}</div>
                </div>
            );
        }
        if (!isSelectedLump({ selectedLump, lump })) {
            return (
                <a
                    href={`#/${wad.id}/${selectedLumpType}/${lump.name}`}
                    className={style.wadLumpOuter}
                    onClick={() => selectLump(lump.name)}
                >
                    <h4>{lump.name}</h4>
                    {this.thumbnail && (
                        <img
                            title={`${lump.width}x${lump.height}`}
                            alt={lump.name}
                            src={this.thumbnail}
                        />
                    )}
                    <div>{lump.sizeInBytes}</div>
                </a>
            );
        }

        return (
            <WadLumpDetails
                lump={lump}
                wad={wad}
                focusOnLump={focusOnLump}
            />
        );
    }
}
