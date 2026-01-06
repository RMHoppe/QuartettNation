/**
 * Resolves a round of Top Trumps
 * @param {Object} gameState - Current game object
 * @param {Object} deckData - Full deck metadata including categories
 * @param {string} category - The category selected for battle
 * @returns {Object} newState - The updated game state object (or throws Error)
 */
export function resolveRound(gameState, deckData, category) {
    let state = { ...gameState };
    // Deep copy players to safely mutate hands during calculation
    const players = state.players.map(p => ({ ...p, hand: [...p.hand] }));

    // Pot starts with existing pot (if any, though usually empty at round start in this new logic)
    let pot = [...state.pot];
    state.pot = []; // Clear state pot as we move it to local variable

    const catConfig = deckData.categories.find(c => c.name === category);
    const higherWins = catConfig ? catConfig.higherWins : true;

    // Active candidates for the battle (initially all non-eliminated players)
    let candidates = players.filter(p => !p.eliminated);

    // Safety check
    if (candidates.length < 2 && !state.winner) {
        // Should trigger game over check, but let's proceed to see if we can resolve
    }

    let winner = null;
    let finalPlayedCards = [];

    // --- BATTLE LOOP (Recursive War) ---
    // We loop until a winner is found or candidates run out
    let warHistory = [];

    while (!winner) {
        // 1. Filter candidates who actually have cards
        const capableCandidates = candidates.filter(p => p.hand.length > 0);

        if (capableCandidates.length === 0) {
            // Everyone ran out of cards during war -> DRAW
            break;
        }

        if (capableCandidates.length === 1) {
            // Only one player has cards left to fight -> They win by default
            winner = capableCandidates[0];
            break;
        }

        // Update candidates to only those who can play
        candidates = capableCandidates;

        // 2. Play cards
        const roundPlays = candidates.map(p => {
            const card = p.hand[0];
            const rawVal = card.attributes ? card.attributes[category] : (card.values ? card.values[category] : 0);
            const value = parseFloat(rawVal) || 0;
            return {
                playerId: p.id,
                playerName: p.name,
                card,
                value,
                playerRef: p // Keep ref to modify hand
            };
        });

        // Add to pot
        const cardsInPlay = roundPlays.map(rp => rp.card);
        pot.push(...cardsInPlay);

        // Remove from hands
        roundPlays.forEach(rp => {
            rp.playerRef.hand.shift(); // Remove top card
        });

        // 3. Determine best value
        const multiplier = higherWins ? 1 : -1;
        roundPlays.sort((a, b) => (b.value - a.value) * multiplier);

        const bestValue = roundPlays[0].value;
        const ties = roundPlays.filter(rp => rp.value === bestValue);

        // Save this round's plays for history and UI
        finalPlayedCards = roundPlays;
        warHistory.push({
            winner: ties.length === 1 ? ties[0].playerId : null,
            cardsPlayed: roundPlays.map(rp => ({
                playerId: rp.playerId,
                playerName: rp.playerName,
                card: rp.card,
                value: rp.value
            }))
        });

        if (ties.length === 1) {
            // Single winner
            winner = ties[0].playerRef;
        } else {
            // Tie -> Loop continues (War)
            // Candidates for next loop are just the tied players
            candidates = ties.map(t => t.playerRef);
            // We don't return here, we loop again immediately
        }
    }

    // --- RESOLUTION ---

    if (winner) {
        // Winner gets the pot
        winner.hand.push(...pot);

        state.warMode = false;
        state.warParticipants = null;
        state.turnPlayerId = winner.id;
        state.lastRound = {
            category,
            winner: winner.id,
            winnerName: winner.name,
            warHistory,
            cardsPlayed: finalPlayedCards.map(rp => ({
                playerId: rp.playerId,
                playerName: rp.playerName,
                card: rp.card
            }))
        };
    } else {
        // Draw / Stalemate (Everyone ran out of cards)
        // Pot is lost? Or stays? For now, let's say it's lost or remains in limbo.
        // But crucially, NO `warMode: true`.
        state.warMode = false;
        state.turnPlayerId = null; // No active player? Needs handling.
        // Actually, if everyone is out of cards, the game end check below will catch it.
        state.lastRound = {
            category,
            winner: null,
            winnerName: null,
            warHistory,
            cardsPlayed: finalPlayedCards.map(rp => ({
                playerId: rp.playerId,
                playerName: rp.playerName,
                card: rp.card
            }))
        };
    }

    state.players = players; // Update players with new hands
    state.pot = []; // Pot is either claimed or emptied

    // 4. Update Elimination Status
    state.players.forEach(p => {
        if (p.hand.length === 0) p.eliminated = true;
    });

    // 5. Check Game Over
    const remaining = state.players.filter(p => !p.eliminated);

    if (remaining.length === 1) {
        // One Survivor
        state.winner = remaining[0];
        state.status = 'completed'; // Explicitly set status to completed
    } else if (remaining.length === 0) {
        // Total Draw
        state.status = 'completed';
        state.winner = { name: "No One (Draw)" }; // Mock winner object for UI
    }

    // If game continues, ensure turnPlayer is valid
    if (state.status !== 'completed' && (!state.turnPlayerId || state.players.find(p => p.id === state.turnPlayerId)?.eliminated)) {
        // If turn player was eliminated (rare case in war?), pass turn to next remaining
        state.turnPlayerId = remaining[0]?.id;
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

    const newPlayers = players.map(p => ({
        ...p,
        hand: [],
        cardsWon: [],
        eliminated: false
    }));

    const handSize = Math.floor(cards.length / newPlayers.length);

    newPlayers.forEach((p, idx) => {
        const start = idx * handSize;
        const end = start + handSize;
        p.hand = cards.slice(start, end);
    });

    const pot = cards.slice(newPlayers.length * handSize);

    return {
        players: newPlayers,
        pot,
        turnPlayerId: newPlayers[0].id,
        warMode: false,
        lastRound: null,
        winner: null,
        status: 'active'
    };
}

/**
 * Handle player concession/surrender
 */
export function concedePlayer(gameState, playerId) {
    let state = { ...gameState };
    const playerIndex = state.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) return state;

    const player = { ...state.players[playerIndex] };

    // Add hand to pot so remaining players can fight for them
    state.pot = [...state.pot, ...player.hand];
    player.hand = [];
    player.eliminated = true;

    // Update player in array
    state.players = [...state.players];
    state.players[playerIndex] = player;

    // Check Game Over
    const remaining = state.players.filter(p => !p.eliminated);
    if (remaining.length === 1) {
        state.winner = remaining[0];
        state.status = 'completed';
    }

    // Pass turn if needed
    if (state.turnPlayerId === playerId && state.status !== 'completed') {
        state.turnPlayerId = remaining[0]?.id;
    }

    return state;
}
