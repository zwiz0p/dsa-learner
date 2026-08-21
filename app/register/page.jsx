'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [avatar, setAvatar] = useState('/avatars/default.png');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Username availability state
  const [usernameStatus, setUsernameStatus] = useState(null);

  const router = useRouter();

  const [presetAvatars, setPresetAvatars] = useState([
    '/avatars/default.png',
    '/avatars/annoyed.jpg',
  ]);

  // Fetch dynamic avatars from public/avatars folder
  useState(() => {
    fetch('/api/avatars')
      .then(res => res.json())
      .then(data => {
        if (data.avatars && data.avatars.length > 0) {
          setPresetAvatars(data.avatars);
        }
      })
      .catch(() => {});
  });

  // Check username availability as user types
  const handleUsernameChange = async (val) => {
    setUsername(val);
    if (!val.trim()) {
      setUsernameStatus(null);
      return;
    }

    try {
      const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(val.trim().toLowerCase())}`);
      const data = await res.json();
      setUsernameStatus(data);
    } catch (e) {
      setUsernameStatus(null);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Full Name is required');
      return;
    }
    if (!username.trim()) {
      setError('Username handle is required');
      return;
    }
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!password) {
      setError('Password is required');
      return;
    }
    if (!avatar) {
      setError('Please select a Profile Photo avatar');
      return;
    }

    if (usernameStatus && !usernameStatus.available) {
      setError(usernameStatus.message || 'Username is already taken');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), username: username.trim(), email: email.trim(), password, avatar }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Signup failed');
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
      <div className="modal-box-cute" style={{ width: 'min(480px, 94vw)' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '36px' }}>🌸</span>
          <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '24px', margin: '8px 0 4px', color: 'var(--text-main)' }}>Create Account</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: 0 }}>All fields including avatar photo are required!</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(224, 72, 104, 0.15)', color: 'var(--accent-pink-deep)', padding: '10px 14px', borderRadius: '14px', fontSize: '12.5px', marginBottom: '14px', textAlign: 'center', fontWeight: 600 }}>
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          {/* Full Name Field (Required) */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Full Name <span style={{ color: 'var(--accent-pink)' }}>*</span></label>
            <input
              type="text"
              className="input-cute"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Garvit Sharma"
              required
            />
          </div>

          {/* Unique Username Field (Required) */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Unique Username Handle <span style={{ color: 'var(--accent-pink)' }}>*</span></label>
            <input
              type="text"
              className="input-cute"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder="e.g. garvit"
              required
            />
            {usernameStatus && (
              <div style={{ fontSize: '11.5px', fontWeight: 700, marginTop: '4px', color: usernameStatus.available ? 'var(--accent-sage)' : 'var(--accent-pink-deep)' }}>
                {usernameStatus.available ? '✓ ' : '✕ '}{usernameStatus.message}
              </div>
            )}
          </div>

          {/* Email Field (Required) */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Email <span style={{ color: 'var(--accent-pink)' }}>*</span></label>
            <input
              type="email"
              className="input-cute"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="garvit@gmail.com"
              required
            />
          </div>

          {/* Password Field (Required) */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Password <span style={{ color: 'var(--accent-pink)' }}>*</span></label>
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

          {/* Preset Photo Avatars Grid (Required) */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Select Profile Photo (PFP) <span style={{ color: 'var(--accent-pink)' }}>*</span></label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              {presetAvatars.map((imgUrl) => (
                <img
                  key={imgUrl}
                  src={imgUrl}
                  alt="Preset Avatar"
                  onClick={() => setAvatar(imgUrl)}
                  onError={(e) => { e.target.style.display = 'none'; }}
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    cursor: 'pointer',
                    border: avatar === imgUrl ? '3px solid var(--accent-pink)' : '2px solid var(--glass-border)',
                    boxShadow: avatar === imgUrl ? '0 2px 8px rgba(255, 107, 139, 0.4)' : 'none',
                    transition: 'all 0.2s ease',
                  }}
                />
              ))}
            </div>
          </div>

          <button type="submit" className="btn-cute-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14.5px' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account ✨'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '12.5px', color: 'var(--text-dim)' }}>
          Already have an account? <Link href="/login" style={{ color: 'var(--accent-pink)', fontWeight: 700 }}>Log In</Link>
        </div>
      </div>
    </div>
  );
}
