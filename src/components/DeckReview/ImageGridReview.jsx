import React, { useState, useEffect } from 'react'
import ImageStudio from './ImageStudio'
import './ImageGridReview.css'
import { searchImages } from '../../services/wikimedia'
import { Button, Modal, Spinner } from '../../ui'

// Single card component with lazy image loading
const LazyCard = ({ card, index, onClick, onImageLoaded }) => {
    // Track if we are currently fetching to prevent duplicate requests
    const fetching = React.useRef(false)
    // Keep onImageLoaded fresh without triggering effect
    const onLoadedRef = React.useRef(onImageLoaded)

    useEffect(() => {
        onLoadedRef.current = onImageLoaded
    }, [onImageLoaded])

    useEffect(() => {
        // If we already have an image, do nothing
        if (card.image_url) return

        // If we are already fetching, do nothing
        if (fetching.current) return

        // Fetch using the card name
        if (card.name) {
            fetching.current = true

            searchImages(card.name, 1) // Limit 1 is enough for initial load
                .then(images => {
                    if (images.length > 0) {
                        // Update parent with image data
                        onLoadedRef.current(index, {
                            image_url: images[0].url,
                            attribution_text: images[0].attribution,
                            available_images: images
                        })
                    }
                })
                .catch(err => console.error('Image fetch error:', err))
                .finally(() => {
                    fetching.current = false
                })
        }
    }, [card.image_url, card.name]) // Stable dependencies only

    const hasImage = !!card.image_url

    return (
        <div className="grid-card-item" onClick={() => onClick(index)}>
            <div className={`img-wrapper ${!hasImage ? 'loading' : ''}`}>
                {!hasImage ? (
                    <div className="loading-placeholder">
                        <Spinner size="sm" />
                    </div>
                ) : (
                    <img src={card.image_url} alt={card.name} loading="lazy" />
                )}
            </div>
            <span className="card-name">{card.name}</span>
        </div>
    )
}

const ImageGridReview = ({ deck, updateDeck, onSave }) => {
    const [selectedCardIndex, setSelectedCardIndex] = useState(null)

    const handleCardClick = (index) => {
        setSelectedCardIndex(index)
    }

    // Update a single card when image is lazy-loaded
    const handleImageLoaded = (index, imageData) => {
        const updatedCards = [...deck.cards]
        updatedCards[index] = { ...updatedCards[index], ...imageData }
        updateDeck({ cards: updatedCards })
    }

    const handleStudioSave = () => {
        setSelectedCardIndex(null)
    }

    // If a card is selected, show the Studio Mode
    // We render Modal conditionally to keep clean hierarchy
    return (
        <>
            <Modal
                open={selectedCardIndex !== null}
                onClose={() => setSelectedCardIndex(null)}
                title="Edit Card Image"
            >
                {selectedCardIndex !== null && (
                    <ImageStudio
                        deck={deck}
                        startAtIndex={selectedCardIndex}
                        updateDeck={updateDeck}
                        onSave={handleStudioSave}
                        isModal={true}
                    />
                )}
            </Modal>

            <div className="image-grid-review">
                <p className="hint-text">Tap any card to adjust its image. Click 'Finish Deck' when done.</p>

                <div className="modern-grid dense">
                    {deck.cards.map((card, idx) => (
                        <LazyCard
                            key={idx}
                            card={card}
                            index={idx}
                            onClick={handleCardClick}
                            onImageLoaded={handleImageLoaded}
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

export default ImageGridReview
