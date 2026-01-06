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
        <div className="page-view app-card centered" style={{ gap: '2rem' }}>
            <div style={{ textAlign: 'center' }}>
                <h1 className="hero-title gradient-text">Challenge your friends</h1>
                <p className="hero-subtitle">Generate unique Top Trump decks using AI.</p>
            </div>

            <div className="auth-status-card" style={{
                background: 'var(--bg-secondary)',
                padding: '1.5rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                width: '100%',
                maxWidth: '400px',
                textAlign: 'center'
            }}>
                <div style={{ marginBottom: '1rem' }}>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Currently playing as:</span>
                    <h3 style={{ margin: '4px 0', color: user ? 'var(--primary)' : 'var(--text-main)' }}>
                        {displayName}
                    </h3>
                    {user && <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{user.email}</span>}
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
                <Link to="/create" className="btn btn-primary" style={{ minWidth: '160px', textAlign: 'center' }}>Create New Deck</Link>
                <Link to="/collection" className="btn btn-secondary" style={{ minWidth: '160px', textAlign: 'center' }}>My Collection</Link>
            </div>

            <div className="recent-games" style={{ width: '100%', maxWidth: '400px' }}>
                <EmptyState message="No active games." />
            </div>
        </div>
    )
}

export default Home
