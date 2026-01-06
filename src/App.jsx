import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home'
import CreateDeck from './pages/CreateDeck'
import Collection from './pages/Collection'
import GameContainer from './pages/GameContainer'
import Auth from './pages/Auth'
import { AuthProvider, useAuth } from './contexts/AuthContext'

// Simple Protected Route Wrapper
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return null // or a spinner
  if (!user) return <Navigate to="/auth" />
  return children
}

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/create" element={
            <ProtectedRoute>
              <CreateDeck />
            </ProtectedRoute>
          } />
          <Route path="/collection" element={
            <ProtectedRoute>
              <Collection />
            </ProtectedRoute>
          } />
          <Route path="/game/:id" element={<GameContainer />} />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}

export default App
