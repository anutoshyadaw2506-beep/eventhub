import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, CheckCircle2, Clock, ArrowLeft, Printer, AlertCircle } from 'lucide-react';
import { api } from '../services/api';

export default function TicketViewPage() {
  const { id } = useParams();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTicket();
  }, [id]);

  const loadTicket = async () => {
    setLoading(true);
    try {
      const data = await api.getTicket(id);
      setTicket(data);
    } catch (err) {
      setError(err.message || 'Failed to load ticket');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <div className="animate-spin w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-slate-800">Ticket Not Available</h2>
        <p className="text-xs text-slate-500 mt-2">{error || 'Unable to view ticket'}</p>
        <Link to="/my-tickets" className="mt-6 inline-block text-xs font-bold text-purple-600">
          ← Back to My Tickets
        </Link>
      </div>
    );
  }

  const startDate = new Date(ticket.start_time);

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <Link to="/my-tickets" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition">
          <ArrowLeft className="w-4 h-4" /> My Tickets
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition"
        >
          <Printer className="w-4 h-4" /> Print / Save Pass
        </button>
      </div>

      {/* Ticket Card Container */}
      <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-xl">
        {/* Header gradient banner */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-800 p-6 text-white text-center relative">
          <p className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-1">Official Event Pass</p>
          <h2 className="text-2xl font-extrabold tracking-tight">{ticket.event_title}</h2>
          
          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md">
            {ticket.is_checked_in ? (
              <span className="text-emerald-300 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Checked In
              </span>
            ) : (
              <span className="text-purple-200 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Valid for Entry
              </span>
            )}
          </div>
        </div>

        {/* QR Code Presentation */}
        <div className="p-8 text-center bg-slate-50/50 flex flex-col items-center justify-center border-b border-dashed border-slate-200 relative">
          <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-100 inline-block mb-3">
            <img
              src={ticket.qr_code_image}
              alt="QR Attendance Code"
              className="w-56 h-56 object-contain"
            />
          </div>
          <p className="text-[11px] font-mono font-medium text-slate-400">
            {ticket.ticket_token.slice(0, 15)}••••••••
          </p>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            Present this code to the event organiser at the venue entrance.
          </p>
        </div>

        {/* Attendee & Event Metadata */}
        <div className="p-6 sm:p-8 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
            <div>
              <p className="text-slate-400 font-medium">Attendee</p>
              <p className="font-bold text-slate-900 text-sm mt-0.5">{ticket.participant_name}</p>
            </div>
            <div>
              <p className="text-slate-400 font-medium">Ticket ID</p>
              <p className="font-mono font-semibold text-slate-700 text-xs mt-0.5">
                EH-{ticket.registration_id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">
                {startDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-slate-500">
                {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900">Venue</p>
              <p className="text-slate-500">{ticket.venue}</p>
            </div>
          </div>

          {ticket.is_checked_in && ticket.checked_in_at && (
            <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Checked in at {new Date(ticket.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
