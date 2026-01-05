/**
 * Loads an image from a URL, crops it to a center square, 
 * resizes it to 512x512, and returns the result as a Data URL.
 * 
 * @param {string} imageUrl 
 * @returns {Promise<string>} Data URL of the processed image
 */
export async function processImage(imageUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Try to request CORS permission
        img.src = imageUrl;

        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 512;
            canvas.height = 512;
            const ctx = canvas.getContext('2d');

            // Calculate crop
            const minDim = Math.min(img.width, img.height);
            const sx = (img.width - minDim) / 2;
            const sy = (img.height - minDim) / 2;

            // Draw cropped and resized image to canvas
            ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, 512, 512);

            // Return as Data URL (JPEG for smaller size)
            resolve(canvas.toDataURL('image/jpeg', 0.9));
        };

        img.onerror = (err) => {
            console.warn("Image processing failed (likely CORS), using original URL.", err);
            // Fallback: return original URL if we can't process it due to CORS
            resolve(imageUrl);
        };
    });
}
