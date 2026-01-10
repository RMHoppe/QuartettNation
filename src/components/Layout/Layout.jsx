import React from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useHeader } from '../../contexts/HeaderContext'
import { Button } from '../../ui'
import { ArrowLeft } from 'lucide-react'
import './Layout.css'

const Layout = ({ children }) => {
    const location = useLocation()
    const navigate = useNavigate()
    const { title, Jl, backTo, customContent } = useHeader()

    // Determine if we should show standard logo (Home) or dynamic content
    const isHome = location.pathname === '/' && !backTo;

    const handleBack = () => {
        if (typeof backTo === 'function') {
            backTo();
        } else if (typeof backTo === 'string') {
            navigate(backTo);
        } else {
            navigate(-1);
        }
    };

    return (
        <div className="app-container">
            <header className="app-header">
                {isHome ? (
                    <Link to="/" className="logo">Quartett<span>Nation</span></Link>
                ) : (
                    <div className="header-dynamic">
                        {backTo && (
                            <Button variant="ghost" size="sm" onClick={handleBack} className="header-back-btn">
                                <ArrowLeft size={20} className="header-back-icon" />
                                Back
                            </Button>
                        )}
                        <h2 className={`header-title gradient-text ${backTo ? 'with-back' : ''}`}>{title}</h2>
                    </div>
                )}
                {customContent}
            </header>

            <main className="app-main">
                {children}
            </main>

            <footer className="app-footer">
                <nav className="bottom-nav">
                    <Link to="/" className={location.pathname === '/' ? 'active' : ''}>Home</Link>
                    <Link to="/create" className={location.pathname === '/create' ? 'active' : ''}>Create</Link>
                    <Link to="/collection" className={location.pathname === '/collection' ? 'active' : ''}>Decks</Link>
                </nav>
            </footer>
        </div>
    )
}

export default Layout
