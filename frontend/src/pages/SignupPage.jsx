import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Lock, Mail, User, ShieldCheck, AlertCircle, Zap, Github } from 'lucide-react';

export default function SignupPage() {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { signup, login, loginWithGithub } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('participant');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signup(email, password, fullName, role);
      navigate(redirect);
    } catch (err) {
      setError(err.message || 'Failed to create account with Supabase Auth.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail, demoPassword) => {
    setError(null);
    setLoading(true);
    try {
      await login(demoEmail, demoPassword);
      navigate(redirect);
    } catch (err) {
      setError(err.message || 'Failed to sign in with demo account.');
    } finally {
      setLoading(false);
    }
  };

  const handleGithub = async () => {
    setError(null);
    try {
      await loginWithGithub();
    } catch (err) {
      setError(err.message || 'GitHub OAuth failed.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-xl">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-purple-200">
            <Calendar className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Create Account</h2>
          <div className="mt-1.5 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
            <ShieldCheck className="w-3.5 h-3.5" /> Powered by Supabase Auth
          </div>
        </div>

        {/* 1-Click Demo Login Banner */}
        <div className="mb-6 p-3.5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl">
          <p className="text-[11px] font-bold text-purple-900 flex items-center gap-1 mb-2.5">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Instant 1-Click Demo Login:
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('organiser@eventhub.com', 'Password123!')}
              disabled={loading}
              className="py-2 px-2.5 bg-purple-600 hover:bg-purple-700 text-white text-[11px] font-bold rounded-xl transition shadow-sm text-center"
            >
              👑 Organiser Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('participant@eventhub.com', 'Password123!')}
              disabled={loading}
              className="py-2 px-2.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 text-[11px] font-bold rounded-xl transition shadow-sm text-center"
            >
              🎟️ Participant Demo
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jane Doe"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white"
              />
            </div>
          </div>

          {/* Account Role Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Account Role</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('participant')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition ${
                  role === 'participant'
                    ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-600/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className={`p-1 rounded-md ${role === 'participant' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <User className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Attend Events</p>
                  <p className="text-[10px] text-slate-500">Participant</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('organiser')}
                className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition ${
                  role === 'organiser'
                    ? 'border-purple-600 bg-purple-50/60 ring-2 ring-purple-600/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className={`p-1 rounded-md ${role === 'organiser' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Host & Scan</p>
                  <p className="text-[10px] text-slate-500">Organiser</p>
                </div>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2"
          >
            {loading ? 'Creating account in Supabase...' : 'Create Supabase Account'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-400">
            <span className="bg-white px-2">Or continue with</span>
          </div>
        </div>

        {/* GitHub OAuth Button */}
        <button
          type="button"
          onClick={handleGithub}
          className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2"
        >
          <Github className="w-4 h-4" /> GitHub via Supabase
        </button>

        <div className="mt-8 text-center text-xs text-slate-500">
          Already registered?{' '}
          <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="font-bold text-purple-600 hover:text-purple-700">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
