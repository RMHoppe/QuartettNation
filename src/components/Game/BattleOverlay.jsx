import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../Card/Card';
import './BattleOverlay.css';

const BattleOverlay = ({ roundData, myPlayerId, onComplete }) => {
    // History fallback for backward compatibility
    const history = roundData.warHistory || [roundData];

    // We track which round of the war we are currently displaying
    const [roundIdx, setRoundIdx] = useState(0);
    const [step, setStep] = useState('enter'); // enter, reveal, compare, exit
    const [showWarBanner, setShowWarBanner] = useState(false);

    // reset if roundData changes strictly (new battle entirely)
    useEffect(() => {
        setRoundIdx(0);
        setStep('enter');
        setShowWarBanner(false);
    }, [roundData]);

    // Sequence controller
    useEffect(() => {
        console.log("BattleOverlay: Sequence starting for history length:", history.length);

        let mounted = true;

        const runSequence = async () => {
            // Loop through each round in the history
            for (let i = 0; i < history.length; i++) {
                if (!mounted) return;

                // 0. Setup State for this round
                setRoundIdx(i);
                setStep('enter');
                setShowWarBanner(false);

                // 1. Enter (cards slide in)
                await new Promise(r => setTimeout(r, 1000));
                if (!mounted) return;

                // 2. Reveal (flip opponent cards)
                setStep('reveal');
                await new Promise(r => setTimeout(r, 1500));
                if (!mounted) return;

                // 3. Compare (highlight winner or tie)
                setStep('compare');
                await new Promise(r => setTimeout(r, 2000));
                if (!mounted) return;

                const isLast = i === history.length - 1;

                if (!isLast) {
                    // It's a Tie/War step
                    setShowWarBanner(true);
                    await new Promise(r => setTimeout(r, 1500));
                    if (!mounted) return;

                    // Transition to next round - clear cards briefly
                    setStep('exit'); // Optional: fade out
                    await new Promise(r => setTimeout(r, 500));
                } else {
                    // Final Winner
                    // Just wait a bit more to bask in glory
                    await new Promise(r => setTimeout(r, 1500));
                }
            }

            if (!mounted) return;
            // 4. Final Exit
            setStep('exit');
            await new Promise(r => setTimeout(r, 500));
            onComplete && onComplete();
        };

        runSequence();

        return () => { mounted = false; };
    }, [roundData]); // Re-run if roundData changes (new battle)

    if (!roundData) return null;

    const currentRound = history[roundIdx];
    if (!currentRound || !currentRound.cardsPlayed) return null;

    const winnerId = currentRound.winner; // This round's winner (null if tie)
    const categoryName = roundData.category; // Category stays same
    const finalWinnerName = roundData.winnerName; // Game/Battle winner (for final display)

    return (
        <motion.div
            className="battle-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="battle-category">
                Competition: <span>{categoryName}</span>
                {history.length > 1 && <div style={{ fontSize: '0.6em', opacity: 0.8 }}>Round {roundIdx + 1} / {history.length}</div>}
            </div>

            {/* We key the arena by roundIdx so framer motion treats it as new elements entering/leaving each round */}
            <AnimatePresence mode='wait'>
                {step !== 'exit' && (
                    <div key={`arena-${roundIdx}`} className="battle-arena">
                        {currentRound.cardsPlayed.map((play, index) => {
                            if (!play || !play.card) return null;

                            const isMe = play.playerId === myPlayerId;
                            const isRoundWinner = play.playerId === winnerId;
                            // In a tie round, nobody is "winner" usually, or multiple are? 
                            // Our logic sets winner=null for ties.
                            const isFaceDown = !isMe && step === 'enter';

                            const displayValue = play.value ?? (play.card.values?.[categoryName] ?? play.card.attributes?.[categoryName] ?? '-');

                            return (
                                <div key={play.playerId} className={`battle-card-slot ${isRoundWinner && step === 'compare' ? 'winner' : ''}`}>
                                    <div className="player-label">{play.playerName}</div>

                                    <motion.div
                                        initial={{ y: 50, opacity: 0 }}
                                        animate={{
                                            y: 0,
                                            opacity: 1,
                                            scale: isRoundWinner && step === 'compare' ? 1.1 : 1,
                                            filter: (!isRoundWinner && winnerId && step === 'compare') ? 'grayscale(0.8) blur(1px)' : 'none'
                                        }}
                                        exit={{ y: -50, opacity: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="battle-card-wrapper"
                                    >
                                        <Card
                                            card={play.card}
                                            categories={[{ name: categoryName }]}
                                            deckName={null}
                                            flipped={isFaceDown}
                                            enableFlip={false} // Disable click interaction
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
                                    </motion.div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </AnimatePresence>

            {/* War Banner / Winner Banner */}
            <AnimatePresence>
                {step === 'compare' && showWarBanner && (
                    <motion.div
                        key="war-banner"
                        className="winner-banner war-banner"
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, opacity: 0 }}
                    >
                        WAR!
                        <div style={{ fontSize: '0.4em' }}>Tie - Next Cards!</div>
                    </motion.div>
                )}

                {step === 'compare' && !showWarBanner && roundIdx === history.length - 1 && (
                    <motion.div
                        key="winner-banner"
                        className="winner-banner"
                        initial={{ scale: 0, rotate: -10 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, opacity: 0 }}
                    >
                        {finalWinnerName ? `${finalWinnerName} Wins!` : 'DRAW!'}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default BattleOverlay;
