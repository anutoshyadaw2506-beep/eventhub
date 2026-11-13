import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, Users, CheckCircle2, UserX, Percent, BarChart3, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function EventAnalyticsPage() {
  const { eventId } = useParams();
  const [analytics, setAnalytics] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadData();
  }, [eventId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsData, participantsData] = await Promise.all([
        api.getEventAnalytics(eventId),
        api.getEventParticipants(eventId, 'json'),
      ]);
      setAnalytics(analyticsData);
      setParticipants(participantsData);
    } catch (err) {
      setError(err.message || 'Failed to load event analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setDownloading(true);
    try {
      const blob = await api.getEventParticipants(eventId, 'csv');
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `participants_${eventId}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download CSV: ' + err.message);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Analytics Unavailable</h2>
        <p className="text-xs text-slate-500 mt-2">{error}</p>
        <Link to="/organiser" className="mt-6 inline-block text-xs font-bold text-purple-600">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/organiser" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-2.5 py-1 rounded-full">
            Attendance & Insights
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-2">{analytics.title}</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time attendance tracking and capacity analysis</p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={downloading}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          <Download className="w-4 h-4" /> {downloading ? 'Exporting...' : 'Export Attendee CSV'}
        </button>
      </div>

      {/* Analytics KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-purple-600" /> Registrations
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{analytics.registrations}</p>
          <p className="text-[10px] text-slate-500 mt-1">Capacity: {analytics.capacity}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Checked In
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 text-emerald-600">{analytics.checked_in}</p>
          <p className="text-[10px] text-slate-500 mt-1">Verified at entrance</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <UserX className="w-3.5 h-3.5 text-amber-600" /> No-Shows
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 text-amber-600">{analytics.no_shows}</p>
          <p className="text-[10px] text-slate-500 mt-1">Registered but not arrived</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-indigo-600" /> Attendance Rate
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 text-indigo-600">
            {analytics.attendance_rate}%
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Checked in ÷ Registered</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm col-span-2 lg:col-span-1">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-purple-600" /> Capacity Filled
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-2 text-purple-700">
            {analytics.capacity_utilisation}%
          </p>
          <p className="text-[10px] text-slate-500 mt-1">Registrations ÷ Capacity</p>
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Participant Roster</h2>
          <span className="text-xs text-slate-500">{participants.length} total attendees registered</span>
        </div>

        {participants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-6">Participant</th>
                  <th className="py-3 px-6">Registration Date</th>
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-6">Check-In Status</th>
                  <th className="py-3 px-6">Check-In Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {participants.map((p) => (
                  <tr key={p.registration_id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-bold text-slate-900">{p.participant_name}</td>
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(p.registered_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-4 px-6">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {p.is_checked_in ? (
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          ✓ Checked In
                        </span>
                      ) : (
                        <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-slate-500 font-mono text-[11px]">
                      {p.checked_in_at ? new Date(p.checked_in_at).toLocaleTimeString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center text-xs text-slate-400">
            No participants have registered for this event yet.
          </div>
        )}
      </div>
    </div>
  );
}
