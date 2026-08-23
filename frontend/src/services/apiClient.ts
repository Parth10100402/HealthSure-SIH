// HealthSure — Centralized API Client Layer
// frontend/src/services/apiClient.ts

import { getStoredToken } from './authService';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  token?: string;
  user?: any;
  unreadCount?: number;
  errors?: any[];
}

class ApiClient {
  private getHeaders(customHeaders?: HeadersInit): HeadersInit {
    const token = getStoredToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...customHeaders,
    };
  }

  async get<T = any>(path: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    try {
      let url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
      if (params) {
        const searchParams = new URLSearchParams();
        Object.entries(params).forEach(([key, val]) => {
          if (val !== undefined && val !== null && val !== '') {
            searchParams.append(key, String(val));
          }
        });
        const qs = searchParams.toString();
        if (qs) url += `?${qs}`;
      }

      const res = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      const json = await res.json();
      return json;
    } catch (err: any) {
      console.warn(`[ApiClient GET ${path}] Network/Fetch error:`, err.message);
      return {
        success: false,
        message: err.message || 'Unable to connect to server.',
      };
    }
  }

  async post<T = any>(path: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });

      const json = await res.json();
      return json;
    } catch (err: any) {
      console.warn(`[ApiClient POST ${path}] Network/Fetch error:`, err.message);
      return {
        success: false,
        message: err.message || 'Unable to connect to server.',
      };
    }
  }

  async put<T = any>(path: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });

      const json = await res.json();
      return json;
    } catch (err: any) {
      console.warn(`[ApiClient PUT ${path}] Network/Fetch error:`, err.message);
      return {
        success: false,
        message: err.message || 'Unable to connect to server.',
      };
    }
  }

  async patch<T = any>(path: string, body?: any): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
      const res = await fetch(url, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: body ? JSON.stringify(body) : undefined,
      });

      const json = await res.json();
      return json;
    } catch (err: any) {
      console.warn(`[ApiClient PATCH ${path}] Network/Fetch error:`, err.message);
      return {
        success: false,
        message: err.message || 'Unable to connect to server.',
      };
    }
  }

  async delete<T = any>(path: string): Promise<ApiResponse<T>> {
    try {
      const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
      const res = await fetch(url, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });

      const json = await res.json();
      return json;
    } catch (err: any) {
      console.warn(`[ApiClient DELETE ${path}] Network/Fetch error:`, err.message);
      return {
        success: false,
        message: err.message || 'Unable to connect to server.',
      };
    }
  }
}

export const apiClient = new ApiClient();
