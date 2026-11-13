import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, UploadCloud, Plus, Trash2, ListPlus } from 'lucide-react';
import { api } from '../services/api';
import { supabase } from '../services/supabase';

export default function CreateEventPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    category_id: '',
    start_time: '',
    end_time: '',
    capacity: 50,
    registration_deadline: '',
    fee: 0.00,
    banner_url: '',
  });

  const [customFields, setCustomFields] = useState([
    { id: 'phone', label: 'Phone Number', type: 'text', required: true },
    { id: 'org', label: 'College / Organization', type: 'text', required: false },
  ]);
  const [newQuestionLabel, setNewQuestionLabel] = useState('');

  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await api.getCategories();
      setCategories(data);
      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, category_id: data[0].id }));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError(null);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = `posters/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('event-posters')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('event-posters')
        .getPublicUrl(filePath);

      setFormData((prev) => ({ ...prev, banner_url: publicUrl }));
    } catch (err) {
      setError(`Image upload failed: ${err.message}`);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        category_id: formData.category_id ? parseInt(formData.category_id) : null,
        capacity: parseInt(formData.capacity),
        fee: parseFloat(formData.fee) || 0.0,
        start_time: new Date(formData.start_time).toISOString(),
        end_time: new Date(formData.end_time).toISOString(),
        registration_deadline: new Date(formData.registration_deadline).toISOString(),
        custom_fields: customFields,
      };

      await api.createEvent(payload);
      navigate('/organiser');
    } catch (err) {
      setError(err.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/organiser" className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 mb-6 transition">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>

      <div className="bg-white rounded-xl p-8 border border-slate-200 shadow-sm">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Create New Event</h1>
          <p className="text-xs text-slate-500 mt-1">Publish an event to begin accepting registrations & issuing tickets</p>
        </div>

        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Event Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Annual Campus Hackathon 2026"
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Entry Fee (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.fee}
                onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                placeholder="0.00 (Free)"
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description *</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Provide event details, schedule, and requirements..."
              className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Venue Location *</label>
              <input
                type="text"
                required
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                placeholder="e.g. Main Auditorium"
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Seat Capacity *</label>
              <input
                type="number"
                required
                min="1"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Time *</label>
              <input
                type="datetime-local"
                required
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Registration Closes *</label>
              <input
                type="datetime-local"
                required
                value={formData.registration_deadline}
                onChange={(e) => setFormData({ ...formData, registration_deadline: e.target.value })}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Poster Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Event Poster (Optional)</label>
            <div className="flex items-center gap-3">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition">
                <UploadCloud className="w-4 h-4 text-sky-600" />
                {uploadingImage ? 'Uploading poster...' : 'Choose File'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
              {formData.banner_url && (
                <span className="text-xs text-emerald-600 font-medium">
                  ✓ Poster uploaded
                </span>
              )}
            </div>
            {formData.banner_url && (
              <img
                src={formData.banner_url}
                alt="Banner preview"
                className="mt-3 w-40 h-24 object-cover rounded-lg border border-slate-200"
              />
            )}
          </div>

          {/* Custom Attendee Registration Form Builder */}
          <div className="pt-4 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <ListPlus className="w-4 h-4 text-sky-600" />
              <label className="text-xs font-bold text-slate-800">
                Attendee Registration Form (Custom Questions)
              </label>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Customize what information members must provide when registering. You can view and export these responses.
            </p>

            {/* Quick Presets */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <span className="text-[11px] text-slate-400 self-center mr-1">Quick add:</span>
              {[
                'Phone Number',
                'College / Organization',
                'Student ID / Roll No',
                'T-Shirt Size',
                'LinkedIn Profile',
                'Emergency Contact',
              ].map((preset) => {
                const alreadyAdded = customFields.some((f) => f.label.toLowerCase() === preset.toLowerCase());
                return (
                  <button
                    key={preset}
                    type="button"
                    disabled={alreadyAdded}
                    onClick={() => {
                      if (!alreadyAdded) {
                        setCustomFields([
                          ...customFields,
                          {
                            id: `field_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                            label: preset,
                            type: 'text',
                            required: true,
                          },
                        ]);
                      }
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-md font-medium border transition ${
                      alreadyAdded
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                        : 'bg-white hover:bg-sky-50 text-slate-700 border-slate-300 hover:border-sky-300 hover:text-sky-700'
                    }`}
                  >
                    + {preset}
                  </button>
                );
              })}
            </div>

            {/* Existing Questions List */}
            {customFields.length > 0 ? (
              <div className="space-y-2 mb-3 bg-slate-50 p-3 rounded-lg border border-slate-200">
                {customFields.map((field, idx) => (
                  <div
                    key={field.id || idx}
                    className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-md border border-slate-200 text-xs"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-slate-400 font-mono text-[11px]">{idx + 1}.</span>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => {
                          const updated = [...customFields];
                          updated[idx].label = e.target.value;
                          setCustomFields(updated);
                        }}
                        className="flex-1 bg-transparent font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-sky-500 rounded px-1.5 py-0.5"
                        placeholder="Question label"
                      />
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <label className="flex items-center gap-1.5 text-[11px] text-slate-600 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => {
                            const updated = [...customFields];
                            updated[idx].required = e.target.checked;
                            setCustomFields(updated);
                          }}
                          className="w-3.5 h-3.5 text-sky-600 rounded border-slate-300 focus:ring-sky-500"
                        />
                        Required
                      </label>

                      <button
                        type="button"
                        onClick={() => {
                          setCustomFields(customFields.filter((_, i) => i !== idx));
                        }}
                        className="text-slate-400 hover:text-red-600 transition"
                        title="Remove question"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 mb-3 bg-slate-50 rounded-lg border border-dashed border-slate-300 text-center text-xs text-slate-400">
                No custom questions added yet. Attendees will register with standard account info.
              </div>
            )}

            {/* Add Custom Question Input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newQuestionLabel}
                onChange={(e) => setNewQuestionLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    if (newQuestionLabel.trim()) {
                      setCustomFields([
                        ...customFields,
                        {
                          id: `field_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                          label: newQuestionLabel.trim(),
                          type: 'text',
                          required: false,
                        },
                      ]);
                      setNewQuestionLabel('');
                    }
                  }
                }}
                placeholder="Type custom question (e.g. 'GitHub Profile' or 'Dietary preference')..."
                className="flex-1 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (newQuestionLabel.trim()) {
                    setCustomFields([
                      ...customFields,
                      {
                        id: `field_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
                        label: newQuestionLabel.trim(),
                        type: 'text',
                        required: false,
                      },
                    ]);
                    setNewQuestionLabel('');
                  }
                }}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition inline-flex items-center gap-1 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Add Question
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-medium text-xs rounded-lg transition shadow-sm"
          >
            {loading ? 'Creating event...' : 'Create Event'}
          </button>
        </form>
      </div>
    </div>
  );
}
