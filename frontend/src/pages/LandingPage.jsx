import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Calendar, ArrowRight, QrCode, ShieldCheck, BarChart3, Mail, Sparkles } from 'lucide-react';
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
      {/* Modern Sky Ambient Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-100/60 via-sky-50/30 to-white border-b border-slate-200/80 py-16 sm:py-24">
        {/* Soft atmospheric ambient glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-gradient-to-b from-sky-200/40 via-sky-100/20 to-transparent blur-3xl rounded-full" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Generalized Modern Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold text-sky-700 bg-sky-100/70 border border-sky-200/70 shadow-xs mb-5 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>Modern Event Management & Live QR Ticketing</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight mb-5">
            Discover, Host & Attend Events
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 mb-8 leading-relaxed">
            The intelligent platform for conferences, meetups, workshops, hackathons, and gatherings. Register in seconds with zero login friction and receive instant digital QR passes.
          </p>

          {/* Elevated Floating Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-xl mx-auto bg-white/95 backdrop-blur-sm p-2 rounded-2xl border border-slate-200/90 shadow-[0_10px_25px_-5px_rgba(2,132,199,0.08)] flex items-center gap-2 focus-within:border-sky-500 focus-within:ring-2 focus-within:ring-sky-100 transition-all"
          >
            <div className="flex-1 flex items-center pl-3">
              <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events, conferences, workshops, venues..."
                className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-xs sm:text-sm focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-xs hover:shadow transition-all"
            >
              Search
            </button>
          </form>

          {/* Category Chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === null
                  ? 'bg-sky-600 text-white shadow-xs ring-2 ring-sky-600/20'
                  : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80 shadow-xs'
              }`}
            >
              All Events
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.slug)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedCategory === c.slug
                    ? 'bg-sky-600 text-white font-semibold shadow-xs ring-2 ring-sky-600/20'
                    : 'bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80 shadow-xs'
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
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Upcoming Events</h2>
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
              <div key={n} className="bg-white rounded-2xl h-72 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-800 text-base">No events found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Check back soon or create your own event as an organiser.
            </p>
          </div>
        )}
      </section>

      {/* Modern KPI Cards - Matching Reference Layout with Centered Circular Icons */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50/50 via-sky-50/20 to-white border-t border-slate-200/80 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Intelligent Event Execution & Verification
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Empowering organizers and attendees worldwide with frictionless registrations, instant verified digital passes, and live venue check-ins.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1: Digital QR Passes */}
            <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:border-sky-200 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group">
              <div className="w-14 h-14 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-sky-100 transition-all duration-300 border border-sky-100/80 shadow-xs">
                <QrCode className="w-6 h-6 text-sky-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
                Digital QR Passes
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Every attendee receives a unique, cryptographically signed QR code ready to print or present on any smartphone.
              </p>
            </div>

            {/* Card 2: Fast Venue Check-in */}
            <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:border-sky-200 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group">
              <div className="w-14 h-14 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-sky-100 transition-all duration-300 border border-sky-100/80 shadow-xs">
                <ShieldCheck className="w-6 h-6 text-sky-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
                Fast Venue Check-in
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Scan passes at the door using your camera with sub-second response times. Duplicate scans are automatically blocked.
              </p>
            </div>

            {/* Card 3: Attendance Analytics */}
            <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:border-sky-200 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group">
              <div className="w-14 h-14 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-sky-100 transition-all duration-300 border border-sky-100/80 shadow-xs">
                <BarChart3 className="w-6 h-6 text-sky-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
                Attendance Analytics
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Monitor capacity utilization, registration trends, and real-time check-in stats with instant 1-click CSV attendee exports.
              </p>
            </div>

            {/* Card 4: Automated Email Delivery */}
            <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-xl hover:border-sky-200 hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group">
              <div className="w-14 h-14 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-sky-100 transition-all duration-300 border border-sky-100/80 shadow-xs">
                <Mail className="w-6 h-6 text-sky-600" />
              </div>
              <h3 className="text-base font-bold text-slate-800 group-hover:text-sky-600 transition-colors">
                Automated Email Delivery
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Official ticket passes with scannable QR codes are instantly dispatched directly to attendee inboxes without requiring an account.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
