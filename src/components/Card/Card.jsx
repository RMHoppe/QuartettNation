import React from 'react'
import CardBack from './CardBack'
import './Card.css'

const Card = ({ card, categories, compact = false, onCategorySelect, isSelectable = false, deckName, faceDown = false, enableFlip = false, flipped = null }) => {
    const [internalFlipped, setInternalFlipped] = React.useState(false);

    // Controlled vs Uncontrolled logic
    const isFlipped = flipped !== null ? flipped : internalFlipped;

    // If strictly faceDown (static back), just show back.
    if (faceDown && !enableFlip && flipped === null) return <div className={`card-scene ${compact ? 'compact' : ''}`}><div className="card-face card-back" style={{ position: 'relative', transform: 'none' }}><CardBack /></div></div>;
    if (!card) return null;

    const handleFlip = () => {
        if (enableFlip && flipped === null) {
            setInternalFlipped(!internalFlipped);
        }
    };

    // The front content (originally the whole component)
    const CardFrontContent = (
        <>
            <div className="card-top-section">
                {deckName && <div className="deck-name">{deckName}</div>}
                <h3 className="card-name">{card.name}</h3>
            </div>

            <div className="card-image-wrapper">
                <img
                    src={card.image_url || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='512' height='512' viewBox='0 0 512 512'%3E%3Crect width='512' height='512' fill='%231f2937'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='48' fill='%236b7280' text-anchor='middle' dy='.3em'%3ENo Image%3C/text%3E%3C/svg%3E"}
                    alt={card.name}
                    className="card-image"
                    style={card.image_settings ? {
                        transform: `translate(${card.image_settings.x}px, ${card.image_settings.y}px) scale(${card.image_settings.scale})`,
                        transformOrigin: 'center'
                    } : {}}
                />
                <div className="card-attribution">
                    {card.attribution_text || 'Public Domain'}
                </div>
            </div>

            <div className="card-content">
                <div className="card-stats">
                    {categories.map((cat, idx) => {
                        let label = cat.name;
                        let unit = cat.unit;

                        if (!unit) {
                            const match = cat.name.match(/^(.+?)\s*\[(.*?)\]$/);
                            if (match) {
                                label = match[1].trim();
                                unit = match[2].trim();
                            }
                        }

                        const value = card.values ? card.values[cat.name] : (card.attributes ? card.attributes[cat.name] : '-');

                        return (
                            <div
                                key={idx}
                                className={`stat-row ${isSelectable ? 'selectable' : ''}`}
                                onClick={(e) => {
                                    if (isFlipped) return; // No interaction if flipped
                                    if (isSelectable && onCategorySelect) {
                                        e.stopPropagation(); // Don't flip if selecting category
                                        onCategorySelect(cat.name);
                                    }
                                }}
                            >
                                <span className="stat-label">{label}</span>
                                <span className="stat-value">
                                    {value}
                                    {unit && <span className="stat-unit"> {unit}</span>}
                                </span>
                            </div>
                        )
                    })}
                </div>
            </div>
        </>
    );

    return (
        <div
            className={`card-scene ${compact ? 'compact' : ''} ${enableFlip ? 'clickable' : ''}`}
            onClick={enableFlip ? handleFlip : undefined}
        >
            <div className={`card-inner ${isFlipped ? 'is-flipped' : ''}`}>
                <div className="card-face card-front">
                    {CardFrontContent}
                </div>
                <div className="card-face card-back">
                    <CardBack />
                </div>
            </div>
        </div>
    );
}

export default Card
