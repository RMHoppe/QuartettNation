
const FLICKR_API_KEY = import.meta.env.VITE_FLICKR_API_KEY;
const FLICKR_API_URL = 'https://www.flickr.com/services/rest/';

// Helper to clean query (similar to wikimedia, remove technical terms)
const cleanQuery = (query) => {
    if (!query) return '';
    // Flickr is better with simpler keywords usually
    const stopWords = ['1:1', 'aspect ratio', 'studio lighting', 'view', 'profile', 'front', 'side', 'detailed', '4k', 'hd', 'close-up'];
    let cleaned = query.toLowerCase();
    stopWords.forEach(word => {
        cleaned = cleaned.replace(word, '');
    });
    return cleaned.replace(/\s+/g, ' ').trim();
}

const performSearch = async (query, limit) => {
    if (!FLICKR_API_KEY) {
        console.warn("VITE_FLICKR_API_KEY is not set.");
        return [];
    }

    const cleanedQuery = cleanQuery(query);
    console.log(`Searching Flickr for: "${cleanedQuery}"`);

    const params = new URLSearchParams({
        method: 'flickr.photos.search',
        api_key: FLICKR_API_KEY,
        text: cleanedQuery,
        sort: 'relevance',
        privacy_filter: 1, // public photos
        safe_search: 1, // safe
        content_type: 1, // photos only
        media: 'photos',
        license: '4,5,9,10', // 4=CC-BY, 5=CC-BY-SA, 9=CC0, 10=Public Domain
        extras: 'url_l,url_m,owner_name,license',
        per_page: Math.max(limit, 20), // Fetch a few more to filter if needed
        format: 'json',
        nojsoncallback: 1
    });

    try {
        const response = await fetch(`${FLICKR_API_URL}?${params.toString()}`);
        const data = await response.json();

        if (data.stat !== 'ok') {
            console.error("Flickr API Error:", data.message);
            return [];
        }

        return data.photos.photo
            .filter(photo => photo.url_l || photo.url_m) // Must have a usable URL
            .map(photo => {
                const imageUrl = photo.url_l || photo.url_m;

                // Map license ID to string
                const licenses = {
                    '4': 'CC BY 2.0',
                    '5': 'CC BY-SA 2.0',
                    '9': 'CC0 1.0',
                    '10': 'Public Domain'
                };

                return {
                    id: photo.id,
                    title: photo.title,
                    url: imageUrl,
                    attribution: `${licenses[photo.license] || 'CC'} / ${photo.ownername || 'Unknown'}`
                };
            })
            .slice(0, limit);

    } catch (error) {
        console.error("Flickr Search Fetch Error:", error);
        return [];
    }
}

export const searchFlickrImages = (query, limit = 10) => {
    return performSearch(query, limit);
};
