import React, { Component } from 'react';

import style from './App.scss';

import Wad from '../models/Wad';

import Header from './Header';
import AppTitle from './AppTitle';
import Uploader from './Uploader';

export default class App extends Component {
    state = { wad: {} }

    updateWad = (wad) => {
        this.setState(() => ({ wad }));
    }

    handleWadUpload = (event) => {
        const wad = new Wad(
            event.target.files[0],
            this.updateWad,
        );
    }

    render() {
        const { wad } = this.state;
        return (
            <div className={style.app}>
                <Header />
                <AppTitle />
                <Uploader
                  wad={wad}
                  handleWadUpload={this.handleWadUpload}
                />
            </div>
        );
    }
}
