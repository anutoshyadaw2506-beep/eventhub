import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, ArrowRight, Sparkles } from 'lucide-react';

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
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-xl hover:border-purple-300/80 hover:-translate-y-1 transition-all duration-300 flex flex-col group">
      {/* Banner Area */}
      <div className="relative h-48 w-full bg-slate-950 overflow-hidden">
        {event.banner_url ? (
          <img
            src={event.banner_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-purple-950 via-slate-900 to-indigo-950 flex items-center justify-center p-6 text-center">
            <span className="text-white/80 font-bold text-lg">{event.title}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

        {/* Category Badge */}
        {event.category && (
          <div className="absolute top-3.5 left-3.5">
            <span className="bg-slate-900/80 backdrop-blur-md text-white border border-white/10 font-bold text-[11px] px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" /> {event.category.name}
            </span>
          </div>
        )}

        {/* Capacity / Availability Badge */}
        <div className="absolute top-3.5 right-3.5">
          {isFull ? (
            <span className="bg-rose-500/95 backdrop-blur-md text-white font-bold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
              Sold Out
            </span>
          ) : (
            <span className="bg-emerald-500/90 backdrop-blur-md text-white font-semibold text-[11px] px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
              <Users className="w-3 h-3" /> {spotsLeft} left
            </span>
          )}
        </div>

        {/* Date overlay at bottom of banner */}
        <div className="absolute bottom-3 left-3.5 text-white text-xs font-semibold flex items-center gap-1.5 drop-shadow">
          <Calendar className="w-3.5 h-3.5 text-purple-300" />
          <span>{formattedDate} • {formattedTime}</span>
        </div>
      </div>

      {/* Body Area */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-extrabold text-slate-900 text-lg group-hover:text-purple-600 transition-colors line-clamp-1 mb-2 tracking-tight">
            {event.title}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
            {event.description}
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-600 mb-5">
            <MapPin className="w-4 h-4 text-purple-500 shrink-0" />
            <span className="line-clamp-1 font-medium text-slate-700">{event.venue}</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-auto">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Admission</span>
            <span className="text-sm font-extrabold text-slate-900">
              {Number(event.fee) === 0 ? 'Free Entry' : `₹${event.fee}`}
            </span>
          </div>

          <Link
            to={`/events/${event.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl transition shadow-sm shadow-purple-600/20 group-hover:shadow-md"
          >
            Get Pass <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
