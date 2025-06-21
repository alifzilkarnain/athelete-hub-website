import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import FreekickAnalysis from './pages/FreekickAnalysis';
import CricketAnalysis from './pages/CricketAnalysis';
import LiveDetection from './pages/LiveDetection';
import Results from './pages/Results';
import CricketResults from './pages/CricketResults';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-900">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/freekick-analysis" 
              element={
                <ProtectedRoute>
                  <FreekickAnalysis />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/cricket-analysis" 
              element={
                <ProtectedRoute>
                  <CricketAnalysis />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/live-detection" 
              element={
                <ProtectedRoute>
                  <LiveDetection />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/results/:sessionId" 
              element={
                <ProtectedRoute>
                  <Results />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/cricket-results/:sessionId" 
              element={
                <ProtectedRoute>
                  <CricketResults />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;