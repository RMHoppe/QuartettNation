import React from 'react'
import CardBack from './CardBack'
import './Card.css'

const Card = ({ card, categories, compact = false, onCategorySelect, isSelectable = false, deckName, faceDown = false }) => {
    if (faceDown) return <div className={`card-container ${compact ? 'compact' : ''}`}><CardBack /></div>
    if (!card) return null

    return (
        <div className={`card-container ${compact ? 'compact' : ''}`}>
            <div className="card-top-section">
                {deckName && <div className="deck-name">{deckName}</div>}
                <h3 className="card-name">{card.name}</h3>
            </div>

            <div className="card-image-wrapper">
                <img
                    src={card.image_url || 'https://via.placeholder.com/512?text=No+Image'}
                    alt={card.name}
                    className="card-image"
                    style={card.image_settings ? {
                        transform: `scale(${card.image_settings.scale}) translate(${card.image_settings.x / card.image_settings.scale}px, ${card.image_settings.y / card.image_settings.scale}px)`,
                        transformOrigin: 'center',
                        // We need to ensure object-fit doesn't fight us, usually cover is fine but we are transforming the element itself.
                        // However, transforming an object-fit: cover element can be tricky.
                        // Better approach: object-fit: cover + transform usually crops "more".
                        // Let's rely on the studio matching the card's visual.
                        // NOTE: Studio uses translate(x,y) then scale(s). CSS transform order matters.
                        // Studio: transform: `translate(${position.x}px, ${position.y}px) scale(${position.scale})`
                        // So we should match that exactly.
                        transform: `translate(${card.image_settings.x}px, ${card.image_settings.y}px) scale(${card.image_settings.scale})`
                    } : {}}
                />
                <div className="card-attribution">
                    {card.attribution_text || 'Public Domain'}
                </div>
            </div>

            <div className="card-content">
                <div className="card-stats">
                    {categories.map((cat, idx) => {
                        // Parse "Name [Unit]" -> label="Name", unit="Unit"
                        // Or utilize existing cat.unit if present (legacy support)
                        let label = cat.name;
                        let unit = cat.unit;

                        if (!unit) {
                            const match = cat.name.match(/^(.+?)\s*\[(.*?)\]$/);
                            if (match) {
                                label = match[1].trim();
                                unit = match[2].trim();
                            }
                        }

                        // Also handle value access using the FULL category name as key, 
                        // because that's how it's stored in the DB/object now.
                        const value = card.values ? card.values[cat.name] : (card.attributes ? card.attributes[cat.name] : '-');

                        return (
                            <div
                                key={idx}
                                className={`stat-row ${isSelectable ? 'selectable' : ''}`}
                                onClick={() => isSelectable && onCategorySelect && onCategorySelect(cat.name)}
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
        </div>
    )
}

export default Card
