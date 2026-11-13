import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, Calendar, MapPin, QrCode, AlertCircle, Trash2 } from 'lucide-react';
import { api } from '../services/api';

export default function ParticipantDashboard() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadRegistrations();
  }, []);

  const loadRegistrations = async () => {
    setLoading(true);
    try {
      const data = await api.getMyRegistrations();
      setRegistrations(data);
    } catch (err) {
      setError(err.message || 'Failed to load registrations');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (regId) => {
    if (!window.confirm('Are you sure you want to cancel this registration?')) return;

    try {
      await api.cancelRegistration(regId);
      await loadRegistrations();
    } catch (err) {
      alert(err.message || 'Could not cancel registration');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">My Tickets & Passes</h1>
        <p className="text-xs text-slate-500 mt-1">Manage your event registrations and view QR entry codes</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 bg-white rounded-xl animate-pulse border border-slate-200" />
          ))}
        </div>
      ) : registrations.length > 0 ? (
        <div className="space-y-3">
          {registrations.map((reg) => {
            const isCancelled = reg.status === 'cancelled';
            const isCheckedIn = reg.is_checked_in;
            const startDate = new Date(reg.event.start_time);

            return (
              <div
                key={reg.id}
                className={`bg-white rounded-xl p-5 border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                  isCancelled ? 'opacity-60 border-slate-200 bg-slate-50' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Event info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    {isCheckedIn ? (
                      <span className="bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2.5 py-0.5 rounded">
                        ✓ Checked In
                      </span>
                    ) : isCancelled ? (
                      <span className="bg-slate-100 text-slate-600 text-[11px] font-semibold px-2.5 py-0.5 rounded">
                        Cancelled
                      </span>
                    ) : (
                      <span className="bg-sky-50 text-sky-700 text-[11px] font-semibold px-2.5 py-0.5 rounded">
                        Confirmed Pass
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400">
                      Booked {new Date(reg.registered_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    <Link to={`/events/${reg.event_id}`} className="hover:text-sky-600 transition">
                      {reg.event.title}
                    </Link>
                  </h3>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-sky-600" />
                      <span>{startDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-sky-600" />
                      <span>{reg.event.venue}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  {!isCancelled && (
                    <>
                      <Link
                        to={`/ticket/${reg.id}`}
                        className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1.5"
                      >
                        <QrCode className="w-3.5 h-3.5" /> View QR Pass
                      </Link>
                      <button
                        onClick={() => handleCancel(reg.id)}
                        title="Cancel Registration"
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl p-16 text-center border border-slate-200 shadow-sm">
          <Ticket className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-800 text-base">No Passes Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You haven't registered for any events yet. Explore upcoming events to reserve your spot!
          </p>
          <Link
            to="/events"
            className="mt-5 inline-block px-4 py-2 bg-sky-600 text-white text-xs font-semibold rounded-lg hover:bg-sky-700 transition"
          >
            Explore Events
          </Link>
        </div>
      )}
    </div>
  );
}
