import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const isConfirmed = searchParams.get('confirmed') === 'true';
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate(redirect);
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-lg bg-sky-600 text-white flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-5 h-5" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sign in to EventHub</h2>
          <p className="text-xs text-slate-500 mt-1">Access your organiser dashboard & event tools</p>
        </div>

        {/* Notice for Attendees */}
        <div className="mb-6 p-3 bg-sky-50 border border-sky-200 rounded-lg text-xs text-sky-800 leading-relaxed">
          <span className="font-semibold block mb-0.5">Attending an event?</span>
          You don't need to sign in! Simply <Link to="/events" className="underline font-bold text-sky-700">browse events</Link>, book your ticket, and get your digital QR pass instantly.
        </div>

        {isConfirmed && (
          <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>Your email has been verified! Please sign in with your credentials.</span>
          </div>
        )}

        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm rounded-lg transition shadow-sm"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to={`/signup?redirect=${encodeURIComponent(redirect)}`} className="font-semibold text-sky-600 hover:text-sky-700">
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
