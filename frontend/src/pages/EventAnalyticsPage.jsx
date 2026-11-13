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
        <div className="animate-spin w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Analytics Unavailable</h2>
        <p className="text-xs text-slate-500 mt-1">{error}</p>
        <Link to="/organiser" className="mt-4 inline-block text-xs font-semibold text-sky-600 hover:text-sky-700">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/organiser" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded">
            Attendance Insights
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1.5">{analytics.title}</h1>
          <p className="text-xs text-slate-500 mt-1">Real-time attendance tracking and capacity analysis</p>
        </div>

        <button
          onClick={handleExportCSV}
          disabled={downloading}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold transition"
        >
          <Download className="w-4 h-4" /> {downloading ? 'Exporting...' : 'Export Attendee CSV'}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-sky-600" /> Registrations
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1.5">{analytics.registrations}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Capacity: {analytics.capacity}</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Checked In
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1.5 text-emerald-600">{analytics.checked_in}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Verified at door</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <UserX className="w-3.5 h-3.5 text-amber-600" /> No-Shows
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1.5 text-amber-600">{analytics.no_shows}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Not arrived yet</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-sky-600" /> Attendance Rate
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1.5 text-sky-700">
            {analytics.attendance_rate}%
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Checked in ÷ Registered</p>
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm col-span-2 lg:col-span-1">
          <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5">
            <BarChart3 className="w-3.5 h-3.5 text-sky-600" /> Capacity Filled
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1.5 text-sky-700">
            {analytics.capacity_utilisation}%
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">Registrations ÷ Capacity</p>
        </div>
      </div>

      {/* Participants Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Participant Roster</h2>
          <span className="text-xs text-slate-500">{participants.length} total attendees</span>
        </div>

        {participants.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4">Participant</th>
                  <th className="py-2.5 px-4">Registration Date</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4">Check-In Status</th>
                  <th className="py-2.5 px-4">Check-In Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {participants.map((p) => (
                  <tr key={p.registration_id} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900">{p.participant_name}</td>
                    <td className="py-3 px-4 text-slate-500">
                      {new Date(p.registered_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[10px] font-medium uppercase">
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {p.is_checked_in ? (
                        <span className="bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                          ✓ Checked In
                        </span>
                      ) : (
                        <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-[10px] font-semibold">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {p.checked_in_at ? new Date(p.checked_in_at).toLocaleTimeString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-10 text-center text-xs text-slate-400">
            No participants have registered for this event yet.
          </div>
        )}
      </div>
    </div>
  );
}
