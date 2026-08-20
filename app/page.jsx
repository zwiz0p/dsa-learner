'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { BASE_TOPICS, MILESTONES } from '../lib/initialProblems';

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [theme, setTheme] = useState('day');
  const [activeTab, setActiveTab] = useState('problems');

  // State data
  const [solvedState, setSolvedState] = useState({});
  const [rev1State, setRev1State] = useState({});
  const [rev2State, setRev2State] = useState({});
  const [customProblems, setCustomProblems] = useState([]);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [notes, setNotes] = useState({});
  const [openTopics, setOpenTopics] = useState({});
  const [expandedNotesKey, setExpandedNotesKey] = useState(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [diffFilter, setDiffFilter] = useState('ALL');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showFriendModal, setShowFriendModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);

  // Add Problem form
  const [newTitle, setNewTitle] = useState('');
  const [newTopic, setNewTopic] = useState('Arrays');
  const [newDiff, setNewDiff] = useState('Medium');
  const [newLink, setNewLink] = useState('');

  // Add Friend form
  const [friendInput, setFriendInput] = useState('');
  const [friendMsg, setFriendMsg] = useState('');

  // Profile customization form
  const [profilePhotoUrl, setProfilePhotoUrl] = useState('');
  const [mascotGifUrl, setMascotGifUrl] = useState('');
  const [userStatusMsg, setUserStatusMsg] = useState('');

  // Chat state
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  // Pomodoro Timer state
  const [pomoTime, setPomoTime] = useState(25 * 60);
  const [pomoActive, setPomoActive] = useState(false);
  const [pomoMode, setPomoMode] = useState('focus'); // 'focus' (25m) or 'break' (5m)

  // Floating Music Player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [musicSource, setMusicSource] = useState('youtube');
  const [ytStreamId, setYtStreamId] = useState('jfKfPfyJRdk');
  const [spotifyUrl, setSpotifyUrl] = useState('https://open.spotify.com/embed/playlist/0vvRV22zYsJyB3Z8fB9Wff');
  const [isPlayerExpanded, setIsPlayerExpanded] = useState(false);

  const canvasRef = useRef(null);

  // Fetch initial data
  useEffect(() => {
    const savedTheme = localStorage.getItem('dsa_theme') || 'day';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);

    fetchUser();
    fetchProgress();
    fetchCustomProblems();
    fetchChat();
  }, []);

  useEffect(() => {
    if (user) {
      fetchFriends();
      fetchPendingRequests();
      fetchNotes();
      setProfilePhotoUrl(user.avatar || '/avatars/default.png');
      setMascotGifUrl(user.mascotGif || '/mascots/default.gif');
      setUserStatusMsg(user.status || 'Online 🟢');
    }
  }, [user]);

  // Pomodoro Interval Effect
  useEffect(() => {
    let timer = null;
    if (pomoActive && pomoTime > 0) {
      timer = setInterval(() => setPomoTime(prev => prev - 1), 1000);
    } else if (pomoTime === 0) {
      clearInterval(timer);
      setPomoActive(false);
      alert(pomoMode === 'focus' ? '🎉 Focus session complete! Time for a 5-minute break!' : '⏰ Break ended! Back to solving DSA!');
    }
    return () => clearInterval(timer);
  }, [pomoActive, pomoTime, pomoMode]);

  const toggleTheme = () => {
    const next = theme === 'day' ? 'night' : 'day';
    setTheme(next);
    localStorage.setItem('dsa_theme', next);
    document.documentElement.setAttribute('data-theme', next);
  };

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      setUser(data.user || null);
    } catch (e) {
      setUser(null);
    } finally {
      setLoadingUser(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await fetch('/api/progress');
      const data = await res.json();
      if (data.solved) setSolvedState(data.solved);
      if (data.rev1) setRev1State(data.rev1);
      if (data.rev2) setRev2State(data.rev2);
    } catch (e) {}
  };

  const fetchCustomProblems = async () => {
    try {
      const res = await fetch('/api/problems');
      const data = await res.json();
      if (data.problems) setCustomProblems(data.problems);
    } catch (e) {}
  };

  const fetchFriends = async () => {
    try {
      const res = await fetch('/api/friends');
      const data = await res.json();
      if (data.friends) setFriends(data.friends);
    } catch (e) {}
  };

  const fetchPendingRequests = async () => {
    try {
      const res = await fetch('/api/friends/request');
      const data = await res.json();
      if (data.requests) setPendingRequests(data.requests);
    } catch (e) {}
  };

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/user/notes');
      const data = await res.json();
      if (data.notes) setNotes(data.notes);
    } catch (e) {}
  };

  const fetchChat = async () => {
    try {
      const res = await fetch('/api/chat?roomId=library');
      const data = await res.json();
      if (data.messages) setChatMessages(data.messages);
    } catch (e) {}
  };

  // Toggle solve / rev checkboxes
  const handleToggleCheck = async (key, type) => {
    if (!user) return alert('Please log in to track your progress!');
    let nextVal = false;
    if (type === 'solve') {
      nextVal = !solvedState[key];
      setSolvedState(prev => ({ ...prev, [key]: nextVal }));
    } else if (type === 'rev1') {
      nextVal = !rev1State[key];
      setRev1State(prev => ({ ...prev, [key]: nextVal }));
    } else if (type === 'rev2') {
      nextVal = !rev2State[key];
      setRev2State(prev => ({ ...prev, [key]: nextVal }));
    }

    try {
      await fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemKey: key, type, value: nextVal }),
      });
    } catch (e) {}
  };

  // Save Problem Notes
  const handleSaveNote = async (key, content) => {
    setNotes(prev => ({ ...prev, [key]: content }));
    try {
      await fetch('/api/user/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemKey: key, content }),
      });
    } catch (e) {}
  };

  // Add custom problem
  const handleAddProblem = async (e) => {
    e.preventDefault();
    if (!newTitle) return;

    try {
      const res = await fetch('/api/problems', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle, topic: newTopic, difficulty: newDiff, link: newLink }),
      });
      const data = await res.json();
      if (data.problem) setCustomProblems(prev => [...prev, data.problem]);
      setShowAddModal(false);
      setNewTitle(''); setNewLink('');
    } catch (e) {}
  };

  // Send friend request
  const handleSendFriendRequest = async (e) => {
    e.preventDefault();
    if (!friendInput.trim()) return;
    setFriendMsg('');

    try {
      const res = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrInviteCode: friendInput.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFriendMsg(data.error || 'Failed to send request');
      } else {
        setFriendMsg(data.message || 'Friend request sent!');
        setFriendInput('');
      }
    } catch (e) {
      setFriendMsg('Connection error');
    }
  };

  // Handle Accept / Reject request
  const handleProcessRequest = async (requestId, action) => {
    try {
      const res = await fetch('/api/friends/request', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, action }),
      });
      if (res.ok) {
        fetchPendingRequests();
        fetchFriends();
      }
    } catch (e) {}
  };

  // Save profile settings
  const handleSaveProfileSettings = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: profilePhotoUrl, mascotGif: mascotGifUrl, status: userStatusMsg }),
      });
      const data = await res.json();
      if (data.user) setUser(data.user);
      setShowProfileModal(false);
    } catch (e) {}
  };

  // Handle File Upload (Convert to DataURL for instant local display & preview)
  const handleFileUpload = (e, setter) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Send chat message
  const handleSendChat = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: chatInput, roomId: 'library' }),
      });
      const data = await res.json();
      if (data.message) setChatMessages(prev => [...prev, data.message]);
      setChatInput('');
    } catch (e) {}
  };

  // Clear old chat logs
  const handleClearChatHistory = async () => {
    if (!confirm('Clear chat messages older than 7 days?')) return;
    try {
      await fetch('/api/chat?days=7', { method: 'DELETE' });
      fetchChat();
    } catch (e) {}
  };

  // Combine Base Topics with Custom Problems
  const getMergedTopics = () => {
    const map = new Map();
    BASE_TOPICS.forEach(t => map.set(t.name, [...t.items]));

    customProblems.forEach(cp => {
      if (!map.has(cp.topic)) map.set(cp.topic, []);
      map.get(cp.topic).push([cp.title, cp.difficulty, cp.platform || 'Custom', cp.link, cp.addedByName || 'Friend']);
    });

    const list = [];
    map.forEach((items, name) => list.push({ name, items }));
    return list;
  };

  const topics = getMergedTopics();

  // Statistics Calculation
  let totalQ = 0, totalSolved = 0, topicsDone = 0, revCount = 0;
  let easyTotal = 0, easyDone = 0, medTotal = 0, medDone = 0, hardTotal = 0, hardDone = 0;

  topics.forEach((topic) => {
    let tSolved = 0;
    topic.items.forEach((item, qi) => {
      const qKey = `${topic.name}_${qi}`;
      const diff = item[1];
      totalQ++;
      if (diff === 'Easy') easyTotal++; else if (diff === 'Medium') medTotal++; else hardTotal++;

      if (solvedState[qKey]) {
        totalSolved++; tSolved++;
        if (diff === 'Easy') easyDone++; else if (diff === 'Medium') medDone++; else hardDone++;
      }
      if (rev1State[qKey]) revCount++;
      if (rev2State[qKey]) revCount++;
    });
    if (tSolved === topic.items.length && topic.items.length > 0) topicsDone++;
  });

  const overallPct = totalQ ? Math.round((totalSolved / totalQ) * 100) : 0;
  const circumference = 314;
  const strokeOffset = circumference - (circumference * overallPct / 100);

  // Dynamic Mascot Encouragement Speech Bubble
  const getDynamicMascotSpeech = () => {
    if (totalSolved === 0) return "Don't give up! Let's solve 1 problem together today 💕";
    if (totalSolved >= 10) return "Sugoi!! You're on fire today! 🔥";
    if (overallPct >= 50) return "Halfway there! Keep grinding, placement ready! ⚡";
    return `Awesome progress! You have cleared ${totalSolved} problems! 🌸`;
  };

  // Milestone check
  let currentMilestone = null;
  MILESTONES.forEach(m => { if (overallPct >= m.pct) currentMilestone = m; });

  // Sakura Animation Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W = canvas.width = window.innerWidth;
    let H = canvas.height = window.innerHeight;

    const handleResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const petals = Array.from({ length: 30 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      size: 6 + Math.random() * 8,
      speedY: 0.4 + Math.random() * 0.7,
      speedX: -0.3 + Math.random() * 0.6,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: 0.01 + Math.random() * 0.02
    }));

    let animId;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      petals.forEach(p => {
        p.y += p.speedY; p.x += p.speedX; p.rot += p.rotSpeed;
        if (p.y > H + 20) p.y = -20;
        if (p.x > W + 20) p.x = -20;

        ctx.save();
        ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = theme === 'day' ? 'rgba(255, 183, 197, 0.7)' : 'rgba(255, 133, 162, 0.5)';
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh' }}>
      <canvas id="sakura-canvas" ref={canvasRef} />

      <div className="wrap">
        
        {/* TOP NAVIGATION BAR */}
        <div className="top-nav">
          <Link href="/" className="brand-logo">
            <span className="sakura-icon">🌸</span>
            <span>Sakura Code</span>
          </Link>

          {user && (
            <div className="nav-tabs">
              <button className={`nav-btn ${activeTab === 'problems' ? 'active' : ''}`} onClick={() => setActiveTab('problems')}>📚 Problems</button>
              <button className={`nav-btn ${activeTab === 'study' ? 'active' : ''}`} onClick={() => setActiveTab('study')}>☕ Study Room</button>
              <button className={`nav-btn ${activeTab === 'friends' ? 'active' : ''}`} onClick={() => setActiveTab('friends')}>👥 Friends ({friends.length})</button>
            </div>
          )}

          <div className="nav-controls">
            {user ? (
              <>
                {/* Friend Request Bell */}
                <button className="theme-toggle-btn" style={{ position: 'relative' }} onClick={() => setShowRequestsModal(true)} title="Pending Friend Requests">
                  🔔
                  {pendingRequests.length > 0 && (
                    <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: 'var(--accent-pink)', color: '#fff', fontSize: '10px', fontWeight: 700, borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {pendingRequests.length}
                    </span>
                  )}
                </button>

                <div className="profile-pill" onClick={() => setShowProfileModal(true)}>
                  <img src={user.avatar || '/avatars/default.png'} alt="Avatar" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = '/avatars/default.png'; }} />
                  <span className="profile-name">{user.username}</span>
                  <div className="status-dot" title="Online"></div>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link href="/login" className="nav-btn active">Log In</Link>
                <Link href="/register" className="nav-btn" style={{ background: 'var(--badge-bg)', color: 'var(--accent-pink)' }}>Sign Up</Link>
              </div>
            )}

            <button className="theme-toggle-btn" onClick={toggleTheme} title="Toggle Day/Night Mode">
              {theme === 'day' ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* PRE-LOGIN GUEST LANDING VIEW */}
        {!user && !loadingUser && (
          <div>
            <div className="anime-hero-card" style={{ gridTemplateColumns: '1fr' }}>
              <div className="hero-left-content" style={{ textAlign: 'center', alignItems: 'center' }}>
                <div className="hero-eyebrow">✨ 120+ Placement Prep Problems · Friend Circles · Study Lounge</div>
                <h1 className="hero-title" style={{ fontSize: 'clamp(32px, 5vw, 52px)' }}>
                  Master DSA Together with Your <span className="hl">Friends</span> 💕
                </h1>
                <p style={{ fontSize: '16px', color: 'var(--text-dim)', maxWidth: '640px', margin: '0 auto 24px', lineHeight: 1.6 }}>
                  Sakura Code is a cute, anime-styled DSA tracker designed specifically for study groups of 4-5 friends. Log in to track progress, solve curated problems, share custom questions, and join live study rooms!
                </p>

                <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <Link href="/register" className="btn-cute-primary" style={{ padding: '14px 28px', fontSize: '15px' }}>Get Started / Create Account 🚀</Link>
                  <Link href="/login" className="btn-cute-primary" style={{ background: 'var(--card-bg-solid)', color: 'var(--text-main)', border: '1px solid var(--glass-border)', padding: '14px 28px', fontSize: '15px' }}>Existing Account Log In</Link>
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginTop: '30px' }}>
              <div className="stat-card-cute" style={{ textAlign: 'left', padding: '24px' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>🌸</div>
                <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>120 Curated Problems</div>
                <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>Covering Arrays, Strings, Trees, BST, Graphs, DP, Sliding Window, and Backtracking.</div>
              </div>
              <div className="stat-card-cute" style={{ textAlign: 'left', padding: '24px' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>👥</div>
                <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>Friend Invites & Leaderboard</div>
                <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>Send invite links or add friends by username. Track each other's solved stats & daily streaks.</div>
              </div>
              <div className="stat-card-cute" style={{ textAlign: 'left', padding: '24px' }}>
                <div style={{ fontSize: '28px', marginBottom: '8px' }}>☕</div>
                <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>Group Study Room</div>
                <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>Live chat, anime stickers, 25m Pomodoro focus timer, and integrated Spotify/YouTube music.</div>
              </div>
            </div>
          </div>
        )}

        {/* LOGGED IN MAIN DASHBOARD */}
        {user && (
          <>
            {/* MAIN TAB: PROBLEMS & DASHBOARD */}
            {activeTab === 'problems' && (
              <div>
                {/* ANIME HERO BANNER & CUSTOM GIF MASCOT */}
                <div className="anime-hero-card">
                  <div className="hero-left-content">
                    <div>
                      <div className="hero-eyebrow">✨ Placement Prep · 120+ Curated Problems</div>
                      <h1 className="hero-title">Welcome back, <span className="hl">{user.username}</span>! 💕</h1>
                      <div className="hero-quote-box">
                        "落ち着いて、一問ずつ。" — Step by step, problem by problem.
                      </div>
                    </div>
                    <div style={{ fontSize: '12.5px', color: 'var(--text-dim)' }}>
                      📌 Custom Shared Problems: <strong style={{ color: 'var(--accent-pink)' }}>{customProblems.length}</strong> &nbsp;|&nbsp; 
                      👥 Study Friends: <strong style={{ color: 'var(--accent-gold)' }}>{friends.length}</strong>
                    </div>
                  </div>

                  {/* Mascot Widget with User's Custom GIF */}
                  <div className="mascot-widget">
                    <div className="speech-bubble">{getDynamicMascotSpeech()}</div>
                    <div className="mascot-img-box" style={{ borderRadius: '24px', width: '150px', height: '150px' }}>
                      <img src={user.mascotGif || '/mascots/default.gif'} alt="Custom Mascot GIF" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = '/mascots/default.gif'; }} />
                    </div>
                    <div className="mascot-name">{user.username}'s Mascot 🌸</div>
                    <button style={{ border: 'none', background: 'none', color: 'var(--accent-pink)', fontSize: '11px', fontWeight: 700, cursor: 'pointer', marginTop: '4px' }} onClick={() => setShowProfileModal(true)}>⚙️ Change GIF & Avatar</button>
                  </div>
                </div>

                {/* PROGRESS STATS & RING */}
                <div className="stats-grid">
                  <div className="ring-box">
                    <div className="ring-svg-wrap">
                      <svg viewBox="0 0 120 120">
                        <defs>
                          <linearGradient id="pinkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#ff6b8b"/>
                            <stop offset="100%" stopColor="#ffb84d"/>
                          </linearGradient>
                        </defs>
                        <circle className="ring-bg" cx="60" cy="60" r="50"/>
                        <circle className="ring-fg" cx="60" cy="60" r="50" strokeDasharray="314" strokeDashoffset={strokeOffset}/>
                      </svg>
                      <div className="ring-center-text">
                        <div className="ring-pct">{overallPct}%</div>
                        <div className="ring-lbl">Done</div>
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>🎯 {totalSolved} / {totalQ} Solved</div>
                      <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '6px' }}>📂 {topicsDone} / {topics.length} Topics</div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>🔄 {revCount} Revisions Logged</div>
                    </div>
                  </div>

                  <div className="cards-row">
                    <div className="stat-card-cute">
                      <div className="stat-card-num">{easyDone}/{easyTotal}</div>
                      <div className="stat-card-lbl">Easy Solved</div>
                    </div>
                    <div className="stat-card-cute">
                      <div className="stat-card-num" style={{ color: 'var(--accent-gold)' }}>{medDone}/{medTotal}</div>
                      <div className="stat-card-lbl">Medium Solved</div>
                    </div>
                    <div className="stat-card-cute">
                      <div className="stat-card-num" style={{ color: 'var(--accent-pink-deep)' }}>{hardDone}/{hardTotal}</div>
                      <div className="stat-card-lbl">Hard Solved</div>
                    </div>
                  </div>
                </div>

                {/* DIFFICULTY BARS */}
                <div className="diff-section">
                  <div className="diff-bars-grid">
                    <div className="diff-col">
                      <div className="diff-hdr"><span>Easy</span><span>{easyDone}/{easyTotal}</span></div>
                      <div className="diff-track-bg"><div className="diff-fill-bar easy" style={{ width: `${easyTotal ? (easyDone/easyTotal*100) : 0}%` }}></div></div>
                    </div>
                    <div className="diff-col">
                      <div className="diff-hdr"><span>Medium</span><span>{medDone}/{medTotal}</span></div>
                      <div className="diff-track-bg"><div className="diff-fill-bar medium" style={{ width: `${medTotal ? (medDone/medTotal*100) : 0}%` }}></div></div>
                    </div>
                    <div className="diff-col">
                      <div className="diff-hdr"><span>Hard</span><span>{hardDone}/{hardTotal}</span></div>
                      <div className="diff-track-bg"><div className="diff-fill-bar hard" style={{ width: `${hardTotal ? (hardDone/hardTotal*100) : 0}%` }}></div></div>
                    </div>
                  </div>
                </div>

                {/* MILESTONE BANNER */}
                {currentMilestone && (
                  <div style={{ background: 'linear-gradient(135deg, rgba(255, 184, 77, 0.2), rgba(255, 107, 139, 0.2))', border: '1px solid var(--accent-gold)', borderRadius: '24px', padding: '16px 24px', marginBottom: '28px', textAlign: 'center' }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '11px', fontWeight: 700, color: 'var(--accent-pink)', textTransform: 'uppercase' }}>{currentMilestone.tag}</div>
                    <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '22px', fontWeight: 700, margin: '4px 0', color: 'var(--text-main)' }}>{currentMilestone.title}</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>{currentMilestone.desc}</div>
                  </div>
                )}

                {/* SEARCH & FILTER BAR */}
                <div style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: '24px', padding: '14px 20px', marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  <input type="text" className="input-cute" style={{ flex: 1, minWidth: '200px' }} placeholder="🔍 Search problems by keyword (e.g., Kadane, Rain Water)..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['ALL', 'Easy', 'Medium', 'Hard'].map(d => (
                      <button key={d} className={`nav-btn ${diffFilter === d ? 'active' : ''}`} style={{ padding: '6px 12px', fontSize: '12px' }} onClick={() => setDiffFilter(d)}>{d}</button>
                    ))}
                  </div>
                </div>

                {/* TOPICS HEADER & ADD PROBLEM BUTTON */}
                <div className="topics-action-header">
                  <div className="section-title">🌸 DSA Master Sheet</div>
                  <button className="btn-cute-primary" onClick={() => setShowAddModal(true)}>➕ Add Custom Problem</button>
                </div>

                {/* TOPICS ACCORDION WITH NOTES DRAWER */}
                <div className="topics-list">
                  {topics.map((topic, ti) => {
                    let tSolved = 0;
                    const filteredItems = topic.items.filter(item => {
                      const [title, diff] = item;
                      const matchQuery = title.toLowerCase().includes(searchQuery.toLowerCase());
                      const matchDiff = diffFilter === 'ALL' || diff === diffFilter;
                      return matchQuery && matchDiff;
                    });

                    if (filteredItems.length === 0 && searchQuery) return null;

                    topic.items.forEach((_, qi) => { if (solvedState[`${topic.name}_${qi}`]) tSolved++; });
                    const pct = Math.round((tSolved / topic.items.length) * 100);
                    const isOpen = !!openTopics[ti] || !!searchQuery;

                    return (
                      <div key={topic.name} className={`topic-card ${isOpen ? 'open' : ''}`}>
                        <div className="topic-header" onClick={() => setOpenTopics(prev => ({ ...prev, [ti]: !prev[ti] }))}>
                          <div className="topic-badge-num">{ti + 1}</div>
                          <div style={{ flex: 1 }}>
                            <div className="topic-name">{topic.name}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '2px' }}>{tSolved} / {topic.items.length} solved</div>
                          </div>
                          <div className="topic-progress-track">
                            <div className="topic-progress-fill" style={{ width: `${pct}%` }}></div>
                          </div>
                        </div>

                        {isOpen && (
                          <div className="q-rows-container">
                            {filteredItems.map((item) => {
                              const [title, diff, platform, link, addedBy] = item;
                              const qi = topic.items.findIndex(i => i[0] === title);
                              const qKey = `${topic.name}_${qi}`;
                              const isDone = !!solvedState[qKey];
                              const isRev1 = !!rev1State[qKey];
                              const isRev2 = !!rev2State[qKey];
                              const isNotesExpanded = expandedNotesKey === qKey;

                              return (
                                <div key={qKey} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  <div className={`q-row-item ${isDone ? 'done' : ''}`}>
                                    <div className={`chk-custom ${isDone ? 'checked' : ''}`} onClick={() => handleToggleCheck(qKey, 'solve')}>
                                      {isDone && <span style={{ color: '#fff', fontSize: '12px' }}>✓</span>}
                                    </div>
                                    <div>
                                      <a href={link} target="_blank" rel="noopener" className="q-title-link">{title}</a>
                                      <span style={{ fontSize: '11px', color: 'var(--text-dim)' }}> ({platform})</span>
                                      {addedBy && <span className="added-by-tag">Added by {addedBy}</span>}
                                      <button style={{ border: 'none', background: 'none', color: 'var(--accent-purple)', fontSize: '11px', cursor: 'pointer', marginLeft: '8px' }} onClick={() => setExpandedNotesKey(isNotesExpanded ? null : qKey)}>
                                        📝 {notes[qKey] ? 'Edit Notes' : '+ Add Note'}
                                      </button>
                                    </div>
                                    <span className={`pill-diff ${diff.toLowerCase()}`}>{diff}</span>
                                    <div className="rev-check-group">
                                      <div className={`rev-box ${isRev1 ? 'checked' : ''}`} onClick={() => handleToggleCheck(qKey, 'rev1')} title="Revision 1"></div>
                                      <div className={`rev-box ${isRev2 ? 'checked' : ''}`} onClick={() => handleToggleCheck(qKey, 'rev2')} title="Revision 2"></div>
                                    </div>
                                  </div>

                                  {/* Code Notes & Intuition Drawer */}
                                  {isNotesExpanded && (
                                    <div style={{ background: 'var(--card-bg-solid)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '12px 16px', margin: '4px 0 10px 36px' }}>
                                      <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', marginBottom: '6px' }}>📝 Personal Intuition & Code Notes for {title}:</div>
                                      <textarea
                                        className="input-cute"
                                        style={{ height: '80px', fontFamily: 'JetBrains Mono, monospace', fontSize: '12px' }}
                                        placeholder="Paste Python/Java/C++ code snippet or key intuition notes..."
                                        value={notes[qKey] || ''}
                                        onChange={(e) => handleSaveNote(qKey, e.target.value)}
                                      />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* MAIN TAB: STUDY ROOM */}
            {activeTab === 'study' && (
              <div style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: '28px', padding: '24px', boxShadow: 'var(--shadow-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div className="section-title">☕ Group Study Lounge — Live Chat</div>
                  <button className="nav-btn" style={{ fontSize: '11.5px', color: 'var(--accent-pink)' }} onClick={handleClearChatHistory}>🗑️ Clear Old Chat Logs</button>
                </div>
                <p style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '16px' }}>Chat in real-time with your friends while solving DSA problems!</p>

                {/* ANIME POMODORO TIMER WIDGET */}
                <div style={{ background: 'linear-gradient(135deg, rgba(255,107,139,0.12), rgba(255,184,77,0.12))', border: '1px solid var(--glass-border)', borderRadius: '22px', padding: '16px 20px', marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContainer: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>⏱️ Anime Pomodoro Timer ({pomoMode.toUpperCase()})</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-dim)' }}>25 min Focus Session / 5 min Break</div>
                  </div>

                  <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '32px', fontWeight: 700, color: 'var(--accent-pink)' }}>
                    {formatTime(pomoTime)}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn-cute-primary" onClick={() => setPomoActive(!pomoActive)}>
                      {pomoActive ? '❚❚ Pause' : '▶ Start Focus'}
                    </button>
                    <button className="nav-btn" onClick={() => { setPomoActive(false); setPomoTime(pomoMode === 'focus' ? 25 * 60 : 5 * 60); }}>Reset</button>
                  </div>
                </div>

                <div style={{ height: '280px', overflowY: 'auto', background: 'rgba(0,0,0,0.03)', borderRadius: '18px', padding: '14px', margin: '16px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {chatMessages.map(msg => (
                    <div key={msg.id} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <img src={msg.avatar || '/avatars/default.png'} alt="Avatar" style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = '/avatars/default.png'; }} />
                      <div style={{ background: 'var(--card-bg-solid)', border: '1px solid var(--glass-border)', padding: '8px 14px', borderRadius: '16px', fontSize: '13px', maxWidth: '80%' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '2px' }}>{msg.username}</div>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Anime Sticker Picker */}
                <div style={{ display: 'flex', gap: '6px', marginBottom: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                  {['(◕‿◕✿)', '(๑•̀ㅂ•́)و', '(｡♥‿♥｡)', '(>_<)', '(≧◡≦)', '🔥 Sugoi!', '🚀 Solved!'].map(sticker => (
                    <button key={sticker} className="source-tab-btn" onClick={() => setChatInput(prev => prev + ' ' + sticker)}>{sticker}</button>
                  ))}
                </div>

                <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '10px' }}>
                  <input type="text" className="input-cute" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder="Type a message or sticker to your friends..." />
                  <button type="submit" className="btn-cute-primary">Send 💌</button>
                </form>
              </div>
            )}

            {/* MAIN TAB: FRIENDS LEADERBOARD & INVITES */}
            {activeTab === 'friends' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
                  <div>
                    <div className="section-title">👥 Friends Leaderboard & Invites</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-dim)' }}>Track real-time progress of your accepted friends.</div>
                  </div>

                  <button className="btn-cute-primary" onClick={() => setShowFriendModal(true)}>➕ Add / Invite Friend</button>
                </div>

                {friends.length === 0 ? (
                  <div className="stat-card-cute" style={{ textAlign: 'center', padding: '30px' }}>
                    <div style={{ fontSize: '32px', marginBottom: '8px' }}>👥</div>
                    <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>No Friends Added Yet</div>
                    <div style={{ fontSize: '13px', color: 'var(--text-dim)', marginBottom: '14px' }}>Send a friend request by username or share your invite link to study together!</div>
                    <button className="btn-cute-primary" style={{ margin: '0 auto' }} onClick={() => setShowFriendModal(true)}>➕ Add Friend</button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                    {friends.map(f => (
                      <div key={f.id || f.username} style={{ background: 'var(--card-bg)', border: '1px solid var(--glass-border)', borderRadius: '20px', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <img src={f.avatar || '/avatars/default.png'} alt="Avatar" style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = '/avatars/default.png'; }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700 }}>
                            <span>{f.username}</span>
                            <span style={{ fontSize: '11.5px', color: 'var(--accent-pink)' }}>{f.solvedCount || 0} solved</span>
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-dim)', marginTop: '2px' }}>{f.status || 'Online 🟢'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

      </div>

      {/* FLOATING MUSIC PLAYER WINDOW (Visible only when logged in) */}
      {user && (
        <div className={`music-floating-player ${isPlayerExpanded ? 'expanded' : ''}`}>
          <div className="player-top-row">
            <div className={`vinyl-disc ${isPlaying ? 'playing' : ''}`}>
              <div className="vinyl-center-dot"></div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '13.5px', fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Music Lounge — Spotify & YouTube</div>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Connect to personal YouTube / Spotify</div>
            </div>
            <button className="btn-icon-play" onClick={() => setIsPlaying(!isPlaying)} title={isPlaying ? "Pause" : "Play"}>
              {isPlaying ? '❚❚' : '▶'}
            </button>
            <button className="btn-icon-play" style={{ background: 'var(--badge-bg)', color: 'var(--text-main)', fontSize: '11px' }} onClick={() => setIsPlayerExpanded(!isPlayerExpanded)} title="Expand/Minimize Player">
              {isPlayerExpanded ? '▼ Minimize' : '▲ Enlarge'}
            </button>
          </div>

          {isPlayerExpanded && (
            <div className="player-expand-panel">
              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
                <button style={{ flex: 1, border: 'none', background: musicSource === 'youtube' ? 'var(--accent-pink)' : 'rgba(0,0,0,0.05)', color: musicSource === 'youtube' ? '#fff' : 'var(--text-dim)', padding: '6px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }} onClick={() => setMusicSource('youtube')}>📺 YouTube</button>
                <button style={{ flex: 1, border: 'none', background: musicSource === 'spotify' ? 'var(--accent-pink)' : 'rgba(0,0,0,0.05)', color: musicSource === 'spotify' ? '#fff' : 'var(--text-dim)', padding: '6px', borderRadius: '12px', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }} onClick={() => setMusicSource('spotify')}>🎵 Spotify</button>
              </div>

              {musicSource === 'youtube' ? (
                <div>
                  <select className="select-cute" style={{ fontSize: '11.5px', padding: '6px 10px', marginBottom: '8px' }} value={ytStreamId} onChange={(e) => setYtStreamId(e.target.value)}>
                    <option value="jfKfPfyJRdk">🎧 Lofi Girl - Beats to Relax/Study</option>
                    <option value="5qap5aO4i9A">🌸 Anime Lofi Chill Beats</option>
                    <option value="MVPTG06GI8c">🌃 Japanese City Pop & Synth</option>
                    <option value="7NOSDKb0HlU">☕ Chillhop Cafe Radio</option>
                  </select>
                </div>
              ) : (
                <div>
                  <input type="text" className="input-cute" style={{ fontSize: '11.5px', padding: '6px 10px', marginBottom: '8px' }} value={spotifyUrl} onChange={(e) => setSpotifyUrl(e.target.value)} placeholder="Paste Spotify embed URL or track link..." />
                </div>
              )}

              {isPlaying ? (
                <div style={{ width: '100%', height: '180px', borderRadius: '16px', overflow: 'hidden' }}>
                  <iframe
                    src={musicSource === 'youtube' ? `https://www.youtube.com/embed/${ytStreamId}?autoplay=1&mute=0` : spotifyUrl}
                    style={{ width: '100%', height: '100%', border: 0 }}
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  />
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(0,0,0,0.03)', borderRadius: '16px', fontSize: '12px', color: 'var(--text-dim)' }}>
                  Click <strong>▶ Play</strong> to launch mini web player frame & sign in!
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD CUSTOM PROBLEM */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-box-cute">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '18px', fontWeight: 700 }}>➕ Add Custom Problem</span>
              <button style={{ border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer' }} onClick={() => setShowAddModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddProblem}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Problem Title</label>
                <input type="text" className="input-cute" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Trapping Rain Water II" required />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Category / Topic</label>
                <select className="select-cute" value={newTopic} onChange={(e) => setNewTopic(e.target.value)}>
                  {topics.map(t => <option key={t.name} value={t.name}>{t.name}</option>)}
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Difficulty</label>
                <select className="select-cute" value={newDiff} onChange={(e) => setNewDiff(e.target.value)}>
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Link URL</label>
                <input type="text" className="input-cute" value={newLink} onChange={(e) => setNewLink(e.target.value)} placeholder="https://leetcode.com/problems/..." />
              </div>

              <button type="submit" className="btn-cute-primary" style={{ width: '100%', justifyContent: 'center' }}>Add Problem 🚀</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / INVITE FRIEND */}
      {showFriendModal && (
        <div className="modal-overlay">
          <div className="modal-box-cute">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '18px', fontWeight: 700 }}>👥 Invite & Add Friends</span>
              <button style={{ border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer' }} onClick={() => setShowFriendModal(false)}>✕</button>
            </div>

            {/* Shareable Invite Link */}
            <div style={{ background: 'var(--badge-bg)', border: '1px solid var(--glass-border)', borderRadius: '16px', padding: '12px', marginBottom: '18px' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-pink)', marginBottom: '4px' }}>🔗 Shareable Invite Link:</div>
              <div style={{ fontSize: '11.5px', fontFamily: 'JetBrains Mono, monospace', wordBreak: 'break-all', color: 'var(--text-main)' }}>
                {typeof window !== 'undefined' ? `${window.location.origin}/register?invite=${user?.inviteCode || ''}` : ''}
              </div>
              <button
                className="btn-cute-primary"
                style={{ fontSize: '11px', padding: '6px 12px', marginTop: '8px' }}
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/register?invite=${user?.inviteCode || ''}`);
                  alert('Invite link copied to clipboard!');
                }}
              >
                📋 Copy Link
              </button>
            </div>

            {/* Send Request Form */}
            <form onSubmit={handleSendFriendRequest}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Send Request by Username / Invite Code</label>
                <input type="text" className="input-cute" value={friendInput} onChange={(e) => setFriendInput(e.target.value)} placeholder="Enter friend's username or invite code..." required />
              </div>

              {friendMsg && (
                <div style={{ fontSize: '12px', color: 'var(--accent-pink)', marginBottom: '10px' }}>{friendMsg}</div>
              )}

              <button type="submit" className="btn-cute-primary" style={{ width: '100%', justifyContent: 'center' }}>Send Friend Request 💌</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PENDING FRIEND REQUESTS */}
      {showRequestsModal && (
        <div className="modal-overlay">
          <div className="modal-box-cute">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '18px', fontWeight: 700 }}>🔔 Pending Friend Requests</span>
              <button style={{ border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer' }} onClick={() => setShowRequestsModal(false)}>✕</button>
            </div>

            {pendingRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', fontSize: '13px', color: 'var(--text-dim)' }}>
                No pending friend requests.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {pendingRequests.map(req => (
                  <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--card-bg)', border: '1px solid var(--glass-border)', padding: '10px 14px', borderRadius: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img src={req.sender.avatar || '/avatars/default.png'} alt="Avatar" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => { e.target.onerror = null; e.target.src = '/avatars/default.png'; }} />
                      <span style={{ fontSize: '13.5px', fontWeight: 700 }}>{req.sender.username}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn-cute-primary" style={{ fontSize: '11px', padding: '6px 12px' }} onClick={() => handleProcessRequest(req.id, 'ACCEPT')}>Accept</button>
                      <button className="nav-btn" style={{ fontSize: '11px', padding: '6px 12px' }} onClick={() => handleProcessRequest(req.id, 'REJECT')}>Reject</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: PROFILE & GIF MASCOT CUSTOMIZATION */}
      {showProfileModal && (
        <div className="modal-overlay">
          <div className="modal-box-cute">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <span style={{ fontFamily: 'Fredoka, sans-serif', fontSize: '18px', fontWeight: 700 }}>⚙️ Customize Profile & Mascot</span>
              <button style={{ border: 'none', background: 'transparent', fontSize: '18px', cursor: 'pointer' }} onClick={() => setShowProfileModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSaveProfileSettings}>
              {/* Custom Profile Photo Upload / URL */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Profile Photo URL / Upload Image</label>
                <input type="text" className="input-cute" value={profilePhotoUrl} onChange={(e) => setProfilePhotoUrl(e.target.value)} placeholder="/avatars/default.png or image URL..." style={{ marginBottom: '6px' }} />
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setProfilePhotoUrl)} style={{ fontSize: '11px' }} />
              </div>

              {/* Custom Mascot GIF Upload / URL */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Mascot GIF URL / Upload GIF</label>
                <input type="text" className="input-cute" value={mascotGifUrl} onChange={(e) => setMascotGifUrl(e.target.value)} placeholder="/mascots/default.gif or GIF URL..." style={{ marginBottom: '6px' }} />
                <input type="file" accept="image/gif,image/*" onChange={(e) => handleFileUpload(e, setMascotGifUrl)} style={{ fontSize: '11px' }} />
              </div>

              {/* Activity Status Message */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', display: 'block', marginBottom: '4px' }}>Status Message</label>
                <input type="text" className="input-cute" value={userStatusMsg} onChange={(e) => setUserStatusMsg(e.target.value)} placeholder="e.g. Coding Kadane's Algorithm 🚀" />
              </div>

              <button type="submit" className="btn-cute-primary" style={{ width: '100%', justifyContent: 'center' }}>Save Settings ✨</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
