import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      // fetch profile automatically
      fetchProfile();
    } else {
      setProfile(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const payloadEmail = (email || '').trim().toLowerCase();
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: payloadEmail, password })
      });

      const contentType = res.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        // Non-JSON (likely HTML) — read text for debugging and throw friendly message
        const text = await res.text();
        throw new Error(
          'Unexpected non-JSON response from server. This often means the backend is not reachable or the dev proxy is not configured. Response starts with: ' +
            (text ? text.slice(0, 200) : '[empty response]')
        );
      }

      if (!res.ok) {
        // return server-provided message when available
        throw new Error(data.message || 'Login failed');
      }

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      await fetchProfile(data.token);
      setLoading(false);
      return { ok: true };
    } catch (err) {
      setLoading(false);
      // Provide a clearer message for common dev issues
      const msg = err.message || 'Login failed';
      return { ok: false, error: msg };
    }
  };

  const register = async (username, email, password) => {
    setLoading(true);
    try {
      const payloadEmail = (email || '').trim().toLowerCase();
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email: payloadEmail, password })
      });

      const contentType = res.headers.get('content-type') || '';
      let data;
      if (contentType.includes('application/json')) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(
          'Unexpected non-JSON response from server. This often means the backend is not reachable or the dev proxy is not configured. Response starts with: ' +
            (text ? text.slice(0, 200) : '[empty response]')
        );
      }

      if (!res.ok) throw new Error(data.message || 'Registration failed');

      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      await fetchProfile(data.token);
      setLoading(false);
      return { ok: true };
    } catch (err) {
      setLoading(false);
      return { ok: false, error: err.message };
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setProfile(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const fetchProfile = async (explicitToken) => {
    const t = explicitToken || token;
    if (!t) return;
    try {
      const res = await fetch('/api/auth/profile', {
        headers: { Authorization: `Bearer ${t}` }
      });

      const contentType = res.headers.get('content-type') || '';
      if (!contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error('Profile endpoint returned non-JSON response: ' + (text ? text.slice(0, 200) : '[empty]'));
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to fetch profile');
      }

      const data = await res.json();
      setProfile(data);
      return data;
    } catch (err) {
      console.error('Profile load error', err);
      return null;
    }
  };

  // Helper to make authenticated requests and handle JSON / non-JSON responses
  const authFetch = async (path, options = {}) => {
    const headers = new Headers(options.headers || {});
    if (token) headers.set('Authorization', `Bearer ${token}`);

    let body = options.body;
    // stringify JSON bodies
    if (body && typeof body === 'object' && !(body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
      body = JSON.stringify(body);
    }

    const res = await fetch(path, { ...options, headers, body });
    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();

    if (contentType.includes('application/json')) {
      let data;
      try {
        data = JSON.parse(text || '{}');
      } catch (e) {
        throw new Error('Invalid JSON response from ' + path);
      }
      if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
      return data;
    }

    // Non-JSON
    if (!res.ok) {
      throw new Error(`Request failed (${res.status}): ${text ? text.slice(0, 200) : '[empty]'}`);
    }
    return text;
  };

  return (
    <AuthContext.Provider value={{ token, user, profile, loading, login, register, logout, fetchProfile, authFetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

export default AuthContext;
