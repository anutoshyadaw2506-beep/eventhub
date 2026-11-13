import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users } from 'lucide-react';

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
    <div className="bg-white rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:border-slate-300 transition flex flex-col">
      {/* Banner */}
      <div className="relative h-44 w-full bg-slate-100 overflow-hidden">
        {event.banner_url ? (
          <img
            src={event.banner_url}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-200 flex items-center justify-center p-4 text-center">
            <span className="text-slate-600 font-semibold text-sm">{event.title}</span>
          </div>
        )}

        {/* Category Badge */}
        {event.category && (
          <span className="absolute top-3 left-3 bg-white text-sky-700 font-semibold text-xs px-2.5 py-0.5 rounded shadow-sm">
            {event.category.name}
          </span>
        )}

        {/* Capacity / Status Badge */}
        <div className="absolute top-3 right-3">
          {isFull ? (
            <span className="bg-red-600 text-white font-semibold text-xs px-2.5 py-0.5 rounded">
              Full
            </span>
          ) : (
            <span className="bg-white text-slate-700 font-medium text-xs px-2.5 py-0.5 rounded shadow-sm flex items-center gap-1">
              <Users className="w-3 h-3 text-slate-500" /> {spotsLeft} spots left
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-slate-900 text-base line-clamp-1 mb-2">
            {event.title}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mb-4">
            {event.description}
          </p>

          <div className="space-y-1.5 text-xs text-slate-500 mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-600 shrink-0" />
              <span>{formattedDate} • {formattedTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
              <span className="line-clamp-1">{event.venue}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
          <span className="text-sm font-bold text-slate-900">
            {Number(event.fee) === 0 ? 'Free' : `₹${event.fee}`}
          </span>
          <Link
            to={`/events/${event.id}`}
            className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold rounded-lg transition"
          >
            View Event
          </Link>
        </div>
      </div>
    </div>
  );
}
