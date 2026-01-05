import React from 'react';
import { Button } from '../ui';
import './GameLobby.css';

const GameLobby = ({ matchId, players, isHost, onStart }) => {
    const copyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
    };

    return (
        <div className="app-card">
            <div className="lobby-header" style={{ paddingTop: 0 }}>
                {/* Title moved to app header */}
                <p className="lobby-subtitle" style={{ marginTop: 0 }}>Waiting for players to join...</p>
                <div className="match-id-container">
                    <code className="match-code">{matchId}</code>
                    <Button variant="secondary" size="sm" onClick={copyLink}>Copy Link</Button>
                </div>
            </div>

            <div className="modern-grid">
                {[0, 1, 2, 3].map(idx => {
                    const player = players[idx];
                    return (
                        <div key={idx} className={`player-slot ${player ? 'occupied' : 'empty'}`}>
                            {player ? (
                                <>
                                    <div className="player-avatar">👤</div>
                                    <div className="player-name">{player.name}</div>
                                    <div className="player-label">Player {idx + 1}</div>
                                </>
                            ) : (
                                <>
                                    <div className="player-avatar" style={{ opacity: 0.3 }}>?</div>
                                    <div className="open-slot-text">Slot Open</div>
                                    <div className="player-label">Player {idx + 1}</div>
                                </>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="lobby-footer">
                {isHost ? (
                    <Button
                        variant="primary"
                        size="lg"
                        className="btn-glow" // optional extra effect
                        disabled={players.length < 2}
                        onClick={onStart}
                    >
                        {players.length < 2 ? 'Waiting for players...' : 'Start Game'}
                    </Button>
                ) : (
                    <div className="waiting-pulse">
                        Waiting for host to start the game...
                    </div>
                )}
            </div>
        </div>
    );
};

export default GameLobby;
