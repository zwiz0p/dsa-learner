'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('🌸');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, avatar }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Signup failed');
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
          <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '24px', margin: '8px 0 4px', color: 'var(--text-main)' }}>Create Friend Account</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: 0 }}>Join your friends' study lounge & track DSA progress together!</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(224, 72, 104, 0.15)', color: 'var(--accent-pink-deep)', padding: '10px', borderRadius: '14px', fontSize: '12px', marginBottom: '14px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Friend Username</label>
            <input type="text" className="input-cute" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="e.g. Alex" required />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Email</label>
            <input type="email" className="input-cute" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="alex@friends.com" required />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Password</label>
            <input type="password" className="input-cute" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Choose Avatar Badge</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['🌸', '⚡', '🍵', '🎮', '☕', '🐱', '🎀'].map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setAvatar(emoji)}
                  style={{
                    fontSize: '20px', padding: '6px 12px', borderRadius: '14px', border: '1px solid var(--glass-border)',
                    background: avatar === emoji ? 'var(--accent-pink)' : 'var(--card-bg)',
                    cursor: 'pointer'
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-cute-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={loading}>
            {loading ? 'Creating...' : 'Create Account ✨'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '12.5px', color: 'var(--text-dim)' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--accent-pink)', fontWeight: 700 }}>Log In</Link>
        </div>
      </div>
    </div>
  );
}
