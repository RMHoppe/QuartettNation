import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import Home from './pages/Home'
import CreateDeck from './pages/CreateDeck'
import Collection from './pages/Collection'
import GameContainer from './pages/GameContainer'
import { useHeader } from './contexts/HeaderContext'
// App.css removed - styles consolidated

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateDeck />} />
        <Route path="/collection" element={<Collection />} />
        <Route path="/game/:id" element={<GameContainer />} />
      </Routes>
    </Layout>
  )
}

export default App
