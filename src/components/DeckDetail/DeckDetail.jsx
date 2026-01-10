import React, { useState, useEffect } from 'react'
import { getDeckById } from '../../services/decks'
import { Button } from '../../ui'
import Card from '../../components/Card/Card'
import { Eye, List, Grid, ArrowLeft } from 'lucide-react'
import './DeckDetail.css'

const DeckDetail = ({ deckId, onBack }) => {
    const [deck, setDeck] = useState(null)
    const [loading, setLoading] = useState(true)
    const [viewMode, setViewMode] = useState('grid') // 'grid' or 'table'

    useEffect(() => {
        const loadDeck = async () => {
            try {
                const data = await getDeckById(deckId)
                setDeck(data)
            } catch (err) {
                console.error(err)
            } finally {
                setLoading(false)
            }
        }
        loadDeck()
    }, [deckId])

    if (loading) return <div className="p-4 text-center">Loading deck details...</div>
    if (!deck) return <div className="p-4 text-center">Deck not found</div>

    return (
        <div className="page-view app-card">
            <div className="detail-header">
                <Button variant="ghost" size="sm" onClick={onBack} className="back-btn">
                    <ArrowLeft size={16} /> Back
                </Button>
                <div className="view-toggles">
                    <button
                        className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                        title="Card View"
                    >
                        <Grid size={20} />
                    </button>
                    <button
                        className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
                        onClick={() => setViewMode('table')}
                        title="Table View"
                    >
                        <List size={20} />
                    </button>
                </div>
            </div>

            <h2 className="deck-title gradient-text">{deck.name}</h2>

            {viewMode === 'grid' ? (
                <div className="modern-list">
                    {deck.cards.map(card => (
                        <Card
                            key={card.id}
                            card={card}
                            categories={deck.categories}
                            deckName={deck.name}
                            enableFlip={true}
                        />
                    ))}
                </div>
            ) : (
                <div className="table-container">
                    <table className="stats-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                {deck.categories.map((cat, i) => {
                                    const match = cat.name.match(/^(.+?)\s*\[(.*?)\]$/);
                                    const label = match ? match[1].trim() : cat.name;
                                    const unit = match ? match[2].trim() : cat.unit;
                                    return <th key={i}>{label} <span className="th-unit">{unit}</span></th>
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {deck.cards.map(card => (
                                <tr key={card.id}>
                                    <td className="card-name-cell">{card.name}</td>
                                    {deck.categories.map((cat, i) => (
                                        <td key={i}>
                                            {(card.values && card.values[cat.name]) ?? (card.attributes && card.attributes[cat.name]) ?? '-'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default DeckDetail
