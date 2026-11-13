import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, MapPin, Clock, Users, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    loadEvent();
  }, [id]);

  const loadEvent = async () => {
    setLoading(true);
    try {
      const data = await api.getEventDetail(id);
      setEvent(data);
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
      }, 1000);
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (error && !event) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Event Not Found</h2>
        <p className="text-xs text-slate-500 mt-2">{error}</p>
        <Link to="/events" className="mt-6 inline-block text-xs font-bold text-purple-600">
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
      <Link to="/events" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Back to all events
      </Link>

      <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-0">
        {/* Left 2 Cols: Details */}
        <div className="lg:col-span-2 p-6 sm:p-10">
          {event.banner_url && (
            <img
              src={event.banner_url}
              alt={event.title}
              className="w-full h-64 object-cover rounded-2xl mb-8 shadow-sm"
            />
          )}

          <div className="flex items-center gap-2 mb-4">
            {event.category && (
              <span className="bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">
                {event.category.name}
              </span>
            )}
            <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
              {event.status}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mb-4">
            {event.title}
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6 border-y border-slate-100 text-xs text-slate-600 mb-8">
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-purple-600 shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">Date & Time</p>
                <p>{startDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</p>
                <p>{startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5 text-purple-600 shrink-0" />
              <div>
                <p className="font-semibold text-slate-900">Location</p>
                <p className="font-medium text-slate-800">{event.venue}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 mb-3">About this Event</h3>
            <div className="prose prose-purple text-xs leading-relaxed text-slate-600 whitespace-pre-line">
              {event.description}
            </div>
          </div>

          {event.organiser && (
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                {event.organiser.full_name ? event.organiser.full_name.charAt(0).toUpperCase() : 'O'}
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-900">Organised by {event.organiser.full_name}</p>
                <p className="text-slate-400">Verified Organiser</p>
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Registration Card */}
        <div className="lg:border-l border-slate-100 bg-slate-50/50 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Admission</span>
            <div className="text-3xl font-extrabold text-slate-900 mt-1 mb-6">
              {Number(event.fee) === 0 ? 'Free Entry' : `₹${event.fee}`}
            </div>

            {/* Capacity Progress */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/60 mb-6 shadow-sm">
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-600 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-purple-600" /> Availability
                </span>
                <span className={isFull ? 'text-red-500 font-bold' : 'text-purple-700 font-bold'}>
                  {spotsLeft} of {event.capacity} left
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-purple-600'}`}
                  style={{ width: `${Math.min(100, ((event.registered_count || 0) / event.capacity) * 100)}%` }}
                />
              </div>
            </div>

            {/* Deadline status */}
            <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Registration ends: {deadline.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            {/* Notification Messages */}
            {error && (
              <div className="p-3 mb-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{success}</span>
              </div>
            )}
          </div>

          {/* Action CTA */}
          <div className="mt-8">
            {isDeadlinePassed ? (
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
                    Registering...
                  </>
                ) : (
                  'Register & Get Ticket'
                )}
              </button>
            )}

            <p className="text-[11px] text-center text-slate-400 mt-3">
              Instant digital QR pass issued upon registration.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
