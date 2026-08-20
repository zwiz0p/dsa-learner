'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [avatar, setAvatar] = useState('/avatars/default.png');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Real-time Username availability state
  const [usernameStatus, setUsernameStatus] = useState(null); // { available: boolean, message: string }

  const router = useRouter();

  // Check username availability as user types
  const handleUsernameChange = async (val) => {
    setUsername(val);
    if (!val.trim()) {
      setUsernameStatus(null);
      return;
    }

    try {
      const res = await fetch(`/api/auth/check-username?username=${encodeURIComponent(val.trim())}`);
      const data = await res.json();
      setUsernameStatus(data);
    } catch (e) {
      setUsernameStatus(null);
    }
  };

  // Handle Photo File Upload
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (usernameStatus && !usernameStatus.available) {
      setError(usernameStatus.message);
      return;
    }

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
      <div className="modal-box-cute" style={{ width: 'min(480px, 94vw)' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <span style={{ fontSize: '36px' }}>🌸</span>
          <h2 style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '24px', margin: '8px 0 4px', color: 'var(--text-main)' }}>Create Friend Account</h2>
          <p style={{ fontSize: '13px', color: 'var(--text-dim)', margin: 0 }}>Join your friends' study lounge & track DSA progress together!</p>
        </div>

        {error && (
          <div style={{ background: 'rgba(224, 72, 104, 0.15)', color: 'var(--accent-pink-deep)', padding: '10px 14px', borderRadius: '14px', fontSize: '12.5px', marginBottom: '14px', textAlign: 'center' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          {/* Username Field with Availability Feedback */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Friend Username</label>
            <input
              type="text"
              className="input-cute"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              placeholder="e.g. Garvit Sharma"
              required
            />
            {usernameStatus && (
              <div style={{ fontSize: '11px', fontWeight: 700, marginTop: '4px', color: usernameStatus.available ? 'var(--accent-sage)' : 'var(--accent-pink-deep)' }}>
                {usernameStatus.message}
              </div>
            )}
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Email</label>
            <input
              type="email"
              className="input-cute"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="garvit@gmail.com"
              required
            />
          </div>

          <div style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Password</label>
            <input
              type="password"
              className="input-cute"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          {/* Photo Avatar Selector & Custom Upload (Replaced Emojis) */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '6px' }}>Choose Profile Photo / Upload Custom Image</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              {['/avatars/default.png', '/avatars/annoyed.jpg'].map((imgUrl) => (
                <img
                  key={imgUrl}
                  src={imgUrl}
                  alt="Avatar"
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

              <label className="nav-btn" style={{ fontSize: '11.5px', padding: '6px 12px', cursor: 'pointer', border: '1px solid var(--glass-border)', background: 'var(--card-bg)' }}>
                📷 Upload Photo
                <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
              </label>
            </div>
          </div>

          <button type="submit" className="btn-cute-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px' }} disabled={loading}>
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
