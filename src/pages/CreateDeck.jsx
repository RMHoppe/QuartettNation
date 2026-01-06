import React, { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useHeader } from '../contexts/HeaderContext'
import DeckReview from '../components/DeckReview/DeckReview'
import ModelSelector from '../components/ModelSelector'
import { saveDeck } from '../services/decks'
import { Button, Input } from '../ui'
import { useAuth } from '../contexts/AuthContext'

const CreateDeck = () => {
    const [themeInput, setThemeInput] = useState('')
    const [deckSize, setDeckSize] = useState(32)
    const [isGenerating, setIsGenerating] = useState(false)
    const [generationError, setGenerationError] = useState(null)
    const [generatedDeck, setGeneratedDeck] = useState(null)
    const [isEditing, setIsEditing] = useState(false)

    const navigate = useNavigate()
    const { user } = useAuth()
    const { setTitle, setBackTo } = useHeader()

    // Reset header when entering initial state
    useEffect(() => {
        if (!isEditing) {
            setTitle('Create Deck')
            setBackTo('/')
        }
    }, [isEditing])


    const handleSaveDeck = useCallback(async (finalDeck) => {
        try {
            if (!user) throw new Error("You must be logged in to save a deck.");

            await saveDeck(
                {
                    name: finalDeck.deckName,
                    theme: finalDeck.theme,
                    categories: finalDeck.categories
                },
                finalDeck.cards,
                user.id
            )

            alert('Deck saved successfully!');
            setIsEditing(false);
            setGeneratedDeck(null);
            navigate('/collection');

        } catch (err) {
            console.error('Error saving deck:', err);
            alert('Failed to save deck: ' + err.message);
        }
    }, [user, navigate])

    const handleGenerate = async () => {
        if (!themeInput.trim()) return;

        setIsGenerating(true)
        setGenerationError(null)

        try {
            console.log("Starting progressive generation...");
            const { generateCategories } = await import('../services/gemini');
            // 1. Just Categories first
            const categories = await generateCategories(themeInput);
            console.log("Categories generated:", categories);

            // Pass this partial deck to the Review UI
            setGeneratedDeck({
                deckName: themeInput, // Use theme as default deck name
                theme: themeInput,
                categories: categories,
                cards: [] // No cards yet
            })
            setIsEditing(true) // Trigger Review UI

        } catch (err) {
            console.error("Deck Generation Failed:", err);
            setGenerationError(err.message || 'Failed to generate deck')
        } finally {
            setIsGenerating(false)
        }
    }

    const handleCancel = useCallback(() => {
        setIsEditing(false)
        setGeneratedDeck(null)
    }, [])

    return (
        <div className="page-view app-card">
            {/* Header handled by Layout */}
            {!isEditing && <div style={{ height: 'var(--spacing-md)' }}></div>} {/* Spacer if needed */}

            {!generatedDeck ? (
                <>
                    <ModelSelector />

                    <div className="input-group">
                        <Input
                            label="Deck Theme"
                            placeholder="e.g. Vintage Supercars, Marvel Heroes..."
                            value={themeInput}
                            onChange={(e) => setThemeInput(e.target.value)}
                            disabled={isGenerating}
                        />
                    </div>

                    {/* Size Selector and Generate Button remain same... */}
                    <div className="input-group">
                        <label>Number of Cards</label>
                        <div className="size-selector" style={{ display: 'flex', gap: '10px' }}>
                            {[12, 16, 24, 32].map(size => (
                                <Button
                                    key={size}
                                    variant={deckSize === size ? 'primary' : 'secondary'}
                                    onClick={() => setDeckSize(size)}
                                    style={{ flex: 1 }}
                                    disabled={isGenerating}
                                    size="sm"
                                >
                                    {size}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {generationError && (
                        <div className="error-message" style={{ color: 'var(--danger)', fontSize: '0.9rem' }}>
                            {generationError}
                        </div>
                    )}

                    <Button
                        variant="primary"
                        onClick={handleGenerate}
                        disabled={isGenerating || !themeInput.trim()}
                        loading={isGenerating}
                        fullWidth
                    >
                        {isGenerating ? 'Generating...' : 'Generate with AI'}
                    </Button>
                </>
            ) : isEditing ? (
                <DeckReview
                    initialPartialDeck={generatedDeck}
                    theme={themeInput}
                    targetCount={deckSize}
                    onSave={handleSaveDeck}
                    onCancel={handleCancel}
                />
            ) : (
                null
            )}
        </div>
    )
}

export default CreateDeck
