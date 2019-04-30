import React, { Component, Fragment } from 'react';

import style from './App.scss';

import LocalStorageManager from '../lib/LocalStorageManager';
import { ThemeContext } from '../lib/Context';

import Header from './Header';

const prefixWindowtitle = document.title;

const localStorageManager = new LocalStorageManager();

export default class ErrorBoundary extends Component {
    state = {
        displayError: {},
        settings: { theme: 'dark' },
    }

    async componentDidMount() {
        const { result: settings } = await this.getSettingsFromLocalMemory();

        this.setState(prevState => ({
            settings: {
                ...prevState.settings,
                ...settings && { ...settings },
            },
        }));
    }

    getSettingsFromLocalMemory = async () => localStorageManager.get('settings')

    getThemeClass = () => {
        const { settings: { theme } } = this.state;
        const themeClass = `${theme}-theme`;
        const themeClassRules = style[themeClass];
        return themeClassRules;
    }

    componentDidCatch(error, info) {
        document.title = `${prefixWindowtitle} / oops!`;
        this.setState(() => ({ displayError: { error, info } }));
    }

    render() {
        const { children } = this.props;
        const {
            displayError,
            settings,
        } = this.state;

        if (displayError.error) {
            return (
                <ThemeContext.Provider value={settings.theme}>
                    <div className={`${style.app} ${this.getThemeClass()}`}>
                        <Header />
                        <div className={style.errorScreenOuter}>
                            <div className={style.errorScreenInner}>
                                <div className={style.errorMessage}>
                                    <h2>An error occurred :(</h2>
                                    Please use the message below to
                                    {' '}
                                    <a target="_blank" rel="noopener noreferrer" href={ISSUES}>report the issue</a>
                                    {' '}
                                    on GitHub.
                                </div>
                                <code>
                                    Error:
                                    {' '}
                                    {displayError.error.message}
                                    <br />
                                    <br />
                                    {displayError.error.stack && displayError.error.stack.split('\n').map((stack, index) => (
                                        <Fragment key={index}>
                                            {stack.replace('webpack-internal:///', '').replace('@', ' @ ')}
                                            <br />
                                        </Fragment>
                                    ))}
                                    {displayError.info.componentStack && displayError.info.componentStack.split('\n').map((stack, index) => (
                                        <Fragment key={index}>
                                            {stack}
                                            <br />
                                        </Fragment>
                                    ))}
                                    <br />
                                    URL:
                                    {' '}
                                    {document.location.href}
                                </code>
                                <a className={style.errorBackLink} href="/">Reload the app.</a>
                            </div>
                        </div>
                    </div>
                </ThemeContext.Provider>
            );
        }

        return children;
    }
}
