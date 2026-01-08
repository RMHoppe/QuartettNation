import React from 'react'
import { Button, Input } from '../../ui'

const CategoryReview = ({ deck, updateDeck, onNext }) => {
    const categories = deck.categories || []

    const handleCategoryChange = (index, field, value) => {
        const updated = [...categories]
        updated[index] = { ...updated[index], [field]: value }
        updateDeck({ categories: updated })
    }

    const toggleHigherWins = (index) => {
        const updated = [...categories]
        updated[index] = { ...updated[index], higherWins: !updated[index].higherWins }
        updateDeck({ categories: updated })
    }

    return (
        <div className="category-review">
            <p style={{ color: 'var(--text-light)', opacity: 0.7, marginBottom: '1rem', fontSize: '0.9rem' }}>
                Verify the categories. Click "High" to toggle if a higher value wins.
            </p>

            <div className="modern-list">
                {categories.map((cat, idx) => (
                    <div key={idx} className="modern-list-item">
                        <div className="category-inputs">
                            <Input
                                value={cat.name}
                                onChange={(e) => handleCategoryChange(idx, 'name', e.target.value)}
                                placeholder="Name"
                                fullWidth
                                className="category-input-override"
                            />
                        </div>
                        <Button
                            variant={cat.higherWins ? 'primary' : 'secondary'}
                            size="sm"
                            onClick={() => toggleHigherWins(idx)}
                            className="toggle-btn-override"
                        >
                            {cat.higherWins ? 'High Wins' : 'Low Wins'}
                        </Button>
                    </div>
                ))}
            </div>

            <div className="review-actions">
                <Button variant="primary" onClick={onNext}>Next: Card Names</Button>
            </div>
        </div>
    )
}

export default CategoryReview
