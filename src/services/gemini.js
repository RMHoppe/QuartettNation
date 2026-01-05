import { GoogleGenerativeAI } from "@google/generative-ai";
import Papa from "papaparse";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
let genAI = null;

if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
} else {
    console.warn("VITE_GEMINI_API_KEY is not set. Deck generation will not work.");
}

// Get selected model from localStorage or use default
export function getSelectedModel() {
    return localStorage.getItem('selectedModel') || 'gemma-3-27b-it';
}

export function setSelectedModel(model) {
    localStorage.setItem('selectedModel', model);
}

// Fetch available models from API
export async function listAvailableModels() {
    if (!genAI) return [];
    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
        );
        const data = await response.json();
        return (data.models || [])
            .filter(m => m.supportedGenerationMethods?.includes('generateContent'))
            .map(m => m.name.replace('models/', ''));
    } catch (e) {
        console.error("Failed to fetch models:", e);
        return ['gemma-3-1b-it', 'gemma-3-4b-it', 'gemma-3-12b-it'];
    }
}

// Core AI request - always returns raw text
const getResponse = async (prompt) => {
    if (!genAI) throw new Error("API Key missing");

    const modelName = getSelectedModel();
    const model = genAI.getGenerativeModel({ model: modelName });

    console.log("AI Prompt:", prompt);

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        console.log("AI Response:", text);
        return text.replace(/```csv/g, '').replace(/```/g, '').trim();
    } catch (err) {
        console.error("AI Error:", err);
        if (err.message?.includes('429')) {
            throw new Error("Quota Exceeded. Please wait a minute and try again.");
        }
        throw err;
    }
};

// Parse CSV with papaparse
const parseCSV = (text, delimiter = ',') => {
    const result = Papa.parse(text, {
        delimiter,
        skipEmptyLines: true,
        trimHeaders: true
    });
    return result.data;
};

// STEP 1: Categories (Simple list with units)
export async function generateCategories(theme) {
    const prompt = `
Theme: "${theme}"

Task:
Create exactly 4 categories for numeric attributes of items of the given theme.
Each category MUST include either a unit or "out of 10" in brackets if applicable. No explanation.

Format Example:
Top Speed [km/h], Weight [kg], Power [hp], 0-100 Time [s]
`;

    const text = await getResponse(prompt);
    // Split by newlines, clean up, remove empty lines
    const lines = text.split(',').map(line => line.trim());

    // Map to objects, default higherWins to true (user edits later)
    const categories = lines.map(line => ({
        name: line, // Keep full string "Speed [km/h]"
        higherWins: true
    }));

    return categories;
}

// STEP 2: Card Names
export async function generateCardNames(theme, categories, count = 32) {
    const prompt = `
Task: Generate exactly ${count} unique names of ${theme}.
Return a simple line-break separated list. No explanation.

Example:
Item 1
Item 2
Item 3
`;

    const text = await getResponse(prompt);
    const cardNames = text.split('\n')
        .map(l => l.replace(/^[\d]+[.)\-]\s*/, '').trim()) // Remove potential numbering just in case
        .filter(l => l.length > 0)
        .slice(0, count);

    return { cardNames };
}

// STEP 3: Card Details (Stats only) - Template Filling
export async function generateCardDetails(theme, categories, cardNames) {
    // Categories now contain the full name with units, so we can just use c.name
    const catNames = categories.map(c => c.name).join(',');

    // Construct the specific template we want the AI to fill
    const header = `Name,${catNames}`;
    const rowsTemplate = cardNames.map(name => {
        // Create placeholders: 1 for each category
        const placeholders = new Array(categories.length).fill('?').join(',');
        return `${name},${placeholders}`;
    }).join('\n');

    const prompt = `
Theme: "${theme}"
Task: Fill in the missing values ('?') in the CSV table below. No explanation.

Rules:
1. Stats: Provide numeric values only for the categories.
2. Return the COMPLETE filled CSV table, keeping the same header and row order.

CSV Template to Fill:
${header}
${rowsTemplate}
`;

    const text = await getResponse(prompt);
    const rows = parseCSV(text, ',');

    const cards = [];
    for (const row of rows) {
        if (row.length < 2) continue;

        const name = row[0]?.trim();

        if (!name || name === 'Name') continue; // Skip header if repeated

        const values = {};
        categories.forEach((cat, idx) => {
            const rawVal = row[1 + idx]; // +1 because index 0 is Name
            // Clean up numbers (remove commas in thousands, units, etc.)
            // '1,200 km/h' -> 1200
            const cleanStr = String(rawVal).replace(/[^\d.-]/g, '');
            const num = parseFloat(cleanStr);
            values[cat.name] = isNaN(num) ? 0 : num;
        });

        cards.push({ name, values });
    }

    return { cards };
}

// Legacy combined function
export async function generateDeck(theme) {
    const categories = await generateCategories(theme);
    const names = await generateCardNames(theme, categories);
    const details = await generateCardDetails(theme, categories, names.cardNames);

    return {
        categories,
        cards: details.cards
    };
}
