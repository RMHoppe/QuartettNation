import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../Card/Card';
import './BattleOverlay.css';

const BattleOverlay = ({ roundData, myPlayerId, onComplete }) => {
    console.log("BattleOverlay mounted. RoundData:", roundData);

    const [step, setStep] = useState('enter'); // enter, reveal, compare, exit

    useEffect(() => {
        console.log("BattleOverlay: Sequence starting");
        // Sequence the animation steps
        const sequence = async () => {
            // 1. Enter (cards slide in) - handled by initial render
            await new Promise(r => setTimeout(r, 1000));

            // 2. Reveal (flip opponent cards)
            console.log("BattleOverlay: Stepping to REVEAL");
            setStep('reveal');
            await new Promise(r => setTimeout(r, 1500));

            // 3. Compare (highlight winner)
            console.log("BattleOverlay: Stepping to COMPARE");
            setStep('compare');
            await new Promise(r => setTimeout(r, 2000));

            // 4. Exit
            console.log("BattleOverlay: Stepping to EXIT");
            setStep('exit');
            await new Promise(r => setTimeout(r, 500));
            onComplete && onComplete();
        };

        sequence();
    }, []);

    if (!roundData || !roundData.cardsPlayed) {
        console.error("BattleOverlay: Missing roundsData or cardsPlayed", roundData);
        return null;
    }

    // Helper to find the card played by a specific player
    const getCardForPlayer = (playerId) => {
        const played = roundData.cardsPlayed.find(cp => cp.playerId === playerId);
        return played ? played.card : null;
    };

    const winnerId = roundData.winner;
    const categoryName = roundData.category;
    const myCardInfo = roundData.cardsPlayed.find(cp => cp.playerId === myPlayerId);

    // We only show My Card vs The Winner (or if I am winner, vs the best loser?)
    // For simplicity in multiplayer, let's show ALL cards played in a row/grid.

    return (
        <motion.div
            className="battle-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="battle-category">
                Competition: <span>{categoryName}</span>
            </div>

            <div className="battle-arena">
                {roundData.cardsPlayed.map((play, index) => {
                    if (!play || !play.card) {
                        console.warn("BattleOverlay: Invalid play object", play);
                        return null;
                    }

                    const isMe = play.playerId === myPlayerId;
                    const isWinner = play.playerId === winnerId;
                    const isFaceDown = !isMe && step === 'enter'; // Opponents face down initially

                    const displayValue = play.card.values?.[categoryName] ?? play.card.attributes?.[categoryName] ?? '-';

                    return (
                        <div key={play.playerId} className={`battle-card-slot ${isWinner && step === 'compare' ? 'winner' : ''}`}>
                            <div className="player-label">{play.playerName}</div>

                            <motion.div
                                initial={{ y: 100, opacity: 0 }}
                                animate={{
                                    y: 0,
                                    opacity: 1,
                                    scale: isWinner && step === 'compare' ? 1.1 : 1,
                                    filter: (!isWinner && step === 'compare') ? 'grayscale(0.8) blur(1px)' : 'none'
                                }}
                                transition={{ delay: index * 0.1 }}
                                className="battle-card-wrapper"
                            >
                                <div className={`flip-container ${!isFaceDown ? 'flipped' : ''}`}>
                                    <div className="flipper">
                                        <div className="front">
                                            <Card
                                                card={play.card}
                                                categories={[{ name: categoryName }]} /* Only show relevant category? Or all? Let's show all for context but highlight one */
                                                deckName={null}
                                            />
                                            {/* Highlight Overlay */}
                                            {step === 'compare' && (
                                                <motion.div
                                                    className="stat-highlight"
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                >
                                                    {displayValue}
                                                </motion.div>
                                            )}
                                        </div>
                                        <div className="back">
                                            <Card faceDown={true} />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    );
                })}
            </div>

            {step === 'compare' && (
                <motion.div
                    className={`winner-banner ${!roundData.winnerName ? 'war-banner' : ''}`}
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                >
                    {roundData.winnerName ? `${roundData.winnerName} Wins!` : 'WAR!'}
                    {!roundData.winnerName && <div style={{ fontSize: '0.4em' }}>Cards added to Pot</div>}
                </motion.div>
            )}
        </motion.div>
    );
};

export default BattleOverlay;
