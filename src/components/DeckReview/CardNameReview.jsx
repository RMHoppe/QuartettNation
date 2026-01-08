import React from 'react'
import { Button, Input } from '../../ui'

const CardNameReview = ({ deck, updateDeck, onNext }) => {
    const cards = deck.cards || []

    const handleNameChange = (index, newName) => {
        const updatedCards = [...cards]
        updatedCards[index] = { ...updatedCards[index], name: newName }
        updateDeck({ cards: updatedCards })
    }

    return (
        <div className="card-name-review">
            <p style={{ color: 'var(--text-light)', opacity: 0.7, marginBottom: '1rem', fontSize: '0.9rem' }}>
                Review all 32 card names. Click on any name to edit it.
            </p>

            <div className="modern-list">
                {cards.map((card, idx) => (
                    <div key={idx} className="modern-list-item">
                        <span className="index" style={{ color: 'var(--text-ink)', opacity: 0.7, minWidth: '30px', fontSize: '0.8rem' }}>#{idx + 1}</span>
                        <Input
                            value={card.name}
                            onChange={(e) => handleNameChange(idx, e.target.value)}
                            fullWidth
                            className="card-name-input-override"
                        />
                    </div>
                ))}
            </div>

            <div className="review-actions">
                <Button variant="primary" onClick={onNext}>Next: Images</Button>
            </div>
        </div>
    )
}

export default CardNameReview
