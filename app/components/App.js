import React from 'react';
import { HashRouter, Route } from 'react-router-dom';

import Home from './Home';
import WadDetails from './WadDetails';

export default () => (
    <HashRouter>
        <div>
            <Route path="/" component={Home} />
            <Route path="/wad/:name" component={WadDetails} />
        </div>
    </HashRouter>
);
