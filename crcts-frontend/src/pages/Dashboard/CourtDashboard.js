import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getStyles } from '../../styles/darkTheme';
import CourtList from '../Court/CourtList';
import CourtCaseRecordList from '../CaseRecord/CourtCaseRecordList';
import CourtCriminalList from '../Criminal/CourtCriminalList';
import CourtFIRList from '../FIR/CourtFIRList';
import CourtCaseCriminalList from '../CaseCriminal/CourtCaseCriminalList';

const ds = getStyles('court');
const t = ds.theme;

const CourtDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({ totalCourts:0, totalCaseRecords:0, totalCriminals:0, totalFIRs:0, totalCaseCriminals:0, loading:true });
  const [hoveredAction, setHoveredAction] = useState(null);

  useEffect(() => { if (activeTab === 'overview') fetchStatistics(); }, [activeTab]);
  useEffect(() => {
    const h = () => fetchStatistics();
    window.addEventListener('refreshStats', h);
    return () => window.removeEventListener('refreshStats', h);
  }, []);

  const fetchStatistics = async () => {
    try {
      setStats(p => ({ ...p, loading: true }));
      const token = localStorage.getItem('access_token');
      const response = await fetch('http://127.0.0.1:8000/api/statistics/', { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } });
      if (response.ok) {
        const data = await response.json();
        setStats({ totalCourts: data.totalCourts||0, totalCaseRecords: data.totalCases||0, totalCriminals: data.totalCriminals||0, totalFIRs: data.totalFIRs||0, totalCaseCriminals: data.totalCaseCriminals||0, loading: false });
      } else { setStats(p => ({ ...p, loading: false })); }
    } catch (error) { console.error('Error:', error); setStats(p => ({ ...p, loading: false })); }
  };

  const tabs = [
    ['overview','Overview'],['courts','Courts'],['caseRecords','Case Records'],
    ['criminals','Criminals'],['firs','FIRs'],['caseCriminals','Case-Criminal']
  ];

  const statCards = [
    { icon: '🏛️', label: 'Courts', value: stats.totalCourts },
    { icon: '📋', label: 'Case Records', value: stats.totalCaseRecords },
    { icon: '👤', label: 'Criminals', value: stats.totalCriminals },
    { icon: '📄', label: 'FIR Records', value: stats.totalFIRs },
    { icon: '🔗', label: 'Case-Criminal', value: stats.totalCaseCriminals },
  ];

  const quickActions = [
    { icon: '🏛️', label: 'View Courts', tab: 'courts' },
    { icon: '📋', label: 'Manage Case Records', tab: 'caseRecords' },
    { icon: '👤', label: 'View Criminals', tab: 'criminals' },
    { icon: '📄', label: 'View FIR Records', tab: 'firs' },
    { icon: '🔗', label: 'Case-Criminal Links', tab: 'caseCriminals' },
  ];

  const SkeletonCard = () => (
    <div style={{ background: t.surface, border: `1px solid ${t.border}`, borderRadius: 8, padding: '18px 16px', opacity: 0.5 }}>
      <div style={{ width: 48, height: 22, background: t.border, borderRadius: 4, marginBottom: 8 }} />
      <div style={{ width: 80, height: 10, background: t.border, borderRadius: 4 }} />
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'courts': return <CourtList />;
      case 'caseRecords': return <CourtCaseRecordList />;
      case 'criminals': return <CourtCriminalList />;
      case 'firs': return <CourtFIRList />;
      case 'caseCriminals': return <CourtCaseCriminalList />;
      default: return (
        <div style={{ animation: 'tg-slideIn 0.3s ease-out' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 20, minHeight: 'calc(100vh - 180px)' }}>


            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, flex: 1 }}>
                {stats.loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
                ) : (
                  statCards.map(({ icon, label, value }) => (
                    <div key={label} style={{
                      background: t.surface, borderLeft: `3px solid ${t.accent}`,
                      borderRadius: 8, padding: '18px 16px', display: 'flex', flexDirection: 'column', justifyContent: 'center',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                        <span style={{ fontSize: 16 }}>{icon}</span>
                        <span style={{ fontSize: 10, color: t.muted, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</span>
                      </div>
                      <div style={{ fontSize: 28, fontWeight: 700, color: t.accent, fontFamily: "'JetBrains Mono', monospace", lineHeight: 1 }}>
                        {value.toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div style={{ marginTop: 16 }}>
                <button onClick={fetchStatistics} style={{
                  padding: '9px 20px', background: t.accentBg, color: t.accent,
                  border: `1px solid ${t.accentBorder}`, borderRadius: 6,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer',
                }}>↻ Refresh Data</button>
              </div>
            </div>


            <div style={{ background: t.card, border: `1px solid ${t.border}`, borderRadius: 10, padding: 20, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: 13, fontWeight: 700, color: t.text, margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Judicial Actions</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                {quickActions.map(({ icon, label, tab }) => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    onMouseEnter={() => setHoveredAction(tab)} onMouseLeave={() => setHoveredAction(null)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '12px 12px',
                      background: hoveredAction === tab ? t.accentBg : 'transparent',
                      border: 'none', borderRadius: 6, cursor: 'pointer',
                      transition: 'all 0.2s', width: '100%', textAlign: 'left',
                    }}>
                    <span style={{ fontSize: 15, flexShrink: 0 }}>{icon}</span>
                    <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: hoveredAction === tab ? t.text : t.text2 }}>{label}</span>
                    <span style={{
                      fontSize: 14, color: t.accent, opacity: hoveredAction === tab ? 1 : 0,
                      transform: hoveredAction === tab ? 'translateX(0)' : 'translateX(-4px)',
                      transition: 'all 0.2s',
                    }}>→</span>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      );
    }
  };

  return (
    <div style={ds.container}>
      <div style={ds.header}><div style={ds.headerContent}>
        <div style={ds.headerLeft}>
          <h1 style={ds.title}>TrackGuard</h1>
          <div style={ds.headerDot} />
          <p style={ds.subtitle}>Court</p>
        </div>
        <div style={ds.userInfo}>
          <span style={ds.username}>{user?.username}</span>
          <button onClick={logout} style={ds.logoutButton}>Sign Out</button>
        </div>
      </div></div>
      <div style={ds.tabContainer}><div style={ds.tabContent}>
        {tabs.map(([key,label])=>(
          <button key={key} style={activeTab===key?ds.activeTab:ds.tab} onClick={()=>setActiveTab(key)}>{label}</button>
        ))}
      </div></div>
      <div style={ds.mainContent}>{renderContent()}</div>
    </div>
  );
};

export default CourtDashboard;