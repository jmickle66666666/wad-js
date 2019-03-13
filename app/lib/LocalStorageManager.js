import localForage from 'localforage';

export default class LocalStorageManager {
    constructor() {
        this.localStorage = localForage;
    }

    async get(key) {
        const value = await this.localStorage.getItem(`${PROJECT}-${key}`);
        return value;
    }

    async set(key, value) {
        const result = await this.localStorage.setItem(`${PROJECT}-${key}`, value);
        return result;
    }
}
