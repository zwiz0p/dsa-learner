'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }
      router.push('/');
    } catch (err) {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="modal-box-cute" style={{ width: 'min(420px, 94vw)' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '36px' }}>🌸</span>
          <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '24px', margin: '8px 0 4px', color: 'var(--text-main)' }}>Welcome Back</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: 0 }}>Log into your Sakura Code study lounge account!</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(224, 72, 104, 0.15)', color: 'var(--accent-pink-deep)', padding: '10px 14px', borderRadius: '14px', fontSize: '12.5px', marginBottom: '14px', textAlign: 'center', fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Username or Email</label>
            <input
              type="text"
              className="input-cute"
              value={usernameOrEmail}
              onChange={(e) => setUsernameOrEmail(e.target.value)}
              placeholder="garvit or garvit@gmail.com"
              required
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="input-cute"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{ paddingRight: '40px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                  border: 'none', background: 'none', cursor: 'pointer', fontSize: '16px', color: 'var(--text-dim)'
                }}
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-cute-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14.5px' }} disabled={loading}>
            {loading ? 'Logging In...' : 'Log In ✨'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '12.5px', color: 'var(--text-dim)' }}>
          Don't have an account? <Link href="/register" style={{ color: 'var(--accent-pink)', fontWeight: 700 }}>Create Account</Link>
        </div>
      </div>
    </div>
  );
}
