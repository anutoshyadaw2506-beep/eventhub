import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Filter, Calendar, Sparkles, X } from 'lucide-react';
import { api } from '../services/api';
import EventCard from '../components/EventCard';

export default function EventsListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadEvents();
  }, [category]);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await api.getEvents({
        search: search || undefined,
        category_slug: category || undefined,
      });
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadEvents();
  };

  const clearSearch = () => {
    setSearch('');
    loadEvents();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10 text-center sm:text-left">
        <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider bg-purple-50 px-3 py-1 rounded-full">
          Event Discovery
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
          Discover All Events
        </h1>
        <p className="text-xs text-slate-500 mt-1 max-w-xl">
          Explore upcoming hackathons, campus runs, tech workshops, and cultural fests.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm mb-10 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center bg-slate-50 rounded-2xl px-4 py-2.5 border border-slate-200 focus-within:border-purple-500 focus-within:bg-white transition">
          <Search className="w-4 h-4 text-slate-400 mr-2.5 shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by event title, description, or location..."
            className="w-full bg-transparent text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
          />
          {search && (
            <button type="button" onClick={clearSearch} className="p-1 text-slate-400 hover:text-slate-600 mr-2">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button type="submit" className="text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 px-3.5 py-1.5 rounded-xl transition">
            Filter
          </button>
        </form>

        {/* Categories Tab Ribbon */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setCategory('')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              category === ''
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.slug)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                category === c.slug
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white rounded-3xl h-80 animate-pulse border border-slate-200/80" />
          ))}
        </div>
      ) : events.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4 text-xs font-semibold text-slate-500">
            <span>Showing {events.length} event{events.length > 1 ? 's' : ''}</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-sm">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No events found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or selecting another category.
          </p>
          {(search || category) && (
            <button
              onClick={() => { setSearch(''); setCategory(''); }}
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}
