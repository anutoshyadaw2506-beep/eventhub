import React from 'react';
import { Calendar } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 py-10 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded bg-sky-600 flex items-center justify-center text-white">
            <Calendar className="w-3.5 h-3.5" />
          </div>
          <span className="font-bold text-slate-900 text-sm">EventHub</span>
          <span>&copy; {new Date().getFullYear()} EventHub. All rights reserved.</span>
        </div>
        <div className="flex space-x-6 text-slate-400">
          <span>Digital QR Ticketing</span>
          <span>•</span>
          <span>Fast Check-in</span>
          <span>•</span>
          <span>Live Analytics</span>
        </div>
      </div>
    </footer>
  );
}
