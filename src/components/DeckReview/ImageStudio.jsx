import React, { useState, useRef, useEffect } from 'react'
import { searchImages } from '../../services/wikimedia'
import { Button, Spinner, Input } from '../../ui'
import './ImageStudio.css'

const ImageStudio = ({ deck, updateDeck, onSave, startAtIndex = 0, isModal = false }) => {
    const [currentCardIndex, setCurrentCardIndex] = useState(startAtIndex)
    const [position, setPosition] = useState({ x: 0, y: 0, scale: 1 })
    const [isDragging, setIsDragging] = useState(false)
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
    const [alternatives, setAlternatives] = useState([])
    const [isLoadingAlts, setIsLoadingAlts] = useState(false)
    const [customUrl, setCustomUrl] = useState('')

    const currentCard = deck.cards[currentCardIndex]
    const imageRef = useRef(null)

    // Load alternatives when card changes
    useEffect(() => {
        const loadAlternatives = async () => {
            // Check if we have enough alternatives cached (e.g. at least 2)
            // If we only have 1 (from the initial lazy load), we should fetch more.
            if (currentCard.available_images && currentCard.available_images.length > 1) {
                setAlternatives(currentCard.available_images)
            } else {
                setIsLoadingAlts(true)
                // Fetch a larger set for alternatives (e.g. 20)
                // Use the card name directly as per new logic
                const images = await searchImages(currentCard.name, 20);
                setAlternatives(images)
                setIsLoadingAlts(false)

                // Cache them to avoid refetching
                const updatedCards = [...deck.cards]
                const card = updatedCards[currentCardIndex]
                card.available_images = images

                // If the current image url is not in the new list (or is different), 
                // we might want to keep the current one active, but we don't need to change it automatically.
                updateDeck({ cards: updatedCards })
            }
        }
        loadAlternatives()
        // Load saved settings or default
        if (currentCard.image_settings) {
            setPosition(currentCard.image_settings)
        } else {
            setPosition({ x: 0, y: 0, scale: 1 })
        }
    }, [currentCardIndex])

    const handlePointerDown = (e) => {
        setIsDragging(true)
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y })
        e.target.setPointerCapture(e.pointerId);
    }

    const handlePointerMove = (e) => {
        if (isDragging) {
            setPosition(prev => ({
                ...prev,
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            }))
        }
    }

    const handlePointerUp = (e) => {
        setIsDragging(false)
        e.target.releasePointerCapture(e.pointerId);
    }

    const handleWheel = (e) => {
        // Simple zoom
        const delta = e.deltaY * -0.001;
        const newScale = Math.min(Math.max(0.5, position.scale + delta), 3);
        setPosition(prev => ({ ...prev, scale: newScale }));
    }

    // Helper to save current crop settings to the deck state
    const saveCropSettings = () => {
        const updatedCards = [...deck.cards]
        updatedCards[currentCardIndex].image_settings = { ...position }
        updateDeck({ cards: updatedCards })
    }

    const selectAlternative = (img) => {
        const updatedCards = [...deck.cards]
        updatedCards[currentCardIndex].image_url = img.url
        updatedCards[currentCardIndex].attribution_text = img.attribution
        // Reset crop when changing image
        updatedCards[currentCardIndex].image_settings = { x: 0, y: 0, scale: 1 }
        updateDeck({ cards: updatedCards })
        setPosition({ x: 0, y: 0, scale: 1 })
    }

    const handleNext = () => {
        saveCropSettings()
        if (currentCardIndex < deck.cards.length - 1) {
            setCurrentCardIndex(prev => prev + 1)
        } else {
            onSave()
        }
    }

    const handlePrev = () => {
        saveCropSettings()
        if (currentCardIndex > 0) {
            setCurrentCardIndex(prev => prev - 1)
        }
    }

    return (
        <div className="image-studio">
            <div className="studio-card-info">
                <h3>{currentCard.index} {currentCard.name}</h3>
                <p className="studio-hint">Drag to move, scroll to zoom. Image typically saves as 512x512 center crop.</p>
            </div>

            <div className="cropper-stage">
                <div className="cropper-mask">
                    <img
                        ref={imageRef}
                        src={currentCard.image_url}
                        alt="Card Subject"
                        style={{
                            transform: `translate(${position.x}px, ${position.y}px) scale(${position.scale})`,
                            cursor: isDragging ? 'grabbing' : 'grab'
                        }}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onWheel={handleWheel}
                        draggable={false}
                    />
                </div>
            </div>

            <div className="alternatives-strip">
                <h4>Alternatives</h4>
                <div className="thumbnails">
                    {isLoadingAlts ? <Spinner size="sm" /> :
                        alternatives.map((img, idx) => (
                            <img
                                key={idx}
                                src={img.url}
                                className={currentCard.image_url === img.url ? 'active' : ''}
                                onClick={() => selectAlternative(img)}
                                alt="alt"
                            />
                        ))
                    }
                </div>
            </div>

            <div className="custom-url-section" style={{ padding: '0 var(--spacing-md) var(--spacing-sm)', display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
                <Input
                    label="Or use custom URL"
                    placeholder="https://example.com/image.jpg"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    style={{ flex: 1 }}
                />
                <Button
                    variant="secondary"
                    onClick={() => {
                        if (customUrl) {
                            selectAlternative({ url: customUrl, attribution: 'Custom URL' });
                            setCustomUrl('');
                        }
                    }}
                    disabled={!customUrl}
                >
                    Apply
                </Button>
            </div>

            <div className="studio-nav">
                <Button
                    onClick={handlePrev}
                    disabled={currentCardIndex === 0}
                    variant="secondary"
                    size="sm"
                >
                    ←
                </Button>
                <span className="card-counter">{currentCardIndex + 1} / {deck.cards.length}</span>
                <Button
                    onClick={handleNext}
                    variant="primary"
                    size="sm"
                >
                    {isModal && currentCardIndex === deck.cards.length - 1 ? 'Done' : (currentCardIndex === deck.cards.length - 1 ? 'Finish' : '→')}
                </Button>
            </div>
        </div>
    )
}

export default ImageStudio
