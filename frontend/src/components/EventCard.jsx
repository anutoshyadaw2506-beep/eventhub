import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRight } from 'lucide-react';

export default function EventCard({ event }) {
  const startDate = new Date(event.start_time);
  const formattedDate = startDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = startDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  const spotsLeft = Math.max(0, event.capacity - (event.registered_count || 0));
  const isFull = spotsLeft === 0;

  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all duration-300 flex flex-col group">
      {/* Banner */}
      <div className="relative h-44 w-full bg-slate-900 overflow-hidden">
        {event.banner_url ? (
          <img
            src={event.banner_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-purple-900 via-indigo-800 to-slate-900 flex items-center justify-center p-6 text-center">
            <span className="text-white/80 font-bold text-lg">{event.title}</span>
          </div>
        )}

        {/* Category Pill */}
        {event.category && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-purple-700 font-bold text-xs px-2.5 py-1 rounded-full shadow-sm">
            {event.category.name}
          </span>
        )}

        {/* Capacity / Status Badge */}
        <div className="absolute top-3 right-3">
          {isFull ? (
            <span className="bg-red-500/90 backdrop-blur-md text-white font-bold text-xs px-2.5 py-1 rounded-full">
              Full
            </span>
          ) : (
            <span className="bg-emerald-500/90 backdrop-blur-md text-white font-semibold text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
              <Users className="w-3 h-3" /> {spotsLeft} left
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col">
        <h3 className="font-bold text-slate-900 text-lg group-hover:text-purple-600 transition-colors line-clamp-1 mb-2">
          {event.title}
        </h3>

        <div className="space-y-2 text-xs text-slate-500 mb-4 flex-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-500 shrink-0" />
            <span>{formattedDate} • {formattedTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-purple-500 shrink-0" />
            <span className="line-clamp-1">{event.venue}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <span className="text-sm font-bold text-purple-700">
            {Number(event.fee) === 0 ? 'Free Entry' : `₹${event.fee}`}
          </span>
          <Link
            to={`/events/${event.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-600 hover:text-purple-700 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-lg transition"
          >
            Details <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
