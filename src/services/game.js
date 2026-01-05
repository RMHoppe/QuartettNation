import { supabase } from '../lib/supabase';

/**
 * Creates a new game with the host's deck
 * @param {string} deckId - The ID of the deck to be used
 * @param {string} hostId - The ID of the host player (session)
 * @param {string} playerName - The name of the host
 * @returns {Promise<string>} - The new game ID
 */
export async function createGame(deckId, hostId, playerName) {
    // 1. Create the game row
    const { data: game, error } = await supabase
        .from('games')
        .insert({
            host_deck_id: deckId,
            status: 'lobby',
            // Initial state with just the host
            game_state: {
                players: [{
                    id: hostId, // Client-side temp ID for session
                    name: playerName,
                    isHost: true,
                    hand: [], // Will be filled on start
                    cardsWon: [] // Pile of won cards
                }],
                pot: [], // War pot
                chat: []
            }
        })
        .select()
        .single();

    if (error) throw error;
    return game;
}

/**
 * Join an existing game lobby
 * @param {string} gameId 
 * @param {string} playerName 
 */
export async function joinGame(gameId, playerName) {
    // 1. Fetch current state to append player
    const { data: game, error: fetchError } = await supabase
        .from('games')
        .select('game_state, status')
        .eq('id', gameId)
        .single();

    if (fetchError) throw fetchError;
    if (game.status !== 'lobby') throw new Error('Game already started');

    const playerId = crypto.randomUUID();
    const newPlayer = {
        id: playerId,
        name: playerName,
        isHost: false,
        hand: [],
        cardsWon: []
    };

    // 2. Append player (Optimistic update pattern could be used, but simple update is fine for lobby)
    // We rely on the Host (or whoever calls this) to update. 
    // Actually, distinct clients calling update on the same JSONB can race.
    // Ideally we use an RPC or careful merging. For this MVP, we'll read-modify-write.

    // Check if distinct name/session (simple unique check)
    const currentPlayers = game.game_state.players || [];
    if (currentPlayers.length >= 4) throw new Error('Lobby full');

    // Update db
    const { error: updateError } = await supabase
        .from('games')
        .update({
            game_state: {
                ...game.game_state,
                players: [...currentPlayers, newPlayer]
            }
        })
        .eq('id', gameId);

    if (updateError) throw updateError;
    return playerId;
}

/**
 * Subscribe to game updates
 */
export function subscribeToGame(gameId, onUpdate) {
    const subscription = supabase
        .channel(`game:${gameId}`)
        .on('postgres_changes', {
            event: 'UPDATE',
            schema: 'public',
            table: 'games',
            // Removing strict ID filter to debug, filtering in callback if needed or relying on unique channel?
            // Actually channel per game is virtual found in supabase, but postgres_changes listens to the whole table unless filtered.
            // Let's keep filter but maybe UUID quoting is issue? usually not.
            filter: `id=eq.${gameId}`
        }, (payload) => {
            onUpdate(payload);
        })
        .subscribe((status) => {
            console.log(`[GameService] Subscription status for ${gameId}:`, status);
        });

    return () => {
        supabase.removeChannel(subscription);
    };
}


/**
 * Host only: update the full game state
 */
export async function updateGameState(gameId, newState, status = null) {
    const updates = { game_state: newState };
    if (status) updates.status = status;

    const { error } = await supabase
        .from('games')
        .update(updates)
        .eq('id', gameId);

    if (error) console.error("Sync Error:", error);
}


