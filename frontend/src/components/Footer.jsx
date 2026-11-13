import React from 'react';
import { Calendar, Shield, Zap, Sparkles } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200/80 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-700 via-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-purple-200">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-slate-900">EventHub</span>
              <p className="text-xs text-slate-400">Enterprise Event Management & QR Ticketing</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5 text-slate-600">
              <Shield className="w-3.5 h-3.5 text-purple-600" /> End-to-End Encrypted Tickets
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> Instant Venue QR Check-in
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Real-time Analytics
            </span>
          </div>

          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} EventHub. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
