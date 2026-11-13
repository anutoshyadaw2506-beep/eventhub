import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, ArrowLeft, CheckCircle2, AlertCircle, QrCode, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [existingRegistration, setExistingRegistration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadEventAndRegistration();
  }, [id, user]);

  const loadEventAndRegistration = async () => {
    setLoading(true);
    try {
      const data = await api.getEventDetail(id);
      setEvent(data);

      if (user) {
        const myRegs = await api.getMyRegistrations();
        const found = myRegs.find((r) => r.event_id === id && r.status === 'confirmed');
        if (found) {
          setExistingRegistration(found);
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load event details');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      navigate(`/login?redirect=/events/${id}`);
      return;
    }

    setRegistering(true);
    setError(null);
    setSuccess(null);

    try {
      const reg = await api.registerForEvent(id);
      setSuccess('Registration confirmed! Generating your digital QR ticket...');
      setTimeout(() => {
        navigate(`/ticket/${reg.id}`);
      }, 800);
    } catch (err) {
      if (err.message && err.message.toLowerCase().includes('already registered')) {
        // If already registered, refresh to find the registration
        const myRegs = await api.getMyRegistrations();
        const found = myRegs.find((r) => r.event_id === id && r.status === 'confirmed');
        if (found) {
          setExistingRegistration(found);
          setError(null);
          return;
        }
      }
      setError(err.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-24 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Event Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">{error}</p>
        <Link to="/events" className="mt-6 inline-block text-xs font-bold text-purple-600 hover:text-purple-700">
          ← Back to Events
        </Link>
      </div>
    );
  }

  const startDate = new Date(event.start_time);
  const endDate = new Date(event.end_time);
  const deadline = new Date(event.registration_deadline);
  const isDeadlinePassed = new Date() > deadline;
  const spotsLeft = Math.max(0, event.capacity - (event.registered_count || 0));
  const isFull = spotsLeft === 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/events" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Back to all events
      </Link>

      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* Left 2 Columns: Main Details */}
        <div className="lg:col-span-2 p-6 sm:p-10">
          {event.banner_url && (
            <div className="relative rounded-2xl overflow-hidden mb-8 shadow-sm">
              <img
                src={event.banner_url}
                alt={event.title}
                className="w-full h-72 sm:h-80 object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white text-xs font-bold">
                <span className="bg-slate-900/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" /> {event.category?.name || 'Event'}
                </span>
                <span className="bg-emerald-500/90 backdrop-blur-md px-3 py-1 rounded-full">
                  {spotsLeft} Spots Available
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 mb-3">
            <span className="bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">
              {event.category?.name || 'General'}
            </span>
            <span className="bg-slate-100 text-slate-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              {event.status}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            {event.title}
          </h1>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-y border-slate-100 text-xs text-slate-600 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Date & Time</p>
                <p className="text-slate-600">{startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                <p className="text-slate-500">{startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-slate-900">Venue Location</p>
                <p className="font-medium text-slate-800">{event.venue}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-extrabold text-slate-900 mb-3">About This Event</h3>
            <div className="text-xs leading-relaxed text-slate-600 whitespace-pre-line space-y-3 font-normal">
              {event.description}
            </div>
          </div>

          {/* Organiser Card */}
          {event.organiser && (
            <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center font-extrabold text-sm shadow-sm">
                  {event.organiser.full_name ? event.organiser.full_name.charAt(0).toUpperCase() : 'O'}
                </div>
                <div className="text-xs">
                  <p className="font-bold text-slate-900">{event.organiser.full_name}</p>
                  <p className="text-slate-400">Verified Event Organiser</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-purple-600 bg-purple-50 px-2.5 py-1 rounded-lg">
                Host
              </span>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Booking / Pass Widget */}
        <div className="lg:border-l border-slate-100 bg-slate-50/60 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Admission Pricing</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1 mb-6">
              {Number(event.fee) === 0 ? 'Free Entry' : `₹${event.fee}`}
            </div>

            {/* Capacity Progress Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 mb-6 shadow-sm">
              <div className="flex justify-between text-xs font-bold mb-2">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-600" /> Availability
                </span>
                <span className={isFull ? 'text-rose-500 font-extrabold' : 'text-purple-700 font-extrabold'}>
                  {spotsLeft} of {event.capacity} left
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${isFull ? 'bg-rose-500' : 'bg-purple-600'}`}
                  style={{ width: `${Math.min(100, ((event.registered_count || 0) / event.capacity) * 100)}%` }}
                />
              </div>
            </div>

            {/* Registration Deadline Alert */}
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
              <Clock className="w-4 h-4 text-purple-500 shrink-0" />
              <span>Registration closes: {deadline.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            {/* Alerts */}
            {error && (
              <div className="p-3 mb-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Already Registered Box */}
            {existingRegistration && (
              <div className="p-4 mb-6 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>You have an active pass!</span>
                </div>
                <p className="text-[11px] text-emerald-700 mb-3">
                  Your seat is reserved. Present your digital QR pass at the entrance.
                </p>
                <Link
                  to={`/ticket/${existingRegistration.id}`}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <QrCode className="w-4 h-4" /> View My Digital Pass
                </Link>
              </div>
            )}
          </div>

          {/* Action CTA */}
          <div className="mt-8">
            {existingRegistration ? (
              <Link
                to={`/ticket/${existingRegistration.id}`}
                className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" /> Open My QR Pass <ArrowRight className="w-4 h-4" />
              </Link>
            ) : isDeadlinePassed ? (
              <button disabled className="w-full py-3.5 px-4 bg-slate-200 text-slate-500 text-xs font-bold rounded-xl cursor-not-allowed">
                Registration Closed
              </button>
            ) : isFull ? (
              <button disabled className="w-full py-3.5 px-4 bg-slate-200 text-slate-500 text-xs font-bold rounded-xl cursor-not-allowed">
                Event Sold Out
              </button>
            ) : (
              <button
                onClick={handleRegister}
                disabled={registering}
                className="w-full py-3.5 px-4 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/30 transition flex items-center justify-center gap-2"
              >
                {registering ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Issuing Pass...
                  </>
                ) : (
                  <>
                    Reserve Spot & Get QR Pass <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}

            <div className="mt-4 pt-4 border-t border-slate-200/80 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              <span>Instant tamper-proof digital QR pass</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
