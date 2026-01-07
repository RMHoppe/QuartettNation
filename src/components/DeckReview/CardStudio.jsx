import React, { useState, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useGesture } from '@use-gesture/react'
import { searchImages } from '../../services/wikimedia'
import { searchOpenverseImages } from '../../services/openverse'
import { Button, Spinner, Input } from '../../ui'
import './CardStudio.css'

const CardStudio = ({ deck, updateDeck, onSave, currentIndex = 0, onNavigate, isModal = false }) => {
    // Image Editing State
    const [position, setPosition] = useState({ x: 0, y: 0, scale: 1 })
    const [customUrl, setCustomUrl] = useState('')
    const [source, setSource] = useState('wikimedia') // 'wikimedia' | 'openverse'

    // Local Editing State
    const [localCard, setLocalCard] = useState({ ...deck.cards[currentIndex] });
    const [hasChanges, setHasChanges] = useState(false);

    const imageRef = useRef(null)
    const wrapperRef = useRef(null)

    const prevIndexRef = useRef(currentIndex);

    // Sync local state when card index changes (navigation)
    useEffect(() => {
        const indexChanged = prevIndexRef.current !== currentIndex;

        if (indexChanged) {
            setLocalCard({ ...deck.cards[currentIndex] });
            setHasChanges(false);

            if (deck.cards[currentIndex].image_settings) {
                setPosition(deck.cards[currentIndex].image_settings);
            } else {
                setPosition({ x: 0, y: 0, scale: 1 });
            }
            prevIndexRef.current = currentIndex;
        } else if (!hasChanges) {
            setLocalCard(prev => ({ ...deck.cards[currentIndex] }));
        }
    }, [currentIndex, deck.cards, hasChanges]);

    // -- React Query for Images --
    const { data: alternatives = [], isLoading: isLoadingAlts } = useQuery({
        queryKey: ['images', source, deck.cards[currentIndex].name],
        queryFn: async () => {
            const card = deck.cards[currentIndex];
            // Prefer existing cache on card if available AND matching source logic
            // (Simplification: just search, react-query handles its own cache)
            if (source === 'wikimedia') return searchImages(card.name, 20);
            if (source === 'openverse') return searchOpenverseImages(card.name, 20);
            return [];
        },
        staleTime: 1000 * 60 * 60, // 1 hour
        refetchOnWindowFocus: false
    });

    // -- Use Gesture for Interaction --
    // We bind gesture events to the wrapper
    const bind = useGesture({
        onDrag: ({ offset: [dx, dy] }) => {
            setPosition(prev => ({ ...prev, x: dx, y: dy }))
            setHasChanges(true)
        },
        onWheel: ({ event, delta: [, dy] }) => {
            event.preventDefault(); // Prevent page scroll
            const delta = dy * -0.001;
            setPosition(prev => {
                const newScale = Math.min(Math.max(0.5, prev.scale + delta), 3)
                return { ...prev, scale: newScale }
            })
            setHasChanges(true)
        }
    }, {
        drag: {
            from: () => [position.x, position.y], // Sync with current state
            filterTaps: true
        },
        wheel: {
            domTarget: wrapperRef, // Important for non-passive listener
            eventOptions: { passive: false }
        }
    })

    // -- State Updates --
    const selectAlternative = (img) => {
        setLocalCard(prev => ({
            ...prev,
            image_url: img.url,
            attribution_text: img.attribution
        }));
        // Reset crop visually and tracking
        setPosition({ x: 0, y: 0, scale: 1 });
        setHasChanges(true);
    }

    const handleStatChange = (catName, newValue) => {
        setLocalCard(prev => {
            const newValues = { ...prev.values, [catName]: newValue };
            return { ...prev, values: newValues };
        });
        setHasChanges(true);
    }

    const handleSave = () => {
        const updatedCards = [...deck.cards];
        updatedCards[currentIndex] = {
            ...localCard,
            image_settings: { ...position }
        };
        updateDeck({ cards: updatedCards });
        setHasChanges(false);
    };

    const handleNext = () => {
        if (currentIndex < deck.cards.length - 1) {
            onNavigate(currentIndex + 1);
        } else {
            onSave()
        }
    }

    const handlePrev = () => {
        if (currentIndex > 0) {
            onNavigate(currentIndex - 1);
        }
    }

    // Attach passive: false properly for wheel via config above, 
    // but react-use-gesture specific behavior usually needs the ref attached.

    return (
        <div className="card-studio">
            <div className="studio-header">
                <p className="studio-hint">Drag image to position. Click values to edit.</p>
            </div>

            {/* Main Stage: In-Place Editing "Card" */}
            <div className="studio-stage">
                <div className="studio-card-frame card-scene">
                    <div className="card-inner">
                        <div className="card-face card-front" style={{ position: 'relative' }}>
                            {/* 1. Top Section */}
                            <div className="card-top-section">
                                {deck.theme && <div className="deck-name">{deck.theme}</div>}
                                <h3 className="card-name">{localCard.name}</h3>
                            </div>

                            {/* 2. Image Area (Interactive) */}
                            <div
                                ref={wrapperRef}
                                className="card-image-wrapper studio-interactive-image"
                                {...bind()} // Spread gesture handlers
                                style={{
                                    touchAction: 'none', // Critical for dragging on touch/mobile
                                    cursor: 'grab'
                                }}
                            >
                                <img
                                    ref={imageRef}
                                    src={localCard.image_url}
                                    alt="Card Subject"
                                    className="card-image"
                                    style={{
                                        transform: `translate(${position.x}px, ${position.y}px) scale(${position.scale})`,
                                        transformOrigin: 'center',
                                        pointerEvents: 'none'
                                    }}
                                    draggable={false}
                                />
                                <div className="card-attribution">
                                    {localCard.attribution_text || 'Public Domain'}
                                </div>
                            </div>

                            {/* 3. Stats Area */}
                            <div className="card-content">
                                <div className="card-stats">
                                    {deck.categories.map((cat, idx) => {
                                        let label = cat.name;
                                        let unit = cat.unit;
                                        if (!unit) {
                                            const match = cat.name.match(/^(.+?)\s*\[(.*?)\]$/);
                                            if (match) {
                                                label = match[1].trim();
                                                unit = match[2].trim();
                                            }
                                        }

                                        const val = localCard.values ? localCard.values[cat.name] : '';

                                        return (
                                            <div key={idx} className="stat-row">
                                                <span className="stat-label">{label}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                    <input
                                                        className="studio-stat-input"
                                                        value={val}
                                                        onChange={(e) => handleStatChange(cat.name, e.target.value)}
                                                        onKeyDown={(e) => e.stopPropagation()}
                                                    />
                                                    {unit && <span className="stat-unit">{unit}</span>}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Controls Below */}
            <div className="studio-controls">
                <div className="alternatives-strip">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <h4>Alternatives</h4>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <select
                                value={source}
                                onChange={(e) => setSource(e.target.value)}
                                style={{ background: 'var(--surface-alt)', border: '1px solid var(--glass-border)', color: 'var(--text)', padding: '4px', borderRadius: '4px' }}
                            >
                                <option value="wikimedia">Wikimedia (Commons)</option>
                                <option value="openverse">Openverse (Creative Commons)</option>
                            </select>
                        </div>
                    </div>

                    <div className="thumbnails">
                        {isLoadingAlts ? <Spinner size="sm" /> :
                            alternatives.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img.url}
                                    className={localCard.image_url === img.url ? 'active' : ''}
                                    onClick={() => selectAlternative(img)}
                                    alt="alt"
                                />
                            ))
                        }
                    </div>
                </div>

                <div className="custom-url-section" style={{ marginTop: '8px' }}>
                    <Input
                        placeholder="Custom Image URL... (Enter to apply)"
                        value={customUrl}
                        onChange={(e) => setCustomUrl(e.target.value)}
                        onBlur={() => {
                            if (customUrl) {
                                selectAlternative({ url: customUrl, attribution: 'Custom URL' });
                                setCustomUrl('');
                            }
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && customUrl) {
                                selectAlternative({ url: customUrl, attribution: 'Custom URL' });
                                setCustomUrl('');
                            }
                        }}
                        fullWidth
                    />
                </div>
            </div>

            <div className="studio-nav">
                <Button
                    onClick={handlePrev}
                    disabled={currentIndex === 0 || hasChanges}
                    variant="secondary"
                >
                    ← Previous
                </Button>
                <Button
                    onClick={handleSave}
                    variant="primary"
                    disabled={!hasChanges}
                >
                    Save Changes
                </Button>
                <Button
                    onClick={handleNext}
                    disabled={currentIndex === deck.cards.length - 1 && !isModal || hasChanges}
                    variant="secondary"
                >
                    {isModal && currentIndex === deck.cards.length - 1 ? 'Done' : (currentIndex === deck.cards.length - 1 ? 'Finish' : 'Next →')}
                </Button>
            </div>
        </div>
    )
}

export default CardStudio
