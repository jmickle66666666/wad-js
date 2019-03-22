import React, { Component } from 'react';

import style from './Midi.scss';

import ErrorMessage from '../ErrorMessage';

export default class Midi extends Component {
    state = { playing: false }

    midiURL = URL.createObjectURL(new Blob([this.props.midi]))

    play = () => {
        if (typeof MIDIjs !== 'undefined') {
            MIDIjs.play(this.midiURL);
            this.setState({ playing: true });
        }
    }

    pause = () => {
        if (typeof MIDIjs !== 'undefined') {
            MIDIjs.stop();
            this.setState({ playing: false });
        }
    }

    render() {
        const { midi } = this.props;
        const { playing } = this.state;

        console.log({ midi });

        if (midi) {
            return (
                <div className={style.playerButton}>
                    {playing ? <span onClick={this.pause}>⏹️️</span> : <span onClick={this.play}>▶️</span>}
                </div>
            );
        }

        if (midi === false) {
            return (
                <ErrorMessage message="Could not convert MUS to MIDI." />
            );
        }

        return 'Loading...';
    }
}
