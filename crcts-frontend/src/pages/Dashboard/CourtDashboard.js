import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import CourtList from '../Court/CourtList';
import CourtCaseRecordList from '../CaseRecord/CourtCaseRecordList';
import CourtCriminalList from '../Criminal/CourtCriminalList';
import CourtFIRList from '../FIR/CourtFIRList';
import CourtCaseCriminalList from '../CaseCriminal/CourtCaseCriminalList';
import courtService from '../../services/courtService';
import caseRecordService from '../../services/caseRecordService';
import criminalService from '../../services/criminalService';
import firService from '../../services/firService';
import caseCriminalService from '../../services/caseCriminalService';

const CourtDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalCourts: 0,
    totalCaseRecords: 0,
    totalCriminals: 0,
    totalFIRs: 0,
    totalCaseCriminals: 0,
    loading: true
  });

  // Fetch on tab switch
  useEffect(() => {
    if (activeTab === 'overview') fetchStatistics();
  }, [activeTab]);

  // Auto-refresh (sync with admin)
  useEffect(() => {
    const handleRefresh = () => fetchStatistics();
    window.addEventListener('refreshStats', handleRefresh);
    return () => window.removeEventListener('refreshStats', handleRefresh);
  }, []);

  const fetchStatistics = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));
      console.log('🔄 Fetching court statistics...');

      const token = localStorage.getItem('access_token');
      let data = null;

      // Try unified API first
      try {
        const response = await fetch('http://127.0.0.1:8000/api/statistics/', {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          data = await response.json();
          setStats({
            totalCourts: data.totalCourts || 0,
            totalCaseRecords: data.totalCases || 0,
            totalCriminals: data.totalCriminals || 0,
            totalFIRs: data.totalFIRs || 0,
            totalCaseCriminals: data.totalCaseCriminals || 0,
            loading: false
          });
          return;
        }
      } catch (err) {
        console.warn('⚠️ Unified stats API failed, using fallback...', err);
      }

      // Fallback: individual services
      const [courts, cases, criminals, firs, links] = await Promise.allSettled([
        courtService.getCourts(),
        caseRecordService.getCaseRecords(),
        criminalService.getCriminals(),
        firService.getFirs(),
        caseCriminalService.getCaseCriminals()
      ]);

      const safeLen = result =>
        result?.value?.results?.length ||
        result?.value?.data?.length ||
        result?.value?.length ||
        0;

      setStats({
        totalCourts: safeLen(courts),
        totalCaseRecords: safeLen(cases),
        totalCriminals: safeLen(criminals),
        totalFIRs: safeLen(firs),
        totalCaseCriminals: safeLen(links),
        loading: false
      });
    } catch (error) {
      console.error('❌ Error fetching stats:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'courts':
        return <CourtList />;
      case 'caseRecords':
        return <CourtCaseRecordList />;
      case 'criminals':
        return <CourtCriminalList />;
      case 'firs':
        return <CourtFIRList />;
      case 'caseCriminals':
        return <CourtCaseCriminalList />;
      default:
        return (
          <div style={styles.content}>
            {/* Stats */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>⚖️ Judicial System Overview</h3>
                <div style={styles.cardBadge}>Live Data</div>
              </div>
              {stats.loading ? (
                <div style={styles.loadingContainer}>
                  <div style={styles.loadingSpinner}></div>
                  <p style={styles.loadingText}>Loading court statistics...</p>
                </div>
              ) : (
                <>
                  <div style={styles.statsGrid}>
                    <Stat icon="🏛️" label="Courts" value={stats.totalCourts} />
                    <Stat icon="📋" label="Case Records" value={stats.totalCaseRecords} />
                    <Stat icon="👥" label="Criminals" value={stats.totalCriminals} />
                    <Stat icon="📄" label="FIR Records" value={stats.totalFIRs} />
                    <Stat icon="🔗" label="Case-Criminal Links" value={stats.totalCaseCriminals} />
                  </div>
                  <button onClick={fetchStatistics} style={styles.refreshButton}>
                    🔄 Refresh Data
                  </button>
                </>
              )}
            </div>

            {/* Actions */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>🚀 Judicial Actions</h3>
                <div style={styles.cardBadge}>Court Operations</div>
              </div>
              <div style={styles.actionsGrid}>
                <Action icon="🏛️" label="View Courts" onClick={() => setActiveTab('courts')} />
                <Action icon="📋" label="Manage Case Records" onClick={() => setActiveTab('caseRecords')} />
                <Action icon="👥" label="View Criminals" onClick={() => setActiveTab('criminals')} />
                <Action icon="📄" label="View FIR Records" onClick={() => setActiveTab('firs')} />
                <Action icon="🔗" label="View Case-Criminal Links" onClick={() => setActiveTab('caseCriminals')} />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <h1 style={styles.title}>Court Dashboard</h1>
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userDetails}>
              <span style={styles.welcomeText}>Welcome,</span>
              <span style={styles.username}>{user?.username}</span>
              <span style={styles.userRole}>Court Official</span>
            </div>
            <button onClick={logout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabContainer}>
        <div style={styles.tabContent}>
          {[
            ['overview', '📊 Overview'],
            ['courts', '🏛️ Courts'],
            ['caseRecords', '📋 Case Records'],
            ['criminals', '👤 Criminals'],
            ['firs', '📄 FIRs'],
            ['caseCriminals', '🔗 Case-Criminal']
          ].map(([key, label]) => (
            <button
              key={key}
              style={activeTab === key ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div style={styles.mainContent}>{renderContent()}</div>
    </div>
  );
};

/* ✅ Helper components (for clarity) */
const Stat = ({ icon, label, value }) => (
  <div style={styles.statItem}>
    <div style={styles.statIcon}>{icon}</div>
    <div style={styles.statInfo}>
      <div style={styles.statNumber}>{value.toLocaleString()}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  </div>
);

const Action = ({ icon, label, onClick }) => (
  <button style={styles.actionButton} onClick={onClick}>
    <span style={styles.actionIcon}>{icon}</span>
    <span style={styles.actionText}>{label}</span>
  </button>
);

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  header: {
    background: 'linear-gradient(135deg, #722f37 0%, #8b4513 100%)',
    color: 'white',
    padding: '0',
    boxShadow: '0 4px 20px rgba(114, 47, 55, 0.3)',
    borderBottom: '1px solid #e2e8f0'
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px 30px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  headerLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  title: {
    margin: 0,
    fontSize: '32px',
    fontWeight: '700',
    letterSpacing: '-0.5px'
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  userDetails: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '2px'
  },
  welcomeText: {
    fontSize: '12px',
    fontWeight: '500',
    opacity: '0.8'
  },
  username: {
    fontSize: '16px',
    fontWeight: '600'
  },
  userRole: {
    fontSize: '12px',
    fontWeight: '500',
    opacity: '0.8',
    fontStyle: 'italic'
  },
  logoutButton: {
    padding: '10px 20px',
    backgroundColor: 'rgba(255,255,255,0.15)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)'
  },
  tabContainer: {
    backgroundColor: 'white',
    borderBottom: '1px solid #e2e8f0',
    boxShadow: '0 2px 10px rgba(114, 47, 55, 0.1)'
  },
  tabContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 30px',
    display: 'flex',
    gap: '0'
  },
  tab: {
    padding: '18px 24px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    color: '#64748b',
    transition: 'all 0.3s ease',
    borderRadius: '0'
  },
  activeTab: {
    padding: '18px 24px',
    backgroundColor: 'transparent',
    border: 'none',
    borderBottom: '3px solid #722f37',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#722f37',
    transition: 'all 0.3s ease',
    borderRadius: '0'
  },
  mainContent: {
    padding: '40px 30px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
    maxWidth: '1200px',
    margin: '0 auto'
  },
  card: {
    backgroundColor: 'white',
    padding: '30px',
    borderRadius: '16px',
    boxShadow: '0 4px 25px rgba(114, 47, 55, 0.08)',
    border: '1px solid #e2e8f0',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
    paddingBottom: '15px',
    borderBottom: '2px solid #f1f5f9'
  },
  cardTitle: {
    margin: 0,
    color: '#1e293b',
    fontSize: '20px',
    fontWeight: '600'
  },
  cardBadge: {
    padding: '6px 12px',
    backgroundColor: '#fae0e4',
    color: '#722f37',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.5px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '16px',
    marginBottom: '25px'
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    border: '1px solid #e2e8f0',
    transition: 'all 0.3s ease'
  },
  statIcon: {
    fontSize: '28px',
    marginRight: '15px',
    opacity: '0.8'
  },
  statInfo: {
    flex: 1
  },
  statNumber: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#722f37',
    marginBottom: '4px'
  },
  statLabel: {
    fontSize: '12px',
    color: '#64748b',
    textTransform: 'uppercase',
    fontWeight: '600',
    letterSpacing: '0.5px'
  },
  actionsGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr',
    gap: '12px'
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '18px 20px',
    backgroundColor: '#f8fafc',
    color: '#334155',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    textAlign: 'left',
    width: '100%'
  },
  actionIcon: {
    fontSize: '20px',
    marginRight: '15px',
    opacity: '0.7'
  },
  actionText: {
    fontSize: '15px',
    fontWeight: '500'
  },
  refreshButton: {
    padding: '12px 24px',
    backgroundColor: '#722f37',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    width: '100%',
    letterSpacing: '0.5px'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    gap: '15px'
  },
  loadingSpinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #722f37',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    color: '#64748b',
    fontSize: '14px',
    fontWeight: '500'
  }
};

// Add hover effects
styles.logoutButton[':hover'] = {
  backgroundColor: 'rgba(255,255,255,0.25)',
  transform: 'translateY(-1px)'
};

styles.tab[':hover'] = {
  color: '#722f37',
  backgroundColor: '#f8fafc'
};

styles.actionButton[':hover'] = {
  backgroundColor: '#722f37',
  color: 'white',
  transform: 'translateY(-2px)',
  boxShadow: '0 8px 20px rgba(114, 47, 55, 0.2)'
};

styles.statItem[':hover'] = {
  transform: 'translateY(-2px)',
  boxShadow: '0 8px 20px rgba(114, 47, 55, 0.1)',
  borderColor: '#8b4513'
};

styles.refreshButton[':hover'] = {
  backgroundColor: '#5a252b',
  transform: 'translateY(-1px)',
  boxShadow: '0 6px 20px rgba(114, 47, 55, 0.3)'
};

styles.card[':hover'] = {
  transform: 'translateY(-2px)',
  boxShadow: '0 8px 30px rgba(114, 47, 55, 0.12)'
};

// Add CSS animation for spinner
const spinnerStyle = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

// Inject the spinner animation
if (typeof document !== 'undefined' && document.styleSheets.length > 0) {
  const styleSheet = document.styleSheets[0];
  styleSheet.insertRule(spinnerStyle, styleSheet.cssRules.length);
}

export default CourtDashboard;