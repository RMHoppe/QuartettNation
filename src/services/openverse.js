const OPENVERSE_API_URL = 'https://api.openverse.org/v1';

/**
 * Search for images using the public Openverse API.
 * No Authentication required for basic usage.
 */
export const searchOpenverseImages = async (query, limit = 10) => {
    console.log(`Searching Openverse (Public) for: "${query}"`);

    const params = new URLSearchParams({
        q: query,
        page_size: Math.max(limit, 20),
        format: 'json',
        license_type: 'commercial,modification',
        // Broaden licenses for general search
        license: 'BY,BY-SA,CC0,PDM,BY-NC,BY-NC-SA'
    });

    try {
        const response = await fetch(`${OPENVERSE_API_URL}/images/?${params.toString()}`);

        if (!response.ok) {
            console.error(`Openverse API Error: ${response.status}`, await response.text());
            return [];
        }

        const data = await response.json();

        if (data.results) {
            return data.results.map(img => ({
                id: img.id,
                title: img.title,
                url: img.url, // Full size
                thumbnail: img.thumbnail, // Smaller
                attribution: `${img.license.toUpperCase()} ${img.license_version || ''} / ${img.creator || 'Unknown'}`,
                source: 'openverse'
            })).slice(0, limit);
        }
        return [];

    } catch (error) {
        console.error("Openverse Search Fetch Error:", error);
        return [];
    }
};
