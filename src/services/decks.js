import { supabase } from '../lib/supabase';

/**
 * Fetch all decks ordered by creation date
 */
export async function getAllDecks() {
    const { data, error } = await supabase
        .from('decks')
        .select('*, cards(count)')
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
}

/**
 * Fetch a single deck by ID with all its cards
 */
export async function getDeckById(deckId) {
    const { data, error } = await supabase
        .from('decks')
        .select('*, cards(*)')
        .eq('id', deckId)
        .single();

    if (error) throw error;

    // Sort cards by name consistently
    if (data.cards) {
        data.cards.sort((a, b) => a.name.localeCompare(b.name));
    }

    return data;
}

/**
 * Save a new deck and its cards to the database
 * @param {Object} deckMeta - { name, theme, categories }
 * @param {Array} cards - Array of card objects
 */
export async function saveDeck(deckMeta, cards) {
    // 1. Save Deck Meta
    const { data: deckData, error: deckError } = await supabase
        .from('decks')
        .insert({
            name: deckMeta.name,
            theme: deckMeta.theme,
            categories: deckMeta.categories
        })
        .select()
        .single();

    if (deckError) throw deckError;

    // 2. Prepare Cards
    // Map internal card structure to DB schema
    const cardsToInsert = cards.map(c => ({
        deck_id: deckData.id,
        name: c.name,
        image_url: c.image_url,
        attribution_text: c.attribution_text,
        attributes: c.values || c.attributes // different property names in creation vs fetch
    }));

    // 3. Save Cards
    const { error: cardsError } = await supabase
        .from('cards')
        .insert(cardsToInsert);

    if (cardsError) throw cardsError;

    return deckData;
}

/**
 * Delete a deck by ID
 */
export async function deleteDeck(deckId) {
    const { error } = await supabase
        .from('decks')
        .delete()
        .eq('id', deckId);

    if (error) throw error;
}
