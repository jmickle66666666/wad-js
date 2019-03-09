import React from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';

import App from './App';

export default () => (
    <HashRouter>
        <Switch>
            <Route path="/view/:wadName" component={App} />
            <Route path="/" component={App} />
        </Switch>
    </HashRouter>
);
