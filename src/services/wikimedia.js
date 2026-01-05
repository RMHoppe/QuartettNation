const WIKIMEDIA_API_URL = 'https://commons.wikimedia.org/w/api.php';

// Helper to clean query (remove technical terms that confuse search)
const cleanQuery = (query) => {
    if (!query) return '';
    const stopWords = ['1:1', 'aspect ratio', 'studio lighting', 'view', 'profile', 'front', 'side', 'detailed', '4k', 'hd', 'close-up'];
    let cleaned = query.toLowerCase();
    stopWords.forEach(word => {
        cleaned = cleaned.replace(word, '');
    });
    return cleaned.replace(/\s+/g, ' ').trim();
}
/**
 * Search for images on Wikimedia Commons
 * @param {string} query - The search query
 * @param {number} limit - Number of results to return
 * @returns {Promise<Array>} - List of image objects
 */
export async function searchImages(query, limit = 5) {
    const clean = cleanQuery(query);
    if (!clean) return [];

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
            }).filter(item => item !== null);
        } catch (error) {
            console.error("Wikimedia Search Error:", error);
            return [];
        }
    };
    let results = await fetchResults(clean);
    return results.slice(0, limit);
}
