import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { ArrowLeft, CheckCircle2, XCircle, QrCode, Keyboard } from 'lucide-react';
import { api } from '../services/api';

export default function CheckInScannerPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [manualToken, setManualToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [useManual, setUseManual] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    loadEvent();
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const data = await api.getEventDetail(eventId);
      setEvent(data);
    } catch (err) {
      console.error(err);
    }
  };

  const processCheckIn = async (token) => {
    if (!token || loading) return;
    setLoading(true);
    setScanResult(null);

    try {
      const res = await api.checkInScan(eventId, token);
      setScanResult({
        success: true,
        message: res.message,
        name: res.participant_name,
        time: new Date(res.checked_in_at).toLocaleTimeString(),
      });
    } catch (err) {
      setScanResult({
        success: false,
        message: err.message || 'Check-in validation failed',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!useManual && !scannerRef.current) {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        false
      );

      scanner.render(
        (decodedText) => {
          processCheckIn(decodedText);
        },
        () => {}
      );

      scannerRef.current = scanner;
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
        scannerRef.current = null;
      }
    };
  }, [useManual]);

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (manualToken.trim()) {
      processCheckIn(manualToken.trim());
      setManualToken('');
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-8">
      <Link to="/organiser" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="bg-white rounded-xl p-6 sm:p-8 border border-slate-200 shadow-sm text-center">
        <div className="mb-6">
          <span className="text-[11px] font-semibold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded">
            Venue Check-in Station
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
            {event?.title || 'Scan QR Tickets'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Scan attendee ticket pass or enter token manually
          </p>
        </div>

        {/* Status / Feedback Banner */}
        {scanResult && (
          <div
            className={`p-4 rounded-lg mb-6 text-left flex items-start gap-3 ${
              scanResult.success
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {scanResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <XCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            )}
            <div className="text-xs flex-1">
              <p className="font-bold text-sm">
                {scanResult.success ? 'Entry Approved' : 'Entry Rejected'}
              </p>
              <p className="mt-0.5">{scanResult.message}</p>
              {scanResult.name && (
                <p className="mt-1 font-semibold text-emerald-900">
                  Attendee: {scanResult.name} ({scanResult.time})
                </p>
              )}
            </div>
          </div>
        )}

        {/* Toggle Mode */}
        <div className="flex justify-center gap-2 mb-6">
          <button
            onClick={() => setUseManual(false)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              !useManual ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" /> Camera Scanner
          </button>
          <button
            onClick={() => setUseManual(true)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
              useManual ? 'bg-sky-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" /> Manual Entry
          </button>
        </div>

        {/* Scanner Viewport */}
        {!useManual ? (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-2">
            <div id="qr-reader" className="w-full" />
            <p className="text-[11px] text-slate-400 mt-2 py-1">
              Position the QR code within the frame to scan
            </p>
          </div>
        ) : (
          <form onSubmit={handleManualSubmit} className="p-5 bg-slate-50 rounded-lg border border-slate-200 space-y-3.5">
            <div className="text-left">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Enter Ticket Token
              </label>
              <input
                type="text"
                required
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                placeholder="e.g. TK-vQ8b7z..."
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs rounded-lg transition"
            >
              {loading ? 'Validating...' : 'Validate Ticket'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
