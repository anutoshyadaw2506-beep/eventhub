import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Ticket, LayoutDashboard, LogOut, User, Plus } from 'lucide-react';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isOrganiser = profile?.role === 'organiser' || profile?.role === 'admin';

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-lg bg-sky-600 flex items-center justify-center text-white">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight">
              EventHub
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-600">
            <Link to="/events" className="hover:text-sky-600 transition">
              Explore Events
            </Link>
            {user && (
              <Link to="/my-tickets" className="hover:text-sky-600 transition flex items-center gap-1.5">
                <Ticket className="w-4 h-4 text-sky-600" />
                My Passes
              </Link>
            )}
            {isOrganiser && (
              <Link to="/organiser" className="hover:text-sky-600 transition flex items-center gap-1.5 text-sky-700 font-semibold">
                <LayoutDashboard className="w-4 h-4 text-sky-600" />
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
                    className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create Event
                  </Link>
                )}
                <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 text-xs">
                  <div className="w-8 h-8 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center">
                    {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  <span className="hidden lg:inline font-medium text-slate-700">
                    {profile?.full_name || user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-slate-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-xs font-semibold text-slate-700 hover:text-sky-600 px-3 py-2 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 px-3.5 py-2 rounded-lg transition shadow-sm"
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
