import React from 'react';

import style from '../App.scss';

import WebWorkers from './WebWorkers';

import { SERVICE_WORKER_CORE } from '../../lib/constants';

import serviceWorkerSupport from '../../lib/serviceWorkerSupport';

const { supported: serviceWorkerSupported } = serviceWorkerSupport();

export default class ServiceWorker extends WebWorkers {
    activateUpdatedCoreServiceWorker = (registration) => {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        this.addGlobalMessage({
            type: 'info',
            id: 'offlineMode',
            text: 'Activating update...',
        });
    }

    promptUserToRefreshApp(registration) {
        this.addGlobalMessage({
            type: 'info',
            id: 'offlineMode',
            text: (
                <div>
                    A new version of
                    {' '}
                    {PROJECT_DISPLAY_NAME}
                    {' '}
                    is available.
                    {' '}
                    <span
                        role="button"
                        className={style.focusableInfo}
                        onClick={() => this.activateUpdatedCoreServiceWorker(registration)}
                        onKeyPress={() => this.activateUpdatedCoreServiceWorker(registration)}
                        tabIndex={0}
                    >
                        Please click here to activate the update.
                    </span>
                </div>
            ),
        });
    }

    listenForServiceWokerUpdate(registration) {
        if (!registration) return null;

        // look for SW updates
        registration.addEventListener('updatefound', () => {
            // the state of the installing SW has changed
            registration.installing.addEventListener('statechange', (event) => {
                console.log('statechange', event.target.state, registration);
                // ready for activation
                if (event.target.state === 'installed') {
                    this.promptUserToRefreshApp(registration);
                }

                // activated
                if (event.target.state === 'activated') {
                    window.location.reload();
                }
            });
        });

        if (registration.waiting) return this.promptUserToRefreshApp(registration);
        return null;
    }


    registerServiceWorker({ scriptURL, catchError }) {
        if (serviceWorkerSupported) {
            return navigator.serviceWorker.register(scriptURL, {
                updateViaCache: 'all',
            }).then((registration) => {
                console.log(`${scriptURL} registered.`);
                return { registration };
            }).catch((error) => {
                console.error(`${scriptURL} registration failed.`, error);
                if (catchError) {
                    catchError({ error });
                }
                return { error };
            });
        }

        return {};
    }

    registerCoreServiceWorker() {
        return this.registerServiceWorker({
            scriptURL: SERVICE_WORKER_CORE,
            catchError: ({ error }) => this.addGlobalMessage({
                type: 'error',
                id: 'offlineMode',
                text: `An error occured while enabling offline mode. ${error.message}`,
            }),
        });
    }

    registerCoreServiceWorkerAndListenForUpdate() {
        if (serviceWorkerSupported) {
            this.registerCoreServiceWorker()
                .then((result) => {
                    if (result.error) {
                        console.error('An error occurred while registering Core SW.', { error: result.error });
                        return;
                    }

                    this.listenForServiceWokerUpdate(result.registration);
                }).catch((error) => {
                    console.error('Core SW registration update failed: ', error);
                    this.addGlobalMessage({
                        type: 'error',
                        id: 'offlineMode',
                        text: 'An error occured while listening for app updates.',
                    });
                });
        }
    }

    unregisterServiceWorkers({ targetScriptURL = '' } = {}) {
        if (serviceWorkerSupported) {
            let workerScriptURL = '';
            navigator.serviceWorker.getRegistrations().then((registrations) => {
                for (let i = 0; i < registrations.length; i++) {
                    const registration = registrations[i];
                    workerScriptURL = registration.active ? registration.active.scriptURL : '';
                    if (!targetScriptURL || workerScriptURL.includes(targetScriptURL)) {
                        registration.unregister();
                        console.log(`${targetScriptURL || workerScriptURL} unregistered.`);
                    }
                }
            }).catch((error) => {
                console.error(`SW unregistration failed (worker scriptURL: '${workerScriptURL}').`, error);

                if (targetScriptURL === SERVICE_WORKER_CORE) {
                    this.addGlobalMessage({
                        type: 'error',
                        id: 'offlineMode',
                        text: `An error occured while disabling offline mode. ${error.message}`,
                    });
                } else {
                    this.addGlobalMessage({
                        type: 'error',
                        id: 'serviceWorker',
                        text: `An error occured while getting registrations and unregistering service workers. ${error.message}`,
                    });
                }
            });
        }
    }
}
