import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, Lock, Mail, User, ShieldCheck, AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('participant'); // 'participant' or 'organiser'
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
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-100 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-purple-200">
            <Calendar className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900">Create Account</h2>
          <p className="text-xs text-slate-500 mt-1">Join EventHub to discover or organise events</p>
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
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">I want to:</label>
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
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

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
