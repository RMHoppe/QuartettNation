import React from 'react';
import Card from '../components/Card/Card';
import { Button } from '../ui';
import './GameBoard.css'; // We'll create this css next

const GameBoard = ({ matchId, gameState, myPlayer, deck, actions, isMyTurn }) => {

    if (!deck) return <div>Loading Deck Data...</div>;

    const currentCard = myPlayer.hand[0];
    const categories = deck.categories;

    const winner = gameState.winner;
    const isWar = gameState.warMode;
    const potSize = gameState.pot.length;
    const lastRound = gameState.lastRound;

    if (gameState.status === 'completed' && winner) {
        return (
            <div className="game-board-container game-over">
                <h1>Game Over!</h1>
                <h2>Winner: {winner.name}</h2>
                <Button variant="primary" onClick={() => window.location.href = '/'}>Back to Home</Button>
            </div>
        );
    }

    // If I am eliminated
    if (myPlayer.eliminated) {
        return (
            <div className="game-board-container eliminated">
                <h1>You have been eliminated!</h1>
                <p>Watching the rest of the game...</p>
                {/* We could show the active game view here in 'spectator' mode effectively 
                    by just rendering the board but locking inputs. 
                    For MVP, let's just show the board but with overlay.
                */}
            </div>
        );
    }

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

            {/* Last Round Preview (if active) */}
            {/* Ideally we show this for a few seconds. Since we rely on simple state, 
                we show it constantly until next move? Or maybe just a sidebar log.
                Let's make a simple overlay or section for "Last Hand".
            */}
            {lastRound && !isWar && (
                <div className="last-round-info">
                    Last Winner: {gameState.players.find(p => p.id === lastRound.winner)?.name} via {lastRound.category}
                </div>
            )}

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
                    {/* Hiding old buttons as requested
                    {isMyTurn && !winner && (
                        <div className="category-buttons"> ... </div>
                    )}
                    */}
                    {isMyTurn && !winner && (
                        <div className="text-center text-primary mt-4 animate-pulse">
                            &uarr; Select a category on the card above &uarr;
                        </div>
                    )}

                    {!isMyTurn && (
                        <div className="waiting-message">
                            Waiting for opponent...
                        </div>
                    )}

                    {isWar && isMyTurn && (
                        <div className="war-alert">
                            <h3>WAR!</h3>
                            <p>Tie detected. Select category to break tie (must be same usually, but you have choice).</p>
                            {/* Re-render buttons above */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default GameBoard;
