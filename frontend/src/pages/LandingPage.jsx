import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Calendar, ArrowRight, QrCode, ShieldCheck, BarChart3 } from 'lucide-react';
import { api } from '../services/api';
import EventCard from '../components/EventCard';

export default function LandingPage() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cats, evts] = await Promise.all([
        api.getCategories(),
        api.getEvents({ category_slug: selectedCategory, search: search || undefined })
      ]);
      setCategories(cats);
      setEvents(evts);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/events?search=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/events');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Clean White Hero Section */}
      <section className="bg-white border-b border-slate-200 py-16 sm:py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-block text-xs font-semibold uppercase tracking-wider text-sky-700 bg-sky-50 px-3 py-1 rounded-full mb-4">
            Campus Event Platform
          </span>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Discover & Attend Events
          </h1>

          <p className="max-w-xl mx-auto text-base text-slate-600 mb-8">
            Browse campus workshops, hackathons, and sports events. Register in seconds and receive your digital QR pass.
          </p>

          {/* Simple Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-xl mx-auto bg-white p-1.5 rounded-xl border border-slate-300 shadow-sm flex items-center gap-2 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500 transition"
          >
            <div className="flex-1 flex items-center pl-3">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events, workshops, or venues..."
                className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs sm:text-sm px-5 py-2.5 rounded-lg transition"
            >
              Search
            </button>
          </form>

          {/* Category Chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                selectedCategory === null
                  ? 'bg-sky-600 text-white font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All Events
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.slug)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition ${
                  selectedCategory === c.slug
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Events Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Upcoming Events</h2>
            <p className="text-xs text-slate-500 mt-0.5">Explore available events and reserve your spot</p>
          </div>
          <Link
            to="/events"
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-xl h-72 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center border border-slate-200 shadow-sm">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-800 text-base">No events found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Check back soon or create your own event as an organiser.
            </p>
          </div>
        )}
      </section>

      {/* 3 Simple Value Points */}
      <section className="bg-white border-t border-slate-200 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center sm:text-left">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Digital QR Passes</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Every attendee receives a unique, verified QR code ready to print or present from any phone.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Fast Venue Check-in</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Scan passes at the door using your camera. Duplicate scans are automatically prevented.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Attendance Analytics</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Monitor capacity utilization and attendee check-ins in real time, with 1-click CSV export.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
