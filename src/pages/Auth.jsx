import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button, Input, Spinner } from '../ui' // Assuming these exist from previous context
import { useNavigate } from 'react-router-dom'
import '../index.css' // Ensure global styles

const Auth = () => {
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [error, setError] = useState(null)
    const navigate = useNavigate()

    const handleAuth = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: username,
                        },
                    },
                })
                if (error) throw error
                // Usually Supabase requires email confirmation, but for now we assume it might be off or we handle "check email"
                alert('Account created! You can now log in.')
                setIsSignUp(false)
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                })
                if (error) throw error
                navigate('/')
            }
        } catch (err) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="page-view centered auth-page-container">
            <div className="glass-panel auth-panel">
                <h2 className="auth-title">
                    {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h2>

                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="input-group auth-form">
                    {isSignUp && (
                        <div className="input-group">
                            <label>Username</label>
                            <Input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                required
                                placeholder="Choose a username"
                            />
                        </div>
                    )}
                    <div className="input-group">
                        <label>Email</label>
                        <Input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="you@example.com"
                        />
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <Button type="submit" variant="primary" fullWidth loading={loading}>
                        {isSignUp ? 'Sign Up' : 'Log In'}
                    </Button>
                </form>

                <div className="auth-footer">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                    <button
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="auth-switch-btn"
                    >
                        {isSignUp ? 'Log In' : 'Sign Up'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Auth
