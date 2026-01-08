import React, { useState } from 'react'
import { Button } from '../../ui'
import { useHeader } from '../../contexts/HeaderContext'
import './DeckReview.css'
import '../Loading.css'
import CategoryReview from './CategoryReview'
import CardNameReview from './CardNameReview'
import ImageGridReview from './ImageGridReview'

import { generateCardNames, generateCardDetails } from '../../services/gemini'

const DeckReview = ({ initialPartialDeck, onSave, onCancel, theme, targetCount = 32 }) => {
    const [step, setStep] = useState(1)
    const [deck, setDeck] = useState(initialPartialDeck)
    const [isLoading, setIsLoading] = useState(false)
    const [loadingMsg, setLoadingMsg] = useState('')

    // Global Header Management
    // We update this whenever step or deck changes slightly
    const { setTitle, setBackTo } = useHeader()

    React.useEffect(() => {
        const stepTitles = {
            1: 'Review Categories',
            2: 'Review Card Names',
            3: 'Edit Images'
        }
        setTitle(stepTitles[step])

        if (step === 1) {
            setBackTo(() => onCancel)
        } else {
            setBackTo(() => () => setStep(step - 1))
        }

    }, [step, setTitle, setBackTo, onCancel])


    const updateDeck = (updates) => {
        setDeck(prev => ({ ...prev, ...updates }))
    }

    const updateCard = (index, cardUpdates) => {
        setDeck(prev => {
            const newCards = [...prev.cards]
            newCards[index] = { ...newCards[index], ...cardUpdates }
            return { ...prev, cards: newCards }
        })
    }

    // Transitions
    const handleCategoriesConfirmed = async () => {
        setIsLoading(true)
        setLoadingMsg('Generating Card Names...')
        try {
            const data = await generateCardNames(theme, deck.categories, targetCount)
            // Initialize cards with names only
            const cards = data.cardNames.map((name, i) => ({ index: i + 1, name, values: {} }))
            updateDeck({ cards })
            setStep(2)
        } catch (e) {
            alert("Error generating names: " + e.message)
        } finally {
            setIsLoading(false)
        }
    }

    const handleNamesConfirmed = async () => {
        setIsLoading(true)
        setLoadingMsg('Generating Stats...')
        try {
            // Get Details (Stats + Search Queries) - NO image fetching here
            const detailsData = await generateCardDetails(theme, deck.categories, deck.cards.map(c => c.name))

            // Cards now have: name, searchQuery, values
            // Images will be lazy-loaded in ImageGridReview
            updateDeck({ cards: detailsData.cards })
            setStep(3)
        } catch (e) {
            alert("Error generating details: " + e.message)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="deck-review-loading">
                <div className="spinner"></div>
                <h3>{loadingMsg}</h3>
            </div>
        )
    }

    return (
        <div className="deck-review-container">
            {/* Header handled globally now */}
            <div className="review-content">
                <div className="step-indicator" style={{ textAlign: 'center', marginBottom: 'var(--spacing-md)', fontSize: '0.9rem' }}>
                    Step {step}/3
                </div>
                {step === 1 && (
                    <CategoryReview deck={deck} updateDeck={updateDeck} onNext={handleCategoriesConfirmed} />
                )}
                {step === 2 && (
                    <CardNameReview deck={deck} updateDeck={updateDeck} onNext={handleNamesConfirmed} />
                )}
                {step === 3 && (
                    <ImageGridReview deck={deck} updateDeck={updateDeck} updateCard={updateCard} onSave={() => onSave(deck)} />
                )}
            </div>
        </div>
    )
}

export default DeckReview
