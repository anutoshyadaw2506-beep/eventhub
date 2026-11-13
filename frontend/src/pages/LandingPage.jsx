import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Sparkles, Calendar, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-purple-950 to-slate-900 text-white py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-500/20 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            Campus & Community Event Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6">
            Discover & Attend <br />
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-indigo-300 bg-clip-text text-transparent">
              Amazing Events
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-normal mb-10">
            Runs, workshops, hackathons, cultural fests and more — all in one place with secure QR ticketing and fast check-in.
          </p>

          {/* Search Box */}
          <form
            onSubmit={handleSearchSubmit}
            className="max-w-2xl mx-auto bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/20 shadow-2xl flex items-center gap-2"
          >
            <div className="flex-1 flex items-center pl-3">
              <Search className="w-5 h-5 text-purple-300 mr-2 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events, workshops, hackathons, or venues..."
                className="w-full bg-transparent text-white placeholder-slate-400 text-sm focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm px-6 py-3 rounded-xl transition shadow-lg shadow-purple-600/30 flex items-center gap-1.5"
            >
              Explore <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Category Chips */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition ${
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
                className={`px-4 py-2 rounded-xl text-xs font-medium transition ${
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
      </section>

      {/* Featured Events Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-1 w-full">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Upcoming Events</h2>
            <p className="text-xs text-slate-500 mt-1">Discover what's happening near you</p>
          </div>
          <Link
            to="/events"
            className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 shadow-sm">
            <Calendar className="w-12 h-12 text-purple-300 mx-auto mb-4" />
            <h3 className="font-bold text-lg text-slate-800">No events published yet</h3>
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
    </div>
  );
}
