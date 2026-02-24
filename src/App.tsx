import './App.css'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { Login } from './pages/Login'
import { Dashboard } from './pages/Dashboard'

function AppContent() {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ padding: '2rem' }}>Loading...</div>
  if (!user) return <Login />
  return <Dashboard />
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
