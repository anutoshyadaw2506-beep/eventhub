import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Ticket, LayoutDashboard, LogOut, User, Plus, Sparkles } from 'lucide-react';

export default function Navbar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const isOrganiser = profile?.role === 'organiser' || profile?.role === 'admin';

  return (
    <nav className="bg-white/85 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-purple-500/25 group-hover:scale-105 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 bg-clip-text text-transparent">
                EventHub
              </span>
            </div>
          </Link>

          {/* Center Links */}
          <div className="hidden md:flex items-center space-x-7 text-xs font-bold text-slate-600">
            <Link to="/events" className="hover:text-purple-600 transition tracking-wide">
              Explore Events
            </Link>
            {user && (
              <Link to="/my-tickets" className="hover:text-purple-600 transition flex items-center gap-1.5 tracking-wide">
                <Ticket className="w-4 h-4 text-purple-600" />
                My Passes
              </Link>
            )}
            {isOrganiser && (
              <Link to="/organiser" className="hover:text-purple-600 transition flex items-center gap-1.5 tracking-wide text-indigo-700 font-extrabold">
                <LayoutDashboard className="w-4 h-4" />
                Organiser Hub
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
                    className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-sm shadow-purple-600/25 transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Host Event
                  </Link>
                )}
                <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200 text-xs">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-100 to-indigo-100 text-purple-700 font-bold flex items-center justify-center border border-purple-200">
                    {profile?.full_name ? profile.full_name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                  </div>
                  <span className="hidden lg:inline font-bold text-slate-800">
                    {profile?.full_name || user.email}
                  </span>
                  <button
                    onClick={handleLogout}
                    title="Sign Out"
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2.5">
                <Link
                  to="/login"
                  className="text-xs font-bold text-slate-700 hover:text-purple-700 px-3 py-2 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl shadow-md shadow-purple-600/25 transition"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
