import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, MapPin, CheckCircle2, Clock, ArrowLeft, Printer, AlertCircle, CreditCard, Mail, Download } from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function TicketViewPage() {
  const { id } = useParams();
  const { user } = useAuth();
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
        <div className="animate-spin w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full mx-auto" />
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center">
        <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Ticket Not Available</h2>
        <p className="text-xs text-slate-500 mt-1">{error || 'Unable to view ticket'}</p>
        <Link to="/events" className="mt-4 inline-block text-xs font-semibold text-sky-600 hover:text-sky-700">
          ← Back to Events
        </Link>
      </div>
    );
  }

  const startDate = new Date(ticket.start_time);

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-5 print:hidden">
        <Link
          to={user ? "/my-tickets" : "/events"}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="w-4 h-4" /> {user ? "My Passes" : "Back to Events"}
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-medium transition shadow-xs"
        >
          <Printer className="w-4 h-4" /> Print / Save Pass
        </button>
      </div>

      {/* Ticket Pass Container */}
      <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm">
        {/* Solid Sky Blue Header */}
        <div className="bg-sky-600 p-6 text-white text-center">
          <p className="text-xs font-medium text-sky-100 uppercase tracking-wider mb-1">Official Event Pass</p>
          <h2 className="text-xl font-bold">{ticket.event_title}</h2>
          
          <div className="mt-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-sky-700 text-white">
            {ticket.is_checked_in ? (
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Checked In
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> Valid for Entry
              </span>
            )}
          </div>
        </div>

        {/* QR Code Presentation */}
        <div className="p-6 text-center bg-slate-50 flex flex-col items-center justify-center border-b border-dashed border-slate-200">
          <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 inline-block mb-3">
            <img
              src={ticket.qr_code_image}
              alt="QR Attendance Code"
              className="w-48 h-48 object-contain"
            />
          </div>
          <p className="text-[11px] font-mono text-slate-400">
            {ticket.ticket_token.slice(0, 16)}••••••••
          </p>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            Present this QR pass on your phone to the organiser at the door.
          </p>
        </div>

        {/* Attendee Details */}
        <div className="p-6 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-100">
            <div>
              <p className="text-slate-400">Attendee Name</p>
              <p className="font-semibold text-slate-900 mt-0.5">{ticket.participant_name}</p>
            </div>
            <div>
              <p className="text-slate-400">Ticket ID</p>
              <p className="font-mono text-slate-700 text-[11px] mt-0.5">
                EH-{ticket.registration_id.slice(0, 8).toUpperCase()}
              </p>
            </div>
          </div>

          {ticket.attendee_email && (
            <div className="flex items-start gap-2.5 pb-2 border-b border-slate-100">
              <Mail className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900">{ticket.attendee_email}</p>
                <p className="text-slate-400 text-[11px]">Registered Email</p>
              </div>
            </div>
          )}

          <div className="flex items-start gap-2.5 pb-2 border-b border-slate-100">
            <CreditCard className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-900">
                {ticket.payment_status === 'paid' ? `Paid (₹${Number(ticket.amount_paid).toFixed(2)})` : 'Free Admission'}
              </p>
              <p className="text-slate-400 text-[11px]">Admission Status</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Calendar className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-900">
                {startDate.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <p className="text-slate-500">
                {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-slate-900">Venue</p>
              <p className="text-slate-500">{ticket.venue}</p>
            </div>
          </div>

          {ticket.is_checked_in && ticket.checked_in_at && (
            <div className="mt-3 p-2.5 bg-emerald-50 rounded-lg border border-emerald-100 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Checked in at {new Date(ticket.checked_in_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
