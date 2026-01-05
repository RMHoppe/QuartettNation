import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { createGame, joinGame, subscribeToGame, updateGameState } from '../services/game';
import { getDeckById } from '../services/decks';

export function useGame(gameId) {
    const [gameState, setGameState] = useState(null);
    const [status, setStatus] = useState('loading'); // loading, lobby, active, completed
    const [playerId, setPlayerId] = useState(sessionStorage.getItem('qn_player_id'));
    const [error, setError] = useState(null);
    const [deckData, setDeckData] = useState(null);

    // Derived state
    const isHost = gameState?.players?.[0]?.id === playerId;
    const myPlayer = gameState?.players?.find(p => p.id === playerId);
    const isMyTurn = gameState?.turnPlayerId === playerId;
    const isWar = gameState?.warMode;

    // Persist player ID
    useEffect(() => {
        if (!playerId) {
            const newId = crypto.randomUUID();
            console.log(`[useGame] Generated new Player ID: ${newId}`);
            sessionStorage.setItem('qn_player_id', newId);
            setPlayerId(newId);
        } else {
            console.log(`[useGame] Using existing Player ID: ${playerId}`);
        }
    }, []);

    // Initial Load & Subscription
    useEffect(() => {
        if (!gameId) return;

        const loadGame = async () => {
            const { data, error } = await supabase
                .from('games')
                .select('*')
                .eq('id', gameId)
                .single();

            if (error) {
                setError(error.message);
                return;
            }

            setGameState(data.game_state);
            setStatus(data.status);

            // If I am the host, fetch the deck data for gameplay logic
            if (data.host_deck_id) {
                // Optimization: Only host strictly *needs* this for logic, but client needs image URLs
                // So everyone fetches it.
                const deck = await getDeckById(data.host_deck_id);
                setDeckData(deck);
            }
        };

        loadGame();

        const unsubscribe = subscribeToGame(gameId, (payload) => {
            console.log(`[useGame] Received Update:`, payload);
            // payload.new is the new row data on UPDATE/INSERT
            // If payload.eventType is DELETE, we might need to handle closing?
            if (payload.new) {
                setGameState(payload.new.game_state);
                setStatus(payload.new.status);
            }
        });

        return () => unsubscribe();
    }, [gameId]);


    // --- ACTIONS ---

    // --- ACTIONS ---

    const join = async (playerName) => {
        if (!gameId || !playerId) {
            console.error("[useGame] Join aborted: Missing gameId or playerId", { gameId, playerId });
            return;
        }

        console.log(`[useGame] Joining game ${gameId} with name ${playerName}`);

        // Check if already in
        if (gameState?.players?.find(p => p.id === playerId)) {
            console.warn(`[useGame] Player ${playerId} already in game`);
            return;
        }

        try {
            const currentPlayers = gameState?.players || [];
            console.log(`[useGame] Current players:`, currentPlayers);

            if (currentPlayers.length >= 4) throw new Error("Lobby Full");

            const newPlayer = {
                id: playerId,
                name: playerName,
                isHost: false,
                hand: [],
                cardsWon: []
            };

            const newState = {
                ...gameState,
                players: [...currentPlayers, newPlayer]
            };

            await updateGameState(gameId, newState);
            console.log(`[useGame] Join successful`);
        } catch (e) {
            console.error(`[useGame] Join Failed:`, e);
            setError(e.message);
        }
    };

    const start = async () => {
        if (!isHost || !deckData) return;

        const { initializeGame } = await import('../utils/gameLogic');
        const initialGameState = initializeGame(gameState.players, deckData.cards);

        const newState = {
            ...gameState,
            ...initialGameState
        };

        await updateGameState(gameId, newState, 'active');
    };

    const playTurn = async (categoryName) => {
        if (!isHost) return;

        // Import logic dynamic or static
        const { resolveRound } = await import('../utils/gameLogic');

        try {
            const newState = resolveRound(gameState, deckData, categoryName);

            // Check if game completed
            const status = newState.winner ? 'completed' : 'active';
            await updateGameState(gameId, newState, status);
        } catch (e) {
            console.error("Game Logic Error:", e);
        }
    };

    return {
        gameState,
        status,
        myPlayer,
        isHost,
        isMyTurn,
        players: gameState?.players || [],
        deck: deckData,
        actions: { join, start, playTurn },
        error
    };
}
