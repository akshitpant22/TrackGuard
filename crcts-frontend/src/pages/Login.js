import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [shake, setShake] = useState(false);
  const [btnState, setBtnState] = useState('idle');
  const [focusedField, setFocusedField] = useState(null);
  const [mounted, setMounted] = useState(false);
  const canvasRef = useRef(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { setTimeout(() => setMounted(true), 100); }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let t = 0;
    let mouse = { x: -1000, y: -1000 };

    const handleMouse = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener('mousemove', handleMouse);

    const orbs = Array.from({ length: 6 }, () => ({
      x: Math.random() * 1400,
      y: Math.random() * 900,
      r: 100 + Math.random() * 200,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.3,
      hue: 200 + Math.random() * 60,
      phase: Math.random() * Math.PI * 2,
    }));

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * 1400,
      y: Math.random() * 900,
      r: 1 + Math.random() * 2,
      vx: (Math.random() - 0.5) * 0.5,
      vy: -0.2 - Math.random() * 0.4,
      alpha: 0.15 + Math.random() * 0.3,
      hue: 200 + Math.random() * 40,
    }));

    const hexagons = Array.from({ length: 8 }, () => ({
      x: Math.random() * 1400,
      y: Math.random() * 900,
      size: 20 + Math.random() * 40,
      rotation: Math.random() * Math.PI,
      rotSpeed: (Math.random() - 0.5) * 0.005,
      alpha: 0.02 + Math.random() * 0.04,
    }));

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);

    const drawHexagon = (cx, cy, size, rotation, alpha) => {
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + rotation;
        const px = cx + size * Math.cos(angle);
        const py = cy + size * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.strokeStyle = `rgba(100, 140, 255, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      t += 0.008;

      orbs.forEach(orb => {
        orb.x += orb.dx + Math.sin(t * 0.7 + orb.phase) * 0.3;
        orb.y += orb.dy + Math.cos(t * 0.5 + orb.phase) * 0.2;
        if (orb.x < -300) orb.x = canvas.width + 300;
        if (orb.x > canvas.width + 300) orb.x = -300;
        if (orb.y < -300) orb.y = canvas.height + 300;
        if (orb.y > canvas.height + 300) orb.y = -300;

        const breathe = 1 + Math.sin(t * 2 + orb.phase) * 0.15;
        const r = orb.r * breathe;
        const grad = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, r);
        grad.addColorStop(0, `hsla(${orb.hue + Math.sin(t) * 20}, 70%, 50%, 0.07)`);
        grad.addColorStop(0.5, `hsla(${orb.hue}, 60%, 40%, 0.03)`);
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(orb.x - r, orb.y - r, r * 2, r * 2);
      });

      particles.forEach(p => {
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          p.x += (dx / dist) * 1.5;
          p.y += (dy / dist) * 1.5;
        }

        p.x += p.vx;
        p.y += p.vy;
        if (p.y < -10) { p.y = canvas.height + 10; p.x = Math.random() * canvas.width; }
        if (p.x < -10) p.x = canvas.width + 10;
        if (p.x > canvas.width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, 60%, 70%, ${p.alpha})`;
        ctx.fill();
      });

      ctx.lineWidth = 0.5;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            const alpha = (1 - dist / 100) * 0.08;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(120, 160, 255, ${alpha})`;
            ctx.stroke();
          }
        }
      }

      hexagons.forEach(h => {
        h.rotation += h.rotSpeed;
        drawHexagon(h.x, h.y, h.size, h.rotation, h.alpha + Math.sin(t + h.x) * 0.01);
      });

      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouse);
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username || !password) { triggerShake(); toast.error('Please fill in all fields'); return; }
    setLoading(true);
    setBtnState('loading');
    const result = await login(username, password);
    if (result.success) {
      setBtnState('success');
      toast.success('Login successful!');
      const user = result.user;
      const groups = user.groups || [];
      const isSuperuser = user.is_superuser || false;
      setTimeout(() => {
        if (isSuperuser || groups.includes('Admin')) navigate('/admin');
        else if (groups.includes('Police')) navigate('/police');
        else if (groups.includes('Court')) navigate('/court');
        else toast.error('No valid role assigned');
      }, 800);
    } else {
      setBtnState('error');
      triggerShake();
      toast.error(result.error || 'Login failed');
      setTimeout(() => setBtnState('idle'), 1500);
    }
    setLoading(false);
  };

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 600); };

  const getBtnStyle = () => {
    const base = { ...s.btn };
    switch (btnState) {
      case 'loading': return { ...base, background: 'linear-gradient(135deg, #1e3a5f, #1a2744)', color: '#64748b', cursor: 'wait', transform: 'scale(0.98)' };
      case 'success': return { ...base, background: 'linear-gradient(135deg, #16a34a, #15803d)', color: '#fff', transform: 'scale(1.02)' };
      case 'error': return { ...base, background: 'linear-gradient(135deg, #dc2626, #b91c1c)', color: '#fff' };
      default: return base;
    }
  };

  const getBtnText = () => {
    switch (btnState) {
      case 'loading': return (
        <span style={s.loadRow}>
          <span style={s.dotPulse}>
            <span style={{ ...s.dot, animationDelay: '0s' }}>●</span>
            <span style={{ ...s.dot, animationDelay: '0.2s' }}>●</span>
            <span style={{ ...s.dot, animationDelay: '0.4s' }}>●</span>
          </span>
          Authenticating
        </span>
      );
      case 'success': return '✓ Access Granted';
      case 'error': return '✕ Access Denied';
      default: return 'Sign In →';
    }
  };

  return (
    <div style={s.page}>
      <canvas ref={canvasRef} style={s.canvas} />
      <div style={s.ambientTop} />
      <div style={s.ambientBottom} />

      <div style={{
        ...s.wrapper,
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
      }}>

        <div style={s.logoArea}>
          <div style={s.shieldWrap}>
            <div style={s.shieldPulse} />
            <span style={s.shieldIcon}>🛡️</span>
          </div>
          <h1 style={s.brand}>TrackGuard</h1>
          <p style={s.tagline}>Crime Records & Criminal Tracking System</p>
          <div style={s.taglineLine} />
        </div>

        <div style={s.cardOuter}>
          <div style={{
            ...s.card,
            ...(shake ? { animation: 'tg-shake 0.6s cubic-bezier(.36,.07,.19,.97)' } : {}),
          }}>
            <h2 style={{
              ...s.cardTitle,
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0)' : 'translateY(10px)',
              transition: 'all 0.6s 0.2s ease',
            }}>Welcome back</h2>
            <p style={s.cardSubtitle}>Authenticate to access the system</p>

            <form onSubmit={handleSubmit}>
              <div style={{
                ...s.field,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(10px)',
                transition: 'all 0.6s 0.3s ease',
              }}>
                <label style={{
                  ...s.label,
                  color: focusedField === 'user' ? '#818cf8' : '#3e4560',
                }}>USERNAME</label>
                <div style={s.inputWrap}>
                  <input type="text" value={username} onChange={e => setUsername(e.target.value)}
                    onFocus={() => setFocusedField('user')} onBlur={() => setFocusedField(null)}
                    style={{
                      ...s.input,
                      borderColor: focusedField === 'user' ? '#6366f1' : '#1a1f35',
                    }}
                    placeholder="Enter username" disabled={loading} />
                  <div style={{
                    ...s.inputGlow,
                    opacity: focusedField === 'user' ? 1 : 0,
                  }} />
                </div>
              </div>

              <div style={{
                ...s.field,
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(10px)',
                transition: 'all 0.6s 0.4s ease',
              }}>
                <label style={{
                  ...s.label,
                  color: focusedField === 'pass' ? '#818cf8' : '#3e4560',
                }}>PASSWORD</label>
                <div style={{ ...s.inputWrap, position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('pass')} onBlur={() => setFocusedField(null)}
                    style={{
                      ...s.input, paddingRight: 60,
                      borderColor: focusedField === 'pass' ? '#6366f1' : '#1a1f35',
                    }}
                    placeholder="Enter password" disabled={loading} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    style={s.toggleBtn} disabled={loading}>
                    {showPassword ? 'HIDE' : 'SHOW'}
                  </button>
                  <div style={{
                    ...s.inputGlow,
                    opacity: focusedField === 'pass' ? 1 : 0,
                  }} />
                </div>
              </div>

              <div style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(10px)',
                transition: 'all 0.6s 0.5s ease',
              }}>
                <button type="submit" style={getBtnStyle()} disabled={loading || btnState === 'success'}>
                  {getBtnText()}
                </button>
              </div>
            </form>

            <div style={{
              ...s.roleRow,
              opacity: mounted ? 1 : 0,
              transition: 'opacity 0.6s 0.7s ease',
            }}>
              {[
                { name: 'Admin', color: '#16a34a' },
                { name: 'Police Officer', color: '#2e86de' },
                { name: 'Court Official', color: '#d97706' },
              ].map((r, i) => (
                <React.Fragment key={r.name}>
                  <div style={s.roleChip}>
                    <span style={{ ...s.roleDot, backgroundColor: r.color, boxShadow: `0 0 8px ${r.color}40` }} />
                    <span style={s.roleLabel}>{r.name}</span>
                  </div>
                  {i < 2 && <span style={s.roleDivider}>·</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes tg-shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-10px) rotate(-1deg); }
          30% { transform: translateX(10px) rotate(1deg); }
          45% { transform: translateX(-6px) rotate(-0.5deg); }
          60% { transform: translateX(6px) rotate(0.5deg); }
          75% { transform: translateX(-2px); }
        }
        @keyframes tg-dotBounce {
          0%, 80%, 100% { opacity: 0.3; transform: scale(0.8); }
          40% { opacity: 1; transform: scale(1.3); }
        }
        @keyframes tg-pulse {
          0%, 100% { transform: scale(1); opacity: 0.15; }
          50% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

const s = {
  page: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    minHeight: '100vh', background: '#06060c', position: 'relative',
    overflow: 'hidden', padding: 20, fontFamily: "'Inter', -apple-system, sans-serif",
  },
  canvas: { position: 'absolute', inset: 0, zIndex: 0 },
  ambientTop: {
    position: 'absolute', top: '-30%', left: '50%', transform: 'translateX(-50%)',
    width: '120%', height: '50%',
    background: 'radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  ambientBottom: {
    position: 'absolute', bottom: '-20%', left: '30%', transform: 'translateX(-50%)',
    width: '80%', height: '40%',
    background: 'radial-gradient(ellipse, rgba(59,130,246,0.04) 0%, transparent 70%)',
    pointerEvents: 'none', zIndex: 0,
  },
  wrapper: {
    position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: 20, maxWidth: 420, width: '100%',
  },
  logoArea: { textAlign: 'center', marginBottom: 4 },
  shieldWrap: { position: 'relative', display: 'inline-block', marginBottom: 12 },
  shieldPulse: {
    position: 'absolute', inset: -8,
    borderRadius: '50%', background: 'rgba(99,102,241,0.15)',
    animation: 'tg-pulse 3s ease-in-out infinite',
  },
  shieldIcon: {
    position: 'relative', fontSize: 40,
    filter: 'drop-shadow(0 0 20px rgba(99,102,241,0.4))',
  },
  brand: {
    fontSize: 32, fontWeight: 800, color: '#fff', letterSpacing: '-1px',
    margin: 0, lineHeight: 1,
    background: 'linear-gradient(135deg, #fff 0%, #a5b4fc 100%)',
    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  },
  tagline: {
    fontSize: 11, color: '#3e4560', marginTop: 10, letterSpacing: '1.8px',
    fontWeight: 500, textTransform: 'uppercase',
  },
  taglineLine: {
    width: 50, height: 2, margin: '14px auto 0',
    background: 'linear-gradient(90deg, transparent, #6366f1, transparent)',
    borderRadius: 1,
  },
  cardOuter: { position: 'relative', width: '100%' },
  card: {
    position: 'relative', zIndex: 1, width: '100%',
    background: 'rgba(10, 10, 20, 0.85)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: '1px solid rgba(99,102,241,0.1)',
    borderRadius: 18,
    padding: '34px 30px 26px',
  },
  cardTitle: { fontSize: 22, fontWeight: 700, color: '#e8eaf4', margin: '0 0 4px' },
  cardSubtitle: { fontSize: 13, color: '#3e4560', margin: '0 0 28px' },
  field: { marginBottom: 20 },
  label: {
    display: 'block', marginBottom: 8, fontSize: 10, fontWeight: 700,
    letterSpacing: '1.5px', textTransform: 'uppercase', transition: 'color 0.3s',
  },
  inputWrap: { position: 'relative' },
  input: {
    width: '100%', padding: '13px 16px', border: '1px solid #1a1f35',
    borderRadius: 10, fontSize: 14, backgroundColor: 'rgba(6,6,15,0.7)',
    color: '#e2e6ed', boxSizing: 'border-box',
    transition: 'border-color 0.3s, box-shadow 0.3s',
    fontFamily: "'Inter', sans-serif", outline: 'none',
  },
  inputGlow: {
    position: 'absolute', bottom: 0, left: '10%', right: '10%', height: 1,
    background: 'linear-gradient(90deg, transparent, #6366f1, transparent)',
    transition: 'opacity 0.3s', pointerEvents: 'none',
  },
  toggleBtn: {
    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
    background: 'none', border: 'none', fontSize: 10, fontWeight: 700,
    color: '#6366f1', cursor: 'pointer', letterSpacing: '1px',
  },
  btn: {
    width: '100%', padding: '14px',
    background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    color: '#fff', border: 'none', borderRadius: 10,
    fontSize: 14, fontWeight: 600, cursor: 'pointer',
    transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    marginTop: 6, letterSpacing: '0.5px',
    boxShadow: '0 4px 20px rgba(99,102,241,0.25)',
  },
  loadRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
  dotPulse: { display: 'inline-flex', gap: 3, marginRight: 6 },
  dot: {
    display: 'inline-block', fontSize: 8, lineHeight: 1,
    animation: 'tg-dotBounce 1s ease-in-out infinite',
  },
  roleRow: {
    display: 'flex', justifyContent: 'center', alignItems: 'center',
    gap: 12, marginTop: 24, paddingTop: 20,
    borderTop: '1px solid rgba(255,255,255,0.04)',
  },
  roleChip: { display: 'flex', alignItems: 'center', gap: 6 },
  roleDot: { width: 7, height: 7, borderRadius: '50%', transition: 'box-shadow 0.3s' },
  roleLabel: { fontSize: 11, fontWeight: 500, color: '#3e4560' },
  roleDivider: { fontSize: 14, color: '#1e2235', fontWeight: 300 },
};

export default Login;