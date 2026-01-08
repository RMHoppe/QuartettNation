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



    // If I am eliminated, we don't return early anymore.
    // Instead we obscure the controls.
    const isEliminated = myPlayer.eliminated;

    // Only show Game Over if we are done AND not currently watching the final battle
    if (gameState.status === 'completed' && winner && !showBattle) {
        return (
            <div className="game-board-container game-over">
                <h1>Game Over!</h1>
                <h2>Winner: {winner.name}</h2>
                <Button variant="primary" onClick={() => window.location.href = '/'}>Back to Home</Button>
            </div>
        );
    }

    return (
        <div className="game-board-container">
            {/* Header Info */}
            {/* Header Info - Simplified */}
            <div className="game-header">
                {/* Game Status / Instructions moved here as requested */}
                <div className="game-status-block">
                    <div className="turn-indicator" style={{ fontSize: '1.2rem' }}>
                        {isMyTurn
                            ? <span className="text-primary animate-pulse">YOUR TURN: Select a category &darr;</span>
                            : <span>{gameState.players.find(p => p.id === gameState.turnPlayerId)?.name}'s Turn</span>
                        }
                    </div>
                    {isWar && <span className="war-badge">WAR!</span>}
                    {!isMyTurn && !isEliminated && !winner && (
                        <div className="waiting-message" style={{ marginTop: '0.5rem', fontSize: '0.9rem', opacity: 0.7 }}>
                            Waiting for opponent...
                        </div>
                    )}
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
            {/* Players Strip (All Players) */}
            {/* Players Strip moved to main-play-area */}

            {/* Main Play Area */}
            <div className="main-play-area">
                {/* My Stats removed (moved to strip) */}

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

                {/* Players Strip (moved below card) */}
                <div className="players-strip" style={{ marginBottom: 0 }}>
                    {gameState.players.map(p => {
                        const isMe = p.id === myPlayer.id;
                        const isTurn = p.id === gameState.turnPlayerId;
                        return (
                            <div key={p.id} className={`game-player-card ${isTurn ? 'active-turn' : ''} ${p.eliminated ? 'eliminated-p' : ''} ${isMe ? 'my-player-card' : ''}`}>
                                <div className="player-avatar">{isMe ? '👤' : '👤'}</div>
                                <div className="player-name">{p.name} {isMe && '(You)'}</div>
                                <div className="player-hand-count">{p.hand.length} cards</div>
                            </div>
                        );
                    })}
                </div>

                {/* Controls */}
                <div className="controls-section">

                    {/* Game Status Block moved to Header */}

                    {isEliminated && (
                        <div className="eliminated-message">
                            <h3>You have been eliminated</h3>
                            <p>Spectating the game...</p>
                        </div>
                    )}

                    {lastRound && !showBattle && (
                        <div className="review-battle-container" style={{ marginTop: '1rem', textAlign: 'center' }}>
                            <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setShowBattle(true)}
                            >
                                Review Last Battle
                            </Button>
                        </div>
                    )}

                    {!isEliminated && !winner && (
                        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={actions.concede}
                                style={{ color: 'var(--danger)', opacity: 0.7 }}
                            >
                                Surrender Game
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


export default GameBoard;
