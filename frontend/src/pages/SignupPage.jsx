import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, AlertCircle, Mail, CheckCircle2 } from 'lucide-react';

export default function SignupPage() {
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const data = await signup(email, password, fullName, 'organiser');
      if (data?.session) {
        navigate(redirect === '/' ? '/organiser' : redirect);
      } else {
        setSubmittedEmail(email);
      }
    } catch (err) {
      setError(err.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
        {submittedEmail ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-4 border border-sky-100">
              <Mail className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Check Your Inbox</h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              We've sent a verification link to <strong className="text-slate-900">{submittedEmail}</strong>. Please click the link to activate your account.
            </p>

            <div className="mt-5 p-3.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500 text-left space-y-1">
              <p className="font-semibold text-slate-700">Can't find the email?</p>
              <p>• Check your <strong>Spam</strong> or <strong>Promotions</strong> folder.</p>
              <p>• Make sure the address was typed correctly.</p>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <Link
                to="/login"
                className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs rounded-lg transition shadow-sm"
              >
                Go to Sign In
              </Link>
              <button
                type="button"
                onClick={() => setSubmittedEmail(null)}
                className="text-xs text-slate-500 hover:text-slate-700 mt-2"
              >
                ← Back to signup
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-10 h-10 rounded-lg bg-sky-600 text-white flex items-center justify-center mx-auto mb-3">
                <Calendar className="w-5 h-5" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Create Organiser Account</h2>
              <p className="text-xs text-slate-500 mt-1">Host events, build registration forms & scan door passes</p>
            </div>

            {/* Notice for Attendees */}
            <div className="mb-6 p-3 bg-sky-50 border border-sky-200 rounded-lg text-xs text-sky-800 leading-relaxed">
              <span className="font-semibold block mb-0.5">Attending an event?</span>
              You don't need to create an account! Simply <Link to="/events" className="underline font-bold text-sky-700">browse events</Link>, book your ticket, and get your digital QR pass instantly.
            </div>

            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium text-sm rounded-lg transition shadow-sm"
              >
                {loading ? 'Creating organiser account...' : 'Create Organiser Account'}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-500">
              Already have an account?{' '}
              <Link to={`/login?redirect=${encodeURIComponent(redirect)}`} className="font-semibold text-sky-600 hover:text-sky-700">
                Sign in
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
