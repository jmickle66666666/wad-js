import localForage from 'localforage';

export default class LocalStorageManager {
    constructor() {
        this.localStorage = localForage;
    }

    async get(key) {
        try {
            const result = await this.localStorage.getItem(`${PROJECT}-${key}`);
            return { result };
        } catch (error) {
            console.error(`An error occurred while fetching '${key}'.`, { error });
            return { error };
        }
    }

    async set(key, value) {
        try {
            await this.localStorage.setItem(`${PROJECT}-${key}`, value);
            return {};
        } catch (error) {
            console.error(`An error occurred while saving '${key}'.`, { error });
            return { error };
        }
    }
}
