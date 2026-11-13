import { supabase } from './supabase';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api/v1';

async function request(endpoint, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = 'An error occurred';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || JSON.stringify(errJson);
    } catch {
      errorDetail = await response.text();
    }
    throw new Error(errorDetail);
  }

  // Handle CSV or file downloads
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/csv')) {
    return await response.blob();
  }

  if (response.status === 204) {
    return null;
  }

  return await response.json();
}

export const api = {
  // Auth & Profile
  getMe: () => request('/auth/me'),
  updateProfile: (data) => request('/auth/me', { method: 'PATCH', body: JSON.stringify(data) }),
  bootstrapProfile: (data) => request('/auth/register', { method: 'POST', body: JSON.stringify(data) }),

  // Categories & Events
  getCategories: () => request('/categories'),
  getEvents: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.category_slug) query.append('category_slug', params.category_slug);
    if (params.venue) query.append('venue', params.venue);
    if (params.status_filter) query.append('status_filter', params.status_filter);
    const qs = query.toString();
    return request(`/events${qs ? `?${qs}` : ''}`);
  },
  getEventDetail: (id) => request(`/events/${id}`),
  getMyOrganisedEvents: () => request('/events/me/organised'),
  createEvent: (data) => request('/events', { method: 'POST', body: JSON.stringify(data) }),
  updateEvent: (id, data) => request(`/events/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  publishEvent: (id) => request(`/events/${id}/publish`, { method: 'POST' }),
  deleteEvent: (id) => request(`/events/${id}`, { method: 'DELETE' }),

  // Registrations & Ticketing
  registerForEvent: (eventId) => request(`/events/${eventId}/register`, { method: 'POST' }),
  getMyRegistrations: () => request('/me/registrations'),
  cancelRegistration: (registrationId) => request(`/registrations/${registrationId}/cancel`, { method: 'POST' }),
  getTicket: (registrationId) => request(`/tickets/${registrationId}`),

  // Check-In (Scanner)
  checkInScan: (eventId, ticketToken) => request('/check-in/scan', {
    method: 'POST',
    body: JSON.stringify({ event_id: eventId, ticket_token: ticketToken })
  }),

  // Organiser Analytics & Participant export
  getEventAnalytics: (eventId) => request(`/organiser/events/${eventId}/analytics`),
  getEventParticipants: (eventId, format = 'json') => request(`/organiser/events/${eventId}/registrations?format=${format}`),
};
