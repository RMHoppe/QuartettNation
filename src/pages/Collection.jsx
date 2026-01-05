import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { createGame } from '../services/game'
import { getAllDecks, deleteDeck } from '../services/decks'
import { Button, EmptyState } from '../ui'
import DeckDetail from '../components/DeckDetail/DeckDetail'
import { useHeader } from '../contexts/HeaderContext'
import './Collection.css'

const Collection = () => {
    const [decks, setDecks] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedDeckId, setSelectedDeckId] = useState(null)
    const navigate = useNavigate()

    const { setTitle, setBackTo } = useHeader()

    useEffect(() => {
        fetchDecks()
    }, [])

    useEffect(() => {
        if (selectedDeckId) {
            // DeckDetail handles header
        } else {
            setTitle('My Collection')
            setBackTo('/')
        }
    }, [selectedDeckId])

    const fetchDecks = async () => {
        try {
            const data = await getAllDecks()
            setDecks(data)
        } catch (err) {
            console.error('Error fetching decks:', err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleDelete = async (e, deckId) => {
        e.stopPropagation()
        if (window.confirm('Are you sure you want to delete this deck? This action cannot be undone.')) {
            try {
                await deleteDeck(deckId)
                setDecks(prev => prev.filter(d => d.id !== deckId))
            } catch (err) {
                console.error('Error deleting deck:', err)
                alert('Failed to delete deck')
            }
        }
    }

    if (selectedDeckId) {
        return <DeckDetail deckId={selectedDeckId} onBack={() => setSelectedDeckId(null)} />
    }

    return (
        <div className="page-view app-card">
            {/* Header handled by Layout */}

            {isLoading ? (
                <div className="loading">Loading decks...</div>
            ) : decks.length === 0 ? (
                <EmptyState message="You haven't created any decks yet.">
                    <Button variant="primary" onClick={() => window.location.href = '/create'} style={{ marginTop: '16px' }}>
                        Create Deck
                    </Button>
                </EmptyState>
            ) : (
                <div className="modern-list">
                    {decks.map(deck => (
                        <div key={deck.id} className="modern-list-item">
                            <div className="deck-info" onClick={() => setSelectedDeckId(deck.id)} style={{ cursor: 'pointer', flex: 1 }}>
                                <h3>{deck.name}</h3>
                                <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', margin: '4px 0' }}>
                                    {deck.categories?.map(c => c.name).join(' • ')}
                                </p>
                                <div className="deck-meta" style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                                    <span>{deck.cards?.[0]?.count || 0} Cards</span>
                                    <span>{new Date(deck.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="deck-actions">
                                <Button
                                    variant="ghost" /* Redundant style but semantic */
                                    size="sm"
                                    onClick={(e) => handleDelete(e, deck.id)}
                                    title="Delete Deck"
                                    style={{ color: 'var(--danger)', marginRight: 'auto' }} /* Push to left or keep with buttons? Let's keep separate */
                                >
                                    <Trash2 size={16} />
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation(); // Don't open detail view
                                        setSelectedDeckId(deck.id);
                                    }}
                                >
                                    View
                                </Button>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={async (e) => {
                                        e.stopPropagation();
                                        try {
                                            let myId = sessionStorage.getItem('qn_player_id');
                                            if (!myId) {
                                                myId = crypto.randomUUID();
                                                sessionStorage.setItem('qn_player_id', myId);
                                            }

                                            const game = await createGame(deck.id, myId, "Host");
                                            navigate(`/game/${game.id}`);
                                        } catch (e) {
                                            console.error(e);
                                            alert("Failed to create game");
                                        }
                                    }}
                                >
                                    Play
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )
            }
        </div >
    )
}

export default Collection
