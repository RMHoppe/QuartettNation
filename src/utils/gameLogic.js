/**
 * Resolves a round of Top Trumps
 * @param {Object} gameState - Current game object
 * @param {Object} deckData - Full deck metadata including categories
 * @param {string} category - The category selected for battle
 * @returns {Object} newState - The updated game state object (or throws Error)
 */
export function resolveRound(gameState, deckData, category) {
    let state = { ...gameState };
    const players = [...state.players];
    // Filter active players (not eliminated)
    const activeCandidates = players.filter(p => !p.eliminated);

    if (activeCandidates.length < 2) return state; // Should be game over already?

    // 1. Collect played cards (Top card of each hand)
    const playedCards = activeCandidates.map(p => {
        if (!p.hand || p.hand.length === 0) return null; // Should not happen for active player
        const card = p.hand[0];
        // Parse value safely
        const rawVal = card.attributes ? card.attributes[category] : (card.values ? card.values[category] : 0);
        const value = parseFloat(rawVal) || 0; // Handle non-numeric?

        return {
            playerId: p.id,
            card,
            value
        };
    }).filter(pc => pc !== null);

    // 2. Determine Winner
    const catConfig = deckData.categories.find(c => c.name === category);
    const higherWins = catConfig ? catConfig.higherWins : true; // default true

    playedCards.sort((a, b) => {
        if (higherWins) return b.value - a.value;
        return a.value - b.value;
    });

    const bestValue = playedCards[0].value;
    const ties = playedCards.filter(c => c.value === bestValue);

    // Cards currently in play for this round + pot
    // Note: We remove top cards from hands below
    const roundCards = playedCards.map(pc => pc.card);
    const newPot = [...state.pot, ...roundCards];

    // 3. Remove played cards from hands
    activeCandidates.forEach(p => {
        p.hand = p.hand.slice(1);
    });

    if (ties.length > 1) {
        // --- WAR MODE ---
        state.pot = newPot;
        state.warMode = true;
        state.warParticipants = ties.map(t => t.playerId);
        state.lastRound = { category, winner: null, cards: playedCards };
        // Turn player stays effectively the same (or first tied player) to initiate next battle
        // Logic: active player must be one of the tied players
        state.turnPlayerId = ties[0].playerId;

    } else {
        // --- WINNER ---
        const winnerId = ties[0].playerId;
        const winner = players.find(p => p.id === winnerId);

        // Winner gets the pot
        winner.hand = [...winner.hand, ...newPot];

        state.pot = [];
        state.warMode = false;
        state.warParticipants = null;
        state.turnPlayerId = winnerId; // Winner starts next
        state.lastRound = { category, winner: winnerId, cards: playedCards };
    }

    // 4. Eliminate empty hands
    players.forEach(p => {
        if (p.hand.length === 0) p.eliminated = true;
    });

    // 5. Check Game Over
    const remaining = players.filter(p => !p.eliminated);
    if (remaining.length === 1) {
        state.winner = remaining[0];
        // Status update should be handled by caller if needed, but we return state
    }

    return state;
}

/**
 * Shuffles and deals cards to players
 */
export function initializeGame(players, deckCards) {
    const cards = [...deckCards];
    // Fisher-Yates shuffle
    for (let i = cards.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    const newPlayers = [...players];
    const handSize = Math.floor(cards.length / newPlayers.length);

    newPlayers.forEach((p, idx) => {
        const start = idx * handSize;
        const end = start + handSize;
        p.hand = cards.slice(start, end);
        p.cardsWon = [];
        p.eliminated = false;
    });

    const pot = cards.slice(newPlayers.length * handSize);

    return {
        players: newPlayers,
        pot,
        currentFn: null,
        turnPlayerId: newPlayers[0].id,
        warMode: false,
        roundWinner: null,
        lastRound: null
    };
}
