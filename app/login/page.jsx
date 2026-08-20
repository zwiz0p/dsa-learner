'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [input, setInput] = useState('');
  const [password, setPassword] = useState('');
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
        body: JSON.stringify({ usernameOrEmail: input, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }
      router.push('/');
    } catch (err) {
      setError('Connection error');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div className="modal-box-cute">
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '36px' }}>🌸</span>
          <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '24px', margin: '8px 0 4px', color: 'var(--text-main)' }}>Welcome Back!</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: 0 }}>Log in to access your DSA progress & study lounge</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(224, 72, 104, 0.15)', color: 'var(--accent-pink-deep)', padding: '10px', borderRadius: '14px', fontSize: '12px', marginBottom: '14px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Username or Email</label>
            <input type="text" className="input-cute" value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. kaoruko or kaoruko@anime.com" required />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Password</label>
            <input type="password" className="input-cute" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          <button type="submit" className="btn-cute-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Log In 💕'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '12.5px', color: 'var(--text-dim)' }}>
          Don't have an account? <Link href="/register" style={{ color: 'var(--accent-pink)', fontWeight: 700 }}>Sign Up</Link>
        </div>
      </div>
    </div>
  );
}
