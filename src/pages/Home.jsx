import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useHeader } from '../contexts/HeaderContext'
import { EmptyState, Button } from '../ui' // Added Button import
import { useAuth } from '../contexts/AuthContext'
import '../ui/Button.css'

const Home = () => {
    const { setTitle, setBackTo } = useHeader()
    const { user, signOut } = useAuth()

    useEffect(() => {
        setTitle('QuartettNation')
        setBackTo(null)
    }, [])

    const handleLogout = async () => {
        try {
            await signOut()
        } catch (error) {
            console.error("Error signing out:", error)
        }
    }

    // Determine display name
    const displayName = user
        ? (user.user_metadata?.full_name || user.email?.split('@')[0] || 'User')
        : 'Guest';

    return (
        <div className="page-view app-card centered home-view">
            <div className="home-hero-section">
                <h1 className="hero-title gradient-text">Challenge your friends</h1>
                <p className="hero-subtitle">Generate unique Top Trump decks using AI.</p>
            </div>

            <div className="auth-status-card">
                <div className="home-user-info">
                    <span className="home-user-label">Currently playing as:</span>
                    <h3 className={`home-user-name ${user ? 'authenticated' : ''}`}>
                        {displayName}
                    </h3>
                    {user && <span className="home-user-email">{user.email}</span>}
                </div>

                {user ? (
                    <Button variant="secondary" onClick={handleLogout} size="sm">
                        Log Out
                    </Button>
                ) : (
                    <Link to="/auth">
                        <Button variant="secondary" size="sm">
                            Log In / Sign Up
                        </Button>
                    </Link>
                )}
            </div>

            <div className="action-buttons">
                <Link to="/create" className="btn btn-primary home-action-btn">Create New Deck</Link>
                <Link to="/collection" className="btn btn-secondary home-action-btn">My Collection</Link>
            </div>

            <div className="recent-games">
                <EmptyState message="No active games." />
            </div>
        </div>
    )
}

export default Home
