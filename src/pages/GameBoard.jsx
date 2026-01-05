import React, { useState, useEffect } from 'react';
import Card from '../components/Card/Card';
import { Button } from '../ui';
import { AnimatePresence } from 'framer-motion';
import BattleOverlay from '../components/Game/BattleOverlay';
import './GameBoard.css'; // We'll create this css next

const GameBoard = ({ matchId, gameState, myPlayer, deck, actions, isMyTurn }) => {

    if (!deck) return <div>Loading Deck Data...</div>;

    const currentCard = myPlayer.hand[0];
    const categories = deck.categories;

    const winner = gameState.winner;
    const isWar = gameState.warMode;
    const potSize = gameState.pot.length;
    const lastRound = gameState.lastRound;

    const [showBattle, setShowBattle] = useState(false);
    const prevRoundRef = React.useRef(null);

    useEffect(() => {
        // Trigger animation when lastRound updates (and is not null/empty)
        // We compare with refined ref to ensure we don't re-trigger on same round
        console.log("GameBoard: Checking lastRound update", { lastRound, prev: prevRoundRef.current });
        if (lastRound && lastRound !== prevRoundRef.current) {
            console.log("GameBoard: New round detected, triggering battle animation", lastRound);
            setShowBattle(true);
            prevRoundRef.current = lastRound;
        }
    }, [lastRound]);

    if (gameState.status === 'completed' && winner) {
        return (
            <div className="game-board-container game-over">
                <h1>Game Over!</h1>
                <h2>Winner: {winner.name}</h2>
                <Button variant="primary" onClick={() => window.location.href = '/'}>Back to Home</Button>
            </div>
        );
    }

    // If I am eliminated, we don't return early anymore.
    // Instead we obscure the controls.
    const isEliminated = myPlayer.eliminated;

    return (
        <div className="game-board-container">
            {/* Header Info */}
            <div className="game-header">
                <div className="turn-indicator">
                    {isMyTurn ? "YOUR TURN" : `${gameState.players.find(p => p.id === gameState.turnPlayerId)?.name}'s Turn`}
                </div>
                <div className="pot-indicator">
                    Pot: {potSize} cards {isWar && <span className="war-badge">WAR!</span>}
                </div>
            </div>

            {/* Battle Animation Overlay */}
            <AnimatePresence>
                {showBattle && lastRound && (
                    <BattleOverlay
                        roundData={lastRound}
                        myPlayerId={myPlayer.id}
                        onComplete={() => setShowBattle(false)}
                    />
                )}
            </AnimatePresence>

            {/* Header Info */}

            {/* Opponents Area */}
            <div className="opponents-strip">
                {gameState.players.filter(p => p.id !== myPlayer.id).map(p => (
                    <div key={p.id} className={`opponent-card ${p.id === gameState.turnPlayerId ? 'active-turn' : ''} ${p.eliminated ? 'eliminated-p' : ''}`}>
                        <div className="opponent-avatar">👤</div>
                        <div className="opponent-name">{p.name}</div>
                        <div className="opponent-hand-count">{p.hand.length} cards</div>
                    </div>
                ))}
            </div>

            {/* Main Play Area */}
            <div className="main-play-area">
                {/* My Card */}
                <div className="my-card-section">
                    {currentCard ? (
                        <Card
                            card={currentCard}
                            categories={categories || []}
                            isSelectable={isMyTurn && !winner}
                            onCategorySelect={actions.playTurn}
                            deckName={deck.name}
                        />
                    ) : (
                        <div className="empty-card-slot">Empty Hand</div>
                    )}
                </div>

                {/* Controls */}
                <div className="controls-section">

                    {isEliminated && (
                        <div className="eliminated-message">
                            <h3>You have been eliminated</h3>
                            <p>Spectating the game...</p>
                        </div>
                    )}

                    {!isEliminated && isMyTurn && !winner && (
                        <div className="text-center text-primary mt-4 animate-pulse">
                            &uarr; Select a category on the card above &uarr;
                        </div>
                    )}

                    {!isEliminated && !isMyTurn && (
                        <div className="waiting-message">
                            Waiting for opponent...
                        </div>
                    )}

                    {!isEliminated && isWar && isMyTurn && (
                        <div className="war-alert">
                            <h3>WAR!</h3>
                            <p>Tie detected. Select category to break tie (must be same usually, but you have choice).</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GameBoard;
