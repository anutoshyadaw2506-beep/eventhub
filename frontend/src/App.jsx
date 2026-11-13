import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import EventsListPage from './pages/EventsListPage';
import EventDetailPage from './pages/EventDetailPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ParticipantDashboard from './pages/ParticipantDashboard';
import TicketViewPage from './pages/TicketViewPage';
import OrganiserDashboard from './pages/OrganiserDashboard';
import CreateEventPage from './pages/CreateEventPage';
import CheckInScannerPage from './pages/CheckInScannerPage';
import EventAnalyticsPage from './pages/EventAnalyticsPage';

function ProtectedRoute({ children, allowedRoles }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && profile && !allowedRoles.includes(profile.role)) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
        <p className="text-xs text-slate-500 mt-2">
          You need an {allowedRoles.join(' or ')} account to access this page.
        </p>
      </div>
    );
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen flex flex-col bg-slate-50 selection:bg-purple-500 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/events" element={<EventsListPage />} />
              <Route path="/events/:id" element={<EventDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />

              {/* Participant Protected Routes */}
              <Route
                path="/my-tickets"
                element={
                  <ProtectedRoute>
                    <ParticipantDashboard />
                  </ProtectedRoute>
                }
              />
              {/* Digital Pass / Ticket View (Public for Attendees) */}
              <Route path="/ticket/:id" element={<TicketViewPage />} />

              {/* Organiser Protected Routes */}
              <Route
                path="/organiser"
                element={
                  <ProtectedRoute allowedRoles={['organiser', 'admin']}>
                    <OrganiserDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organiser/create"
                element={
                  <ProtectedRoute allowedRoles={['organiser', 'admin']}>
                    <CreateEventPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organiser/scan/:eventId"
                element={
                  <ProtectedRoute allowedRoles={['organiser', 'admin']}>
                    <CheckInScannerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/organiser/analytics/:eventId"
                element={
                  <ProtectedRoute allowedRoles={['organiser', 'admin']}>
                    <EventAnalyticsPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
