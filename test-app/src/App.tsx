import React from 'react'
import { Button } from './components/Button'
import { Card } from './components/Card'
import { UserProfile } from './components/UserProfile'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">
          ReactView Test Components
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">Buttons</h2>
            <Button variant="primary" size="small">Small Primary</Button>
            <Button variant="secondary" size="medium">Medium Secondary</Button>
            <Button variant="danger" size="large" disabled>Large Danger (Disabled)</Button>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">Cards</h2>
            <Card 
              title="Sample Card" 
              description="This is a sample card component with various props."
              showFooter={true}
            />
            <Card 
              title="Minimal Card" 
              description="This card has no footer."
              showFooter={false}
            />
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">User Profiles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <UserProfile 
              name="John Doe"
              email="john@example.com"
              avatar="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
              role="Developer"
              isOnline={true}
            />
            <UserProfile 
              name="Jane Smith"
              email="jane@example.com"
              role="Designer"
              isOnline={false}
            />
            <UserProfile 
              name="Mike Johnson"
              email="mike@example.com"
              role="Manager"
              isOnline={true}
              showBadge={true}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default App