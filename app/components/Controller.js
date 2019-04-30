import React from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';

import App from './App';
import ErrorBoundary from './ErrorBoundary';

export default () => (
    <ErrorBoundary>
        <HashRouter>
            <Switch>
                <Route path="/:wadName/:lumpType/:lumpName" component={App} />
                <Route path="/:wadName/:lumpType" component={App} />
                <Route path="/:wadName" component={App} />
                <Route path="/" component={App} />
            </Switch>
        </HashRouter>
    </ErrorBoundary>
);
