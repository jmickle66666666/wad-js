import React from 'react';

import style from './App.scss';

import Header from './Header';
import AppTitle from './AppTitle';
import Uploader from './Uploader';

export default () => (
    <div className={style.app}>
        <Header />
        <AppTitle />
        <Uploader />
    </div>
);
