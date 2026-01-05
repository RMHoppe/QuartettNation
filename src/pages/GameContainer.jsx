import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useGame } from '../hooks/useGame';
import GameLobby from './GameLobby';
import GameBoard from './GameBoard';
import { Button } from '../ui';
import { useHeader } from '../contexts/HeaderContext';

const GameContainer = () => {
    const { id } = useParams();
    const { status, actions, gameState, myPlayer, isHost, players, deck, isMyTurn, error } = useGame(id);
    const [joinName, setJoinName] = useState('');
    const { setTitle, setBackTo } = useHeader();

    useEffect(() => {
        if (status === 'lobby') {
            setTitle('Game Lobby');
            setBackTo('/');
        } else if (status === 'active') {
            setTitle('Game Board');
            setBackTo('/'); // Or confirm leave?
        }
    }, [status, setTitle, setBackTo]);

    if (status === 'loading') {
        return <div className="p-8 text-center">Loading Game...</div>;
    }

    if (!gameState) {
        return <div className="p-8 text-center">Game Not Found</div>;
    }

    // Identify if user is logged in (part of players)
    if (!myPlayer) {
        return (
            <div className="page-view app-card centered">
                <h2>Join Game</h2>
                <div className="input-group" style={{ width: '100%', maxWidth: '300px' }}>
                    <input
                        type="text"
                        placeholder="Enter your name"
                        value={joinName}
                        onChange={e => setJoinName(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && joinName.trim() && actions.join(joinName)}
                    />
                </div>
                <Button
                    variant="primary"
                    disabled={!joinName.trim()}
                    onClick={() => actions.join(joinName)}
                    style={{ width: '100%', maxWidth: '300px' }}
                >
                    Join Lobby
                </Button>
            </div>
        );
    }

    if (status === 'lobby') {
        return <GameLobby matchId={id} players={players} isHost={isHost} onStart={actions.start} />;
    }

    if (status === 'active' || status === 'completed') {
        return (
            <GameBoard
                matchId={id}
                gameState={gameState}
                myPlayer={myPlayer}
                deck={deck}
                actions={actions}
                isMyTurn={isMyTurn}
            />
        );
    }

    return <div>Unknown Status: {status}</div>;
};

export default GameContainer;
