import React, { Component } from 'react';

import style from './Home.scss';

import LocalStorageManager from '../lib/LocalStorageManager';

import Wad from '../models/Wad';

import Header from './Header';
import AppTitle from './AppTitle';
import Uploader from './Uploader';
import WadList from './WadList';

const localStorageManager = new LocalStorageManager();

export default class App extends Component {
    constructor() {
        super();
        const wad = this.getSavedWad();
        this.state = { wad };
    }

    getSavedWad() {
        const savedWad = localStorageManager.get('wad');

        if (!savedWad) {
            return {};
        }

        const wadData = JSON.parse(savedWad);
        const wad = new Wad();
        wad.restore(wadData);

        return wad;
    }

    updateWad = (wad) => {
        this.setState(() => ({ wad }));

        if (wad.errors.length === 0 && wad.bytesLoaded === wad.size) {
            const { file, ...sanitizedWad } = wad;
            localStorageManager.set('wad', sanitizedWad);
        }
    }

    handleWadUpload = (event) => {
        const wad = new Wad();
        wad.readFile(
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
                <WadList wad={wad} />
            </div>
        );
    }
}
