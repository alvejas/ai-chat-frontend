import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post<{ token: string }>('/auth/login', { username, password });
      login(response.data.token, username);
      navigate('/');
    } catch (err) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message ?? 'Login failed. Please try again.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-brand">
        <div className="brand-logo">
          <div className="brand-logo-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="brand-logo-name">AI Chat</span>
        </div>

        <h1 className="brand-headline">
          Connect with<br />your team
        </h1>
        <p className="brand-sub">
          Real-time messaging with AI assistance built right in. Collaborate smarter, not harder.
        </p>

        <div className="brand-features">
          <div className="brand-feature">
            <div className="brand-feature-icon">💬</div>
            <span>Real-time messaging</span>
          </div>
          <div className="brand-feature">
            <div className="brand-feature-icon">✦</div>
            <span>AI-powered responses</span>
          </div>
          <div className="brand-feature">
            <div className="brand-feature-icon">🔒</div>
            <span>Secure channels</span>
          </div>
        </div>
      </div>

      <div className="auth-panel">
        <div className="auth-form-wrapper">
          <h2 className="auth-form-title">Welcome back</h2>
          <p className="auth-form-subtitle">Sign in to your account to continue</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="auth-field">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="auth-submit">Sign in</button>
          </form>

          <p className="auth-footer">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};
