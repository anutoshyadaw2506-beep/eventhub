import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, QrCode, BarChart3, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api';

export default function OrganiserDashboard() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadOrganisedEvents();
  }, []);

  const loadOrganisedEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getMyOrganisedEvents();
      setEvents(data);
    } catch (err) {
      setError(err.message || 'Failed to load organiser events');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (eventId) => {
    try {
      await api.publishEvent(eventId);
      await loadOrganisedEvents();
    } catch (err) {
      alert(err.message || 'Failed to publish event');
    }
  };

  const totalRegistrations = events.reduce((acc, curr) => acc + (curr.registered_count || 0), 0);
  const publishedCount = events.filter((e) => e.status === 'published').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Organiser Dashboard</h1>
          <p className="text-xs text-slate-500 mt-1">Manage events, monitor live registrations and verify attendee tickets</p>
        </div>
        <Link
          to="/organiser/create"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-purple-600/20"
        >
          <Plus className="w-4 h-4" /> Create New Event
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Hosted Events</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{events.length}</p>
          <p className="text-[11px] text-purple-600 font-semibold mt-1">{publishedCount} active & published</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Registrations</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">{totalRegistrations}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Across all events</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Capacity</p>
          <p className="text-3xl font-extrabold text-slate-900 mt-2">
            {events.length > 0 ? Math.round(events.reduce((a, b) => a + b.capacity, 0) / events.length) : 0}
          </p>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">Seats per event</p>
        </div>
      </div>

      {/* Events Table / List */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Your Events</h2>
          <span className="text-xs text-slate-500">{events.length} total</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading your events...</div>
        ) : events.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {events.map((evt) => (
              <div key={evt.id} className="p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 hover:bg-slate-50/50 transition">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        evt.status === 'published'
                          ? 'bg-emerald-100 text-emerald-800'
                          : evt.status === 'draft'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {evt.status}
                    </span>
                    {evt.category && (
                      <span className="text-xs font-medium text-slate-500">
                        • {evt.category.name}
                      </span>
                    )}
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    <Link to={`/events/${evt.id}`} className="hover:text-purple-600 transition">
                      {evt.title}
                    </Link>
                  </h3>

                  <div className="flex flex-wrap gap-4 text-xs text-slate-500 mt-2">
                    <span>{new Date(evt.start_time).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    <span>•</span>
                    <span>{evt.venue}</span>
                    <span>•</span>
                    <span className="font-semibold text-purple-700">
                      {evt.registered_count || 0} / {evt.capacity} registered
                    </span>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
                  {evt.status === 'draft' && (
                    <button
                      onClick={() => handlePublish(evt.id)}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Publish
                    </button>
                  )}

                  <Link
                    to={`/organiser/scan/${evt.id}`}
                    className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-purple-600/20"
                  >
                    <QrCode className="w-3.5 h-3.5" /> Scan QR
                  </Link>

                  <Link
                    to={`/organiser/analytics/${evt.id}`}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-slate-600" /> Analytics & CSV
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-500">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="font-bold text-slate-700">You haven't created any events yet</p>
            <Link
              to="/organiser/create"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Create Your First Event
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
