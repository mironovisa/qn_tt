import axios from 'axios';

const API_BASE_URL = 'http://localhost:8001';

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

export interface User {
  id: string;
  email: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteDto {
  title: string;
  content: string;
  tags?: string[];
}

export interface PaginatedNotes {
  data: Note[];
  pagination: {
    nextCursor: string | null;
    prevCursor: string | null;
    limit: number;
    total: number;
  };
}

export const authApi = {
  register: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/register', { email, password }),
  
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),
  
  getProfile: () =>
    api.get<User>('/auth/profile'),
};

export const notesApi = {
  getTags: () =>
    api.get<string[]>('/notes/tags'),
    
  getNotes: (limit = 10, cursor?: string, tags?: string, search?: string, sortBy?: string, sortOrder?: string) =>
    api.get<PaginatedNotes>('/notes', {
      params: { limit, cursor, tags, search, sortBy, sortOrder },
    }),
  
  createNote: (note: CreateNoteDto) =>
    api.post<Note>('/notes', note),
  
  updateNote: (id: string, note: Partial<CreateNoteDto>) =>
    api.patch<Note>(`/notes/${id}`, note),
    
  replaceNote: (id: string, note: CreateNoteDto) =>
    api.put<Note>(`/notes/${id}`, note),
  
  deleteNote: (id: string) =>
    api.delete(`/notes/${id}`),
};

export default api;