/**
 * src/lib/api.ts
 * Robust API client for the Blood Donation App.
 */

const API_URL = import.meta.env.VITE_API_URL || '/api';

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(public message: string, public status: number, public data: any = null) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Robust fetch wrapper with automatic JSON parsing and error handling
 */
async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${API_URL}${endpoint}`;
  const defaultOptions: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...options.headers,
    },
    credentials: 'include', // Important for sessions
  };

  try {
    const response = await fetch(url, defaultOptions);
    const text = await response.text();
    
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      throw new ApiError('Invalid JSON response from server', response.status, text);
    }

    if (!response.ok) {
      throw new ApiError(data.message || `HTTP Error ${response.status}`, response.status, data);
    }

    return data;
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    console.error(`API Fetch Error (${url}):`, error);
    throw new ApiError(error.message || 'Network connection error', 0);
  }
}

export const api = {
  auth: {
    signup: (email: string, password: string, metadata: any) =>
      fetchAPI('/auth.php?action=signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, metadata }),
      }),
    signin: (email: string, password: string) =>
      fetchAPI('/auth.php?action=signin', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    signout: () => fetchAPI('/auth.php?action=signout', { method: 'POST' }),
    checkSession: () => fetchAPI('/auth.php?action=check_session'),
  },
  cities: {
    getAll: () => fetchAPI('/cities.php'),
  },
  profiles: {
    get: (userId: string) => fetchAPI(`/profiles.php?action=get_profile&userId=${userId}`),
    search: (bloodType?: string, cityId?: string) => {
      const bt = encodeURIComponent(bloodType || '');
      const ci = encodeURIComponent(cityId || '');
      return fetchAPI(`/profiles.php?action=search_donors&bloodType=${bt}&cityId=${ci}`);
    },
    update: (data: any) =>
      fetchAPI('/profiles.php?action=update_profile', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  requests: {
    get: (profileId: string, role: string) =>
      fetchAPI(`/requests.php?action=get_requests&profileId=${profileId}&role=${role}`),
    create: (data: any) =>
      fetchAPI('/requests.php?action=create_request', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    updateStatus: (id: string, status: string) =>
      fetchAPI('/requests.php?action=update_status', {
        method: 'POST',
        body: JSON.stringify({ id, status }),
      }),
    acceptRequest: (id: string, donor_id: string) =>
      fetchAPI('/requests.php?action=accept_request', {
        method: 'POST',
        body: JSON.stringify({ id, donor_id }),
      }),
  },
  notifications: {
    get: (userId: string) => fetchAPI(`/notifications.php?userId=${userId}`),
    markRead: (id: string) =>
      fetchAPI('/notifications.php?action=mark_read', {
        method: 'POST',
        body: JSON.stringify({ id }),
      }),
  },
  contact: {
    send: (data: any) =>
      fetchAPI('/contact.php', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  },
  admin: {
    getStats: () => fetchAPI('/admin.php?action=get_stats'),
    getUsers: () => fetchAPI('/admin.php?action=get_users'),
    updateUser: (data: any) =>
      fetchAPI('/admin.php?action=update_user', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
  }
};
