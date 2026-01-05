import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useHeader } from '../contexts/HeaderContext'
import Card from '../components/Card/Card'
import { EmptyState } from '../ui'
import '../ui/Button.css' // Import button styles for Links

const MOCK_CATEGORIES = [
    { name: 'Size', unit: 'cm', higherWins: true },
    { name: 'Weight', unit: 'kg', higherWins: false },
    { name: 'Price', unit: '€', higherWins: false },
    { name: 'Lethality', unit: 'out of 10', higherWins: true }
]

const MOCK_CARD = {
    name: 'Garlic Press',
    image_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Garlic_Press_and_Garlic.jpg/640px-Garlic_Press_and_Garlic.jpg',
    attribution_text: 'CC BY 2.5 / Lee Kindness',
    values: {
        'Size': 15,
        'Weight': 0.15,
        'Price': 5,
        'Lethality': 6,
    }
}

const Home = () => {
    const { setTitle, setBackTo } = useHeader()

    useEffect(() => {
        setTitle('QuartettNation')
        setBackTo(null)
    }, [])
    return (
        <div className="page-view app-card centered">
            <h1 className="hero-title gradient-text">Challenge your friends with custom decks</h1>
            <p className="hero-subtitle">Generate unique Top Trump decks using AI and play anywhere.</p>

            <div className="card-preview">
                <Card card={MOCK_CARD} categories={MOCK_CATEGORIES} deckName="Kitchen Utensils" />
            </div>

            <div className="action-buttons">
                <Link to="/create" className="btn btn-primary">Create New Deck</Link>
                <Link to="/collection" className="btn btn-secondary">My Collection</Link>
            </div>

            <div className="recent-games">
                <h3>Recent Games</h3>
                <EmptyState message="No active games. Start one by creating a deck!" />
            </div>
        </div>
    )
}

export default Home
