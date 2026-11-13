import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, ArrowLeft, CheckCircle2, AlertCircle, QrCode, Shield, ArrowRight } from 'lucide-react';
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
        <div className="animate-spin w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-slate-900">Event Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <Link to="/events" className="mt-5 inline-block text-xs font-semibold text-sky-600 hover:text-sky-700">
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/events" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Back to all events
      </Link>

      <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* Left 2 Columns: Main Details */}
        <div className="lg:col-span-2 p-6 sm:p-8">
          {event.banner_url && (
            <div className="relative rounded-lg overflow-hidden mb-6 bg-slate-100">
              <img
                src={event.banner_url}
                alt={event.title}
                className="w-full h-64 sm:h-72 object-cover"
              />
            </div>
          )}

          <div className="flex items-center gap-2 mb-3">
            <span className="bg-sky-50 text-sky-700 text-xs font-semibold px-2.5 py-0.5 rounded">
              {event.category?.name || 'General'}
            </span>
            <span className="bg-slate-100 text-slate-700 text-xs font-medium px-2 py-0.5 rounded uppercase">
              {event.status}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mb-4">
            {event.title}
          </h1>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-5 border-y border-slate-100 text-xs text-slate-600 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Date & Time</p>
                <p className="text-slate-600">{startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                <p className="text-slate-500">{startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Location</p>
                <p className="text-slate-700">{event.venue}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">About this event</h3>
            <div className="text-xs leading-relaxed text-slate-600 whitespace-pre-line space-y-2">
              {event.description}
            </div>
          </div>

          {/* Organiser */}
          {event.organiser && (
            <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs">
                  {event.organiser.full_name ? event.organiser.full_name.charAt(0).toUpperCase() : 'O'}
                </div>
                <div className="text-xs">
                  <p className="font-semibold text-slate-900">{event.organiser.full_name}</p>
                  <p className="text-slate-400">Event Organiser</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Pass Widget */}
        <div className="lg:border-l border-slate-100 bg-slate-50/70 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <span className="text-xs text-slate-500 font-medium block">Admission</span>
            <div className="text-2xl font-bold text-slate-900 mt-1 mb-5">
              {Number(event.fee) === 0 ? 'Free Entry' : `₹${event.fee}`}
            </div>

            {/* Capacity Status */}
            <div className="bg-white p-3.5 rounded-lg border border-slate-200 mb-5">
              <div className="flex justify-between text-xs font-medium mb-1.5">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-sky-600" /> Availability
                </span>
                <span className={isFull ? 'text-red-600 font-semibold' : 'text-sky-700 font-semibold'}>
                  {spotsLeft} of {event.capacity} left
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full ${isFull ? 'bg-red-500' : 'bg-sky-600'}`}
                  style={{ width: `${Math.min(100, ((event.registered_count || 0) / event.capacity) * 100)}%` }}
                />
              </div>
            </div>

            {/* Registration Deadline Alert */}
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-5">
              <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Closes {deadline.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            {/* Alerts */}
            {error && (
              <div className="p-3 mb-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 mb-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}

            {/* Already Registered Box */}
            {existingRegistration && (
              <div className="p-3.5 mb-5 bg-sky-50 border border-sky-200 rounded-lg">
                <div className="flex items-center gap-1.5 text-sky-800 font-semibold text-xs mb-1">
                  <CheckCircle2 className="w-4 h-4 text-sky-600" />
                  <span>You have an active registration!</span>
                </div>
                <p className="text-xs text-sky-700 mb-2.5">
                  Your spot is confirmed. Present your QR pass at check-in.
                </p>
                <Link
                  to={`/ticket/${existingRegistration.id}`}
                  className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs rounded-md transition flex items-center justify-center gap-1.5"
                >
                  <QrCode className="w-3.5 h-3.5" /> View QR Pass
                </Link>
              </div>
            )}
          </div>

          {/* Action CTA */}
          <div className="mt-6">
            {existingRegistration ? (
              <Link
                to={`/ticket/${existingRegistration.id}`}
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg transition flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" /> Open My Pass
              </Link>
            ) : isDeadlinePassed ? (
              <button disabled className="w-full py-2.5 px-4 bg-slate-200 text-slate-500 text-xs font-semibold rounded-lg cursor-not-allowed">
                Registration Closed
              </button>
            ) : isFull ? (
              <button disabled className="w-full py-2.5 px-4 bg-slate-200 text-slate-500 text-xs font-semibold rounded-lg cursor-not-allowed">
                Event Full
              </button>
            ) : (
              <button
                onClick={handleRegister}
                disabled={registering}
                className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg transition shadow-sm flex items-center justify-center gap-2"
              >
                {registering ? 'Processing...' : 'Register for Event'}
              </button>
            )}

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <Shield className="w-3.5 h-3.5 text-slate-400" />
              <span>Instant digital QR pass issued</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
