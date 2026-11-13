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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900">My Tickets & Passes</h1>
        <p className="text-xs text-slate-500 mt-1">Manage your event registrations and digital QR tickets</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl animate-pulse border border-slate-100" />
          ))}
        </div>
      ) : registrations.length > 0 ? (
        <div className="space-y-4">
          {registrations.map((reg) => {
            const isCancelled = reg.status === 'cancelled';
            const isCheckedIn = reg.is_checked_in;
            const startDate = new Date(reg.event.start_time);

            return (
              <div
                key={reg.id}
                className={`bg-white rounded-2xl p-6 border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm hover:shadow-md ${
                  isCancelled ? 'opacity-60 border-slate-200' : 'border-slate-100 hover:border-purple-200'
                }`}
              >
                {/* Event info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {isCheckedIn ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                        ✓ Checked In
                      </span>
                    ) : isCancelled ? (
                      <span className="bg-slate-200 text-slate-600 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                        Cancelled
                      </span>
                    ) : (
                      <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                        Confirmed Entry
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400">
                      Registered on {new Date(reg.registered_at).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900 mb-2">
                    <Link to={`/events/${reg.event_id}`} className="hover:text-purple-600 transition">
                      {reg.event.title}
                    </Link>
                  </h3>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-purple-600" />
                      <span>{startDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-purple-600" />
                      <span>{reg.event.venue}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                  {!isCancelled && (
                    <>
                      <Link
                        to={`/ticket/${reg.id}`}
                        className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-sm shadow-purple-600/30 flex items-center gap-1.5"
                      >
                        <QrCode className="w-4 h-4" /> View QR Ticket
                      </Link>
                      <button
                        onClick={() => handleCancel(reg.id)}
                        title="Cancel Registration"
                        className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
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
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-100 shadow-sm">
          <Ticket className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-lg">No Tickets Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You haven't registered for any events yet. Check out upcoming events and reserve your spot!
          </p>
          <Link
            to="/events"
            className="mt-6 inline-block px-5 py-2.5 bg-purple-600 text-white text-xs font-bold rounded-xl hover:bg-purple-700 transition"
          >
            Explore Events
          </Link>
        </div>
      )}
    </div>
  );
}
