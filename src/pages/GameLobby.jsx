import React from 'react';
import { Button } from '../ui';
import './GameLobby.css';

const GameLobby = ({ matchId, players, isHost, onStart }) => {
    const [copyState, setCopyState] = React.useState('Copy Link');

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopyState('Copied!');
            setTimeout(() => setCopyState('Copy Link'), 2000);
        } catch (err) {
            console.error('Failed to copy class', err);
            // Fallback
            const textArea = document.createElement("textarea");
            textArea.value = window.location.href;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand("Copy");
            textArea.remove();
            setCopyState('Copied!');
            setTimeout(() => setCopyState('Copy Link'), 2000);
        }
    };

    return (
        <div className="page-view app-card centered lobby-card">
            <div className="lobby-header lobby-header-reset">
                {/* Title moved to app header */}
                <p className="lobby-subtitle lobby-subtitle-reset">Waiting for players to join...</p>
                <div className="match-id-container">
                    <span className="match-code-label">LINK:</span>
                    <code className="match-code">{window.location.href}</code>
                    <Button variant="secondary" size="sm" onClick={copyLink}>{copyState}</Button>
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
                                    <div className="player-avatar player-avatar-placeholder">?</div>
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
