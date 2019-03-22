import { WORKER_PATH_PREFIX, WORKER_FILES } from '../lib/constants';

/*

class MyApp extends Component {
    supervisor = new Supervisor()

    workerError(error) {
        console.error('Worker errored out.', { error })
    }

    workerDone(payload) {
        console.log('Worker is done.', { payload })
    }

    startWorker() {
        this.supervisor.myWorker1.worker.terminate();
        this.supervisor.myWorker1.restart();
        this.supervisor.myWorker1.worker.onmessage = workerDone
        this.supervisor.myWorker1.worker.onerror = workerError;
    }

    sendTask(myMessage) {
        this.supervisor.myWorker1.worker.postMessage({ myMessage });
    }

    interruptWithOtherTask(myOtherMessage) {
        this.startWorker();
        this.supervisor.myWorker1.worker.postMessage({ myOtherMessage });
    }
}

*/

export default class Supervisor {
    constructor() {
        const workers = {};
        for (let i = 0; i < WORKER_FILES.length; i++) {
            const path = WORKER_FILES[i];
            const worker = new Worker(`${WORKER_PATH_PREFIX}${path}.js`);
            const superWorker = {
                worker,
                restart: () => this.restartWorker(path),
            };

            workers[path] = superWorker;
            this[path] = superWorker;
        }

        this.workers = { ...workers };
    }

    restartWorker(path) {
        const { workers } = this;
        const worker = new Worker(`${WORKER_PATH_PREFIX}${path}.js`);
        const superWorker = {
            worker,
            restart: () => this.restartWorker(path),
        };

        const updatedWorkers = {
            ...workers,
            [path]: superWorker,
        };

        this[path] = superWorker;
        this.workers = { ...updatedWorkers };
    }
}
