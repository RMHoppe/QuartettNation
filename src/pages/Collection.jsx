import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Trash2, Share2 } from 'lucide-react'
import { createGame } from '../services/game'
import { getUserDecks, deleteDeck } from '../services/decks' // Use new getUserDecks
import { Button, EmptyState } from '../ui'
import DeckDetail from '../components/DeckDetail/DeckDetail'
import { useHeader } from '../contexts/HeaderContext'
import { useAuth } from '../contexts/AuthContext'
import './Collection.css'

const Collection = () => {
    const [decks, setDecks] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedDeckId, setSelectedDeckId] = useState(null)
    const navigate = useNavigate()

    const { setTitle, setBackTo } = useHeader()
    const { user } = useAuth()

    useEffect(() => {
        if (user) {
            fetchDecks()
        }
    }, [user])

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
            const data = await getUserDecks(user.id)
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
                await deleteDeck(deckId, user.id)
                setDecks(prev => prev.filter(d => d.id !== deckId))
            } catch (err) {
                console.error('Error deleting deck:', err)
                alert('Failed to delete deck: ' + err.message)
            }
        }
    }

    if (selectedDeckId) {
        return <DeckDetail deckId={selectedDeckId} onBack={() => setSelectedDeckId(null)} />
    }

    const ownedDecks = decks.filter(d => !d.isShared);
    const sharedDecks = decks.filter(d => d.isShared);

    const DeckList = ({ items, title }) => (
        <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ color: 'var(--text-light)', opacity: 0.7, marginBottom: '1rem', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.05em' }}>{title}</h3>
            <div className="modern-list">
                {items.map(deck => {
                    const isOwner = !deck.isShared;

                    return (
                        <div key={deck.id} className="modern-list-item">
                            <div className="deck-info" onClick={() => setSelectedDeckId(deck.id)} style={{ cursor: 'pointer', flex: 1 }}>
                                <h3>{deck.name}</h3>
                                <p style={{ color: 'var(--text-ink)', opacity: 0.7, fontSize: '0.85rem', margin: '4px 0' }}>
                                    {deck.categories?.map(c => c.name).join(' • ')}
                                </p>
                                <div className="deck-meta" style={{ color: 'var(--text-ink)', opacity: 0.7, display: 'flex', gap: '12px', fontSize: '0.8rem' }}>
                                    <span>{deck.cards?.[0]?.count || 0} Cards</span>
                                    <span>{new Date(deck.created_at).toLocaleDateString()}</span>
                                    {deck.isShared && <span style={{ color: 'var(--text-gold)', fontWeight: 'bold' }}>Shared</span>}
                                </div>
                            </div>
                            <div className="deck-actions">
                                {isOwner && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => handleDelete(e, deck.id)}
                                        title="Delete Deck"
                                        style={{ color: 'var(--danger)' }}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                )}
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
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
                                            // Pass real user ID to game creation
                                            const baseName = user.user_metadata?.full_name || user.email?.split('@')[0] || "Player";
                                            const game = await createGame(deck.id, user.id, `${baseName} (Host)`);
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
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="page-view app-card">
            {isLoading ? (
                <div className="loading">Loading decks...</div>
            ) : decks.length === 0 ? (
                <EmptyState message="You haven't created any decks yet.">
                    <Button variant="primary" onClick={() => navigate('/create')} style={{ marginTop: '16px' }}>
                        Create Deck
                    </Button>
                </EmptyState>
            ) : (
                <>
                    {ownedDecks.length > 0 && <DeckList items={ownedDecks} title="My Decks" />}
                    {sharedDecks.length > 0 && <DeckList items={sharedDecks} title="Shared with Me" />}
                </>
            )}
        </div>
    )
}

export default Collection
