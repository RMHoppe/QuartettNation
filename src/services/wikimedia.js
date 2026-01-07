const WIKIMEDIA_API_URL = 'https://commons.wikimedia.org/w/api.php';

// Simple Concurrency Queue
const MAX_CONCURRENT = 3;
let activeRequests = 0;
const queue = [];

const processQueue = () => {
    if (activeRequests >= MAX_CONCURRENT || queue.length === 0) return;

    const { task, resolve, reject } = queue.shift();
    activeRequests++;

    task()
        .then(resolve)
        .catch(reject)
        .finally(() => {
            activeRequests--;
            processQueue();
        });
};

const limitConcurrency = (fn) => {
    return (...args) => new Promise((resolve, reject) => {
        queue.push({
            task: () => fn(...args),
            resolve,
            reject
        });
        processQueue();
    });
};


// Helper to clean query (remove technical terms that confuse search)
// Removed query cleaning as per request
const cleanQuery = (query) => query;

const performSearch = async (clean, limit) => {
    // Helper to perform the actual fetch
    const fetchResults = async (searchQuery) => {
        const fetchLimit = 50;
        const params = new URLSearchParams({
            action: 'query',
            format: 'json',
            generator: 'search',
            gsrsearch: searchQuery,
            gsrnamespace: '6',
            gsrlimit: fetchLimit,
            prop: 'imageinfo',
            iiprop: 'url|extmetadata|dimensions|thumburl',
            iiurlwidth: 640,
            origin: '*'
        });

        console.log(`Searching Wikimedia for: "${searchQuery}"`);
        try {
            const response = await fetch(`${WIKIMEDIA_API_URL}?${params.toString()}`);
            if (response.status === 429) {
                // Simple retry on rate limit
                await new Promise(r => setTimeout(r, 2000));
                return fetchResults(searchQuery);
            }

            const data = await response.json();

            if (!data.query || !data.query.pages) return [];

            return Object.values(data.query.pages).map(page => {
                const info = page.imageinfo ? page.imageinfo[0] : null;
                if (!info) return null;

                const displayUrl = info.thumburl || info.url;
                let artist = 'Unknown';
                let license = 'CC BY-SA';
                if (info.extmetadata) {
                    if (info.extmetadata.Artist) artist = info.extmetadata.Artist.value.replace(/<[^>]*>?/gm, '');
                    if (info.extmetadata.LicenseShortName) license = info.extmetadata.LicenseShortName.value;
                }

                return {
                    id: page.pageid,
                    title: page.title.replace('File:', ''),
                    url: displayUrl,
                    original_url: info.url,
                    attribution: `${license} / ${artist}`
                };
            }).filter(item => {
                if (!item) return false;
                const lowerUrl = item.original_url.toLowerCase();
                // Filter for static images only: exclude videos, gifs, pdfs, etc.
                const validExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
                return validExtensions.some(ext => lowerUrl.endsWith(ext));
            });
        } catch (error) {
            console.error("Wikimedia Search Error:", error);
            return [];
        }
    };

    let results = await fetchResults(clean);
    return results.slice(0, limit);
}

// Export the throttled version
export const searchImages = (query, limit = 5) => {
    const clean = cleanQuery(query);
    if (!clean) return Promise.resolve([]);

    return limitConcurrency(performSearch)(clean, limit);
};
