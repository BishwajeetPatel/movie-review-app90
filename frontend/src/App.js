import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navigation from './components/Navigation';
import HomePage from './pages/HomePage';
import MoviesPage from './pages/MoviesPage';
import MovieDetailPage from './pages/MovieDetailPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import WatchlistPage from './pages/WatchlistPage';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './context/ToastContext';
import Toast from './components/Toast';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Navigation />
              <main className="pt-16">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/movies" element={<MoviesPage />} />
                  <Route path="/movies/:id" element={<MovieDetailPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/watchlist" 
                    element={
                      <ProtectedRoute>
                        <WatchlistPage />
                      </ProtectedRoute>
                    } 
                  />
                </Routes>
              </main>
              <Toast />
            </div>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;