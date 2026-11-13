import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Sparkles, Calendar, ArrowRight, QrCode, ShieldCheck, BarChart3, Zap, CheckCircle2 } from 'lucide-react';
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
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950 text-white pt-24 pb-20 sm:pt-32 sm:pb-28">
        {/* Glow & Grid Accents */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-600/20 via-indigo-600/10 to-transparent pointer-events-none" />
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-purple-500/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Release Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-purple-200 text-xs font-semibold mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Next-Gen Event Management Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6 leading-[1.1]">
            Discover & Attend <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
              Amazing Events
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-normal mb-10 leading-relaxed">
            Campus hackathons, workshops, cultural fests, and community runs — with instant digital QR passes and venue check-in verification.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto bg-white/10 backdrop-blur-xl p-2 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-2"
          >
            <div className="flex-1 flex items-center pl-3">
              <Search className="w-5 h-5 text-purple-300 mr-2.5 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events, workshops, hackathons, or venues..."
                className="w-full bg-transparent text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-xl transition shadow-lg shadow-purple-600/40 flex items-center gap-1.5 shrink-0"
            >
              Explore <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Category Chips */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                selectedCategory === null
                  ? 'bg-white text-slate-900 shadow-md font-bold'
                  : 'bg-white/10 text-slate-300 hover:bg-white/20'
              }`}
            >
              All Events
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.slug)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                  selectedCategory === c.slug
                    ? 'bg-purple-500 text-white shadow-md font-bold'
                    : 'bg-white/10 text-slate-300 hover:bg-white/20'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* SaaS Metrics Ribbon */}
        <div className="max-w-5xl mx-auto px-4 mt-16 pt-10 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">10,000+</p>
            <p className="text-xs text-purple-200 mt-1 font-medium">Tickets Issued</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">&lt; 1 sec</p>
            <p className="text-xs text-purple-200 mt-1 font-medium">QR Door Check-in</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Zero Fraud</p>
            <p className="text-xs text-purple-200 mt-1 font-medium">Opaque Cryptographic Tokens</p>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Real-Time</p>
            <p className="text-xs text-purple-200 mt-1 font-medium">Attendance & Analytics</p>
          </div>
        </div>
      </section>

      {/* Featured Events Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider bg-purple-50 px-3 py-1 rounded-full">
              Live Opportunities
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2">Upcoming Events</h2>
            <p className="text-xs text-slate-500 mt-1">Reserve your digital pass before seats fill up</p>
          </div>
          <Link
            to="/events"
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1.5"
          >
            Browse full catalog <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl h-80 animate-pulse border border-slate-200/80" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-sm">
            <Calendar className="w-12 h-12 text-purple-300 mx-auto mb-4" />
            <h3 className="font-bold text-lg text-slate-900">No events published yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-2">
              Be the first organiser to create an event and issue tickets!
            </p>
            <Link
              to="/organiser/create"
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 transition"
            >
              Host an Event
            </Link>
          </div>
        )}
      </section>

      {/* Feature Highlights Section */}
      <section className="bg-white border-y border-slate-200/80 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">The Modern Event Operating System</h2>
            <p className="text-xs text-slate-500 mt-2">
              Everything you need to publish, manage capacity, issue tamper-proof tickets, and track attendance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-purple-200 transition">
              <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center mb-6 shadow-md shadow-purple-200">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">Cryptographic QR Passes</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tickets are issued with opaque 32-byte tokens. Personal data is never exposed on tickets, ensuring total privacy and tamper-proofing.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-purple-200 transition">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center mb-6 shadow-md shadow-indigo-200">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">Instant Venue Scanner</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Organisers scan QR codes via any phone or laptop camera. Atomic database locking prevents duplicate scans and enforces one-time entry.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 hover:border-purple-200 transition">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-6 shadow-md shadow-slate-300">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-extrabold text-slate-900 mb-2">Live Organiser Analytics</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Track attendance rates, capacity utilization, and no-shows in real-time. Export verified participant rosters to CSV with a single click.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
