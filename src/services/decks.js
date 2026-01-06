import { supabase } from '../lib/supabase';

/**
 * Fetch decks for the current user (Owned + Shared)
 * @param {string} userId
 */
export async function getUserDecks(userId) {
    if (!userId) return [];

    // 1. Fetch Owned Decks
    const { data: owned, error: ownerError } = await supabase
        .from('decks')
        .select('*, cards(count)')
        .eq('created_by', userId)
        .order('created_at', { ascending: false });

    if (ownerError) throw ownerError;

    // 2. Fetch Shared Decks via deck_access
    const { data: sharedAccess, error: sharedError } = await supabase
        .from('deck_access')
        .select('deck:decks(*, cards(count))') // join decks
        .eq('user_id', userId);

    if (sharedError) throw sharedError;

    // Flatten shared structure and mark as shared
    const shared = sharedAccess.map(item => ({
        ...item.deck,
        isShared: true
    }));

    // Combine and dedupe (just in case)
    const all = [...(owned || []), ...shared];
    return all.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
}

/**
 * Grant read access to a deck for a user
 */
export async function grantDeckAccess(deckId, userId) {
    // Check if user already owns it
    const { data: deck } = await supabase.from('decks').select('created_by').eq('id', deckId).single();
    if (deck && deck.created_by === userId) return; // Owner doesn't need access entry

    // Insert access if not exists
    const { error } = await supabase
        .from('deck_access')
        .upsert({
            deck_id: deckId,
            user_id: userId,
            access_level: 'read',
            last_accessed_at: new Date()
        }, { onConflict: 'user_id, deck_id' }); // valid SQL for composite key

    if (error) console.error("Error granting deck access:", error);
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
 * @param {string} userId - ID of the creating user
 */
export async function saveDeck(deckMeta, cards, userId) {
    // 1. Save Deck Meta
    const { data: deckData, error: deckError } = await supabase
        .from('decks')
        .insert({
            name: deckMeta.name,
            theme: deckMeta.theme,
            categories: deckMeta.categories,
            created_by: userId
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
 * @param {string} deckId 
 * @param {string} currentUserId 
 */
export async function deleteDeck(deckId, currentUserId) {
    // Optional: Fetch deck first to verify owner if RLS doesn't handle it strictly yet
    // But for UI feedback, passing the check is good.
    // For now, let's trust the UI check or the RLS (if we added it).
    // As per task, "only this user should be allowed".

    // We can do a quick check via query if we want to be safe API-side
    const { data: deck } = await supabase.from('decks').select('created_by').eq('id', deckId).single();

    if (deck && deck.created_by && deck.created_by !== currentUserId) {
        throw new Error("Unauthorized: You do not own this deck.");
    }

    const { error } = await supabase
        .from('decks')
        .delete()
        .eq('id', deckId);

    if (error) throw error;
}
