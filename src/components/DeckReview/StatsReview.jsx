import React, { useState, useEffect } from 'react'
import CardStudio from './CardStudio'
import './StatsReview.css'
import Card from '../Card/Card'
import { Button, Modal } from '../../ui'
import { Pencil } from 'lucide-react'
import { searchImages } from '../../services/wikimedia'

// Lazily load image if missing, but render proper Card component
const ReviewCardItem = ({ card, index, onEdit, onImageLoaded, categories, deckName }) => {
    const fetching = React.useRef(false)

    // Auto-fetch image if missing
    useEffect(() => {
        if (card.image_url) return
        if (fetching.current) return
        if (!card.name) return

        fetching.current = true
        searchImages(card.name, 1)
            .then(images => {
                if (images.length > 0) {
                    onImageLoaded(index, {
                        image_url: images[0].url,
                        attribution_text: images[0].attribution
                    })
                }
            })
            .catch(console.error)
            .finally(() => fetching.current = false)
    }, [card.image_url, card.name])

    return (
        <div className="review-card-wrapper">
            <Card
                card={card}
                categories={categories}
                deckName={deckName}
                compact={false}
                enableFlip={true}
            />
            <Button
                className="card-edit-btn"
                aria-label="Edit Card"
                onClick={(e) => {
                    e.stopPropagation()
                    onEdit(index)
                }}
                variant="secondary"
                size="sm"
                style={{ position: 'absolute', top: 'var(--spacing-xs)', right: 'var(--spacing-xs)', zIndex: 10, padding: '4px', minHeight: 'unset' }}
            >
                <Pencil size={16} />
            </Button>
        </div>
    )
}

const StatsReview = ({ deck, updateDeck, updateCard, onSave }) => {
    const [selectedCardIndex, setSelectedCardIndex] = useState(null)

    const handleEditClick = (index) => {
        setSelectedCardIndex(index)
    }

    const handleImageLoaded = (index, imageData) => {
        updateCard(index, imageData)
    }

    const handleStudioSave = () => {
        setSelectedCardIndex(null)
    }

    return (
        <>
            <Modal
                open={selectedCardIndex !== null}
                onClose={() => setSelectedCardIndex(null)}
                title={selectedCardIndex !== null ? `Edit Card (${selectedCardIndex + 1}/${deck.cards.length})` : 'Edit Card'}
            >
                {selectedCardIndex !== null && (
                    <CardStudio
                        deck={deck}
                        currentIndex={selectedCardIndex}
                        onNavigate={setSelectedCardIndex}
                        updateDeck={updateDeck}
                        onSave={handleStudioSave}
                        isModal={true}
                    />
                )}
            </Modal>

            <div className="image-grid-review">
                <p className="hint-text">Review your cards. Click the pen icon to edit images or stats.</p>

                <div className="modern-list">
                    {deck.cards.map((card, idx) => (
                        <ReviewCardItem
                            key={idx}
                            card={card}
                            index={idx}
                            onEdit={handleEditClick}
                            onImageLoaded={handleImageLoaded}
                            categories={deck.categories}
                            deckName={deck.theme} // or deck.deckName
                        />
                    ))}
                </div>

                <div className="review-actions">
                    <Button variant="primary" onClick={onSave} fullWidth>
                        Finish Deck
                    </Button>
                </div>
            </div>
        </>
    )
}

export default StatsReview
