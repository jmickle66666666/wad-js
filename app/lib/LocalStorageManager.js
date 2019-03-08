export default class LocalStorageManager {
    constructor() {
        if (!localStorage) {
            console.warn('localStorage is not supported on this device');
            return false;
        }

        this.localStorage = localStorage;
    }

    supported() {
        return this.localStorage;
    }

    get(key) {
        if (!this.supported) {
            return null;
        }

        const value = localStorage.getItem(`${PROJECT}-${key}`);

        return value;
    }

    set(key, value) {
        try {
            this.localStorage.setItem(`${PROJECT}-${key}`, JSON.stringify(value));

            return value;
        } catch (error) {
            console.error(`An error occurred while saving '${key}' in localStorage`, error);
            return null;
        }
    }
}
