import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Ticket, LayoutDashboard, LogOut, User, PlusCircle } from 'lucide-react';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isOrganiser = profile?.role === 'organiser' || profile?.role === 'admin';

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-200">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 bg-clip-text text-transparent">
              EventHub
            </span>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <Link to="/events" className="hover:text-purple-600 transition">
              Explore Events
            </Link>
            {user && (
              <Link to="/my-tickets" className="hover:text-purple-600 transition flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-purple-600" />
                My Tickets
              </Link>
            )}
            {isOrganiser && (
              <Link to="/organiser" className="hover:text-purple-600 transition flex items-center gap-1.5">
                <LayoutDashboard className="w-4 h-4 text-indigo-600" />
                Organiser Portal
              </Link>
            )}
          </div>

          {/* Right Auth CTA */}
          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-3">
                {isOrganiser && (
                  <Link
                    to="/organiser/create"
                    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Create Event
                  </Link>
                )}
                <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 text-sm">
                  <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                    {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  <span className="hidden lg:inline text-xs font-semibold text-slate-700">
                    {profile?.full_name || user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-purple-700 px-3 py-1.5 transition"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl shadow-md shadow-purple-200 transition"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
