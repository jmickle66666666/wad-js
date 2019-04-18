export const setCacheItemAsBlob = ({ cacheId, requestURL, responseData }) => {
    const response = new Response(responseData);
    caches.open(cacheId).then(cache => cache.put(requestURL, response));
};

export const getCacheItemAsArrayBuffer = async ({ cacheId, requestURL }) => {
    try {
        const cache = await caches.open(cacheId);
        const response = await cache.match(requestURL);

        if (!response) {
            return null;
        }

        return await response.arrayBuffer();
    } catch (error) {
        console.error(`An error occurred while retrieving cache of '${requestURL}'.`, { error });
        return null;
    }
};

export const getCacheItemAsBlob = async ({ cacheId, requestURL }) => {
    try {
        const cache = await caches.open(cacheId);
        const response = await cache.match(requestURL);

        if (!response) {
            return null;
        }

        return await response.blob();
    } catch (error) {
        console.error(`An error occurred while retrieving cache of '${requestURL}'.`, { error });
        return null;
    }
};

export const getCacheItemAsJson = async ({ cacheId, requestURL }) => {
    try {
        const cache = await caches.open(cacheId);
        const response = await cache.match(requestURL);

        if (!response) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error(`An error occurred while retrieving cache of '${requestURL}'.`, { error });
        return null;
    }
};

export const getCacheItemAsText = async ({ cacheId, requestURL }) => {
    try {
        const cache = await caches.open(cacheId);
        const response = await cache.match(requestURL);

        if (!response) {
            return null;
        }

        return await response.text();
    } catch (error) {
        console.error(`An error occurred while retrieving cache of '${requestURL}'.`, { error });
        return null;
    }
};

export const deleteCache = async ({ cacheId }) => {
    try {
        await caches.delete(cacheId);
        console.log(cacheId, 'deleted');
        return true;
    } catch (error) {
        console.error(`An error occurred while deleting cache of '${cacheId}'.`, { error });
        return false;
    }
};

export const deleteAllCache = async () => {
    try {
        const cacheKeys = await caches.keys();
        await cacheKeys.map(async (key) => {
            await caches.delete(key);
        });
        return true;
    } catch (error) {
        console.error('An error occurred while deleting the cache.', { error });
        return false;
    }
};
