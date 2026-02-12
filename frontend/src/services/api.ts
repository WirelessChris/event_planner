import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface AuthStatus {
  adminExists: boolean;
}

export interface LoginResponse {
  access_token: string;
  user: { id: number; username: string };
}

export interface RegisterResponse {
  message: string;
  user: { id: number; username: string };
}

export interface Event {
  id: number;
  title: string;
  description: string;
  start: string;
  end: string;
  volunteers: string[];
}

export interface EventDetail {
  id: number;
  title: string;
  description: string;
  date: string;
  start_time: string;
  end_time: string;
}

export interface CreateEventData {
  title: string;
  description?: string;
  date: string;
  start_time?: string;
  end_time?: string;
}

export const authApi = {
  getStatus: () => api.get<AuthStatus>('/auth/status'),
  login: (username: string, password: string) =>
    api.post<LoginResponse>('/auth/login', { username, password }),
  register: (username: string, password: string, confirm_password: string) =>
    api.post<RegisterResponse>('/auth/register', {
      username,
      password,
      confirm_password,
    }),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};

export const eventsApi = {
  getAll: (start?: string, end?: string) => {
    const params = new URLSearchParams();
    if (start) params.append('start', start);
    if (end) params.append('end', end);
    return api.get<Event[]>(`/events?${params.toString()}`);
  },
  getOne: (id: number) => api.get<EventDetail>(`/events/${id}`),
  create: (data: CreateEventData) => api.post<Event>('/events', data),
  update: (id: number, data: CreateEventData) =>
    api.put<Event>(`/events/${id}`, data),
  delete: (id: number) => api.delete(`/events/${id}`),
  addVolunteer: (id: number, name: string) =>
    api.post<Event>(`/events/${id}/volunteer`, { name }),
  removeVolunteer: (id: number, name: string) =>
    api.delete<Event>(`/events/${id}/volunteer`, { data: { name } }),
};

export default api;
