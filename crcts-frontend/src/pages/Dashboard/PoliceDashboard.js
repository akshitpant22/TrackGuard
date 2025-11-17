import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import CriminalList from '../Criminal/CriminalList';
import FIRList from '../FIR/FIRList';
import CaseCriminalList from '../CaseCriminal/CaseCriminalList';
import CaseRecordList from '../CaseRecord/CaseRecordList';
import PoliceStationList from '../PoliceStation/PoliceStationList';

const PoliceDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalCriminals: 0,
    totalFIRs: 0,
    totalCaseCriminals: 0,
    totalCases: 0,
    totalPoliceStations: 0,
    loading: true
  });

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchStatistics();
    }
  }, [activeTab]);

  // ✅ FAST API CALL - Single endpoint like Admin Dashboard
  const fetchStatistics = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));
      console.log('⚡ Fetching fast police statistics...');

      // ✅ FIX: use correct token key
      const token = localStorage.getItem('access_token'); 
      if (!token) {
        console.warn('⚠️ No token found in localStorage (access_token missing).');
        setStats(prev => ({ ...prev, loading: false }));
        return;
      }

      const response = await fetch('http://127.0.0.1:8000/api/statistics/', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('✅ Police statistics fetched successfully:', data);

      setStats({
        totalCriminals: data.totalCriminals || 0,
        totalFIRs: data.totalFIRs || 0,
        totalCaseCriminals: data.totalCaseCriminals || 0,
        totalCases: data.totalCases || 0,
        totalPoliceStations: data.totalPoliceStations || 0,
        loading: false
      });
    } catch (error) {
      console.error('❌ Error fetching police statistics:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'criminals':
        return <CriminalList />;
      case 'firs':
        return <FIRList />;
      case 'caseCriminals':
        return <CaseCriminalList />;
      case 'caseRecords':
        return <CaseRecordList />;
      case 'policeStations':
        return <PoliceStationList />;
      default:
        return (
          <div style={styles.content}>
            {/* Statistics Overview Card */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>📊 Police Operations Overview</h3>
                <div style={styles.cardBadge}>Live Data</div>
              </div>
              {stats.loading ? (
                <div style={styles.loadingContainer}>
                  <div style={styles.loadingSpinner}></div>
                  <p style={styles.loadingText}>Loading statistics...</p>
                </div>
              ) : (
                <>
                  <div style={styles.statsGrid}>
                    <div style={styles.statItem}>
                      <div style={styles.statIcon}>👥</div>
                      <div style={styles.statInfo}>
                        <div style={styles.statNumber}>{stats.totalCriminals.toLocaleString()}</div>
                        <div style={styles.statLabel}>Total Criminals</div>
                      </div>
                    </div>
                    <div style={styles.statItem}>
                      <div style={styles.statIcon}>📋</div>
                      <div style={styles.statInfo}>
                        <div style={styles.statNumber}>{stats.totalFIRs.toLocaleString()}</div>
                        <div style={styles.statLabel}>FIR Records</div>
                      </div>
                    </div>
                    <div style={styles.statItem}>
                      <div style={styles.statIcon}>🔗</div>
                      <div style={styles.statInfo}>
                        <div style={styles.statNumber}>{stats.totalCaseCriminals.toLocaleString()}</div>
                        <div style={styles.statLabel}>Case-Criminal Links</div>
                      </div>
                    </div>
                    <div style={styles.statItem}>
                      <div style={styles.statIcon}>⚖️</div>
                      <div style={styles.statInfo}>
                        <div style={styles.statNumber}>{stats.totalCases.toLocaleString()}</div>
                        <div style={styles.statLabel}>Court Cases</div>
                      </div>
                    </div>
                    <div style={styles.statItem}>
                      <div style={styles.statIcon}>🏢</div>
                      <div style={styles.statInfo}>
                        <div style={styles.statNumber}>{stats.totalPoliceStations.toLocaleString()}</div>
                        <div style={styles.statLabel}>Police Stations</div>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={fetchStatistics} 
                    style={styles.refreshButton}
                  >
                    🔄 Refresh Data
                  </button>
                </>
              )}
            </div>

            {/* Quick Actions Card */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>🚀 Quick Actions</h3>
                <div style={styles.cardBadge}>Police Operations</div>
              </div>
              <div style={styles.actionsGrid}>
                <button 
                  style={styles.actionButton} 
                  onClick={() => setActiveTab('criminals')}
                >
                  <span style={styles.actionIcon}>👥</span>
                  <span style={styles.actionText}>Manage Criminals</span>
                </button>
                <button 
                  style={styles.actionButton} 
                  onClick={() => setActiveTab('firs')}
                >
                  <span style={styles.actionIcon}>📋</span>
                  <span style={styles.actionText}>Manage FIR Records</span>
                </button>
                <button 
                  style={styles.actionButton} 
                  onClick={() => setActiveTab('caseCriminals')}
                >
                  <span style={styles.actionIcon}>🔗</span>
                  <span style={styles.actionText}>Manage Case-Criminal Links</span>
                </button>
                <button 
                  style={styles.actionButton} 
                  onClick={() => setActiveTab('caseRecords')}
                >
                  <span style={styles.actionIcon}>📋</span>
                  <span style={styles.actionText}>View Case Records</span>
                </button>
                <button 
                  style={styles.actionButton} 
                  onClick={() => setActiveTab('policeStations')}
                >
                  <span style={styles.actionIcon}>🏢</span>
                  <span style={styles.actionText}>View Police Stations</span>
                </button>
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
            <h1 style={styles.title}>Police Dashboard</h1>
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userDetails}>
              <span style={styles.welcomeText}>Welcome,</span>
              <span style={styles.username}>{user?.username}</span>
              <span style={styles.userRole}>Police Officer</span>
            </div>
            <button onClick={logout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={styles.tabContainer}>
        <div style={styles.tabContent}>
          <button 
            style={activeTab === 'overview' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button 
            style={activeTab === 'criminals' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('criminals')}
          >
            👤 Criminals
          </button>
          <button 
            style={activeTab === 'firs' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('firs')}
          >
            📋 FIR Records
          </button>
          <button 
            style={activeTab === 'caseCriminals' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('caseCriminals')}
          >
            🔗 Case-Criminal
          </button>
          <button 
            style={activeTab === 'caseRecords' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('caseRecords')}
          >
            ⚖️ Case Records
          </button>
          <button 
            style={activeTab === 'policeStations' ? styles.activeTab : styles.tab}
            onClick={() => setActiveTab('policeStations')}
          >
            🏢 Police Stations
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={styles.mainContent}>
        {renderContent()}
      </div>
    </div>
  );
};
const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  header: {
    background: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
    color: 'white',
    padding: '0',
    boxShadow: '0 4px 20px rgba(30, 58, 138, 0.3)',
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
    boxShadow: '0 2px 10px rgba(30, 58, 138, 0.1)'
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
    borderBottom: '3px solid #1e3a8a',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1e3a8a',
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
    boxShadow: '0 4px 25px rgba(30, 58, 138, 0.08)',
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
    backgroundColor: '#dbeafe',
    color: '#1e3a8a',
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
    color: '#1e3a8a',
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
    backgroundColor: '#1e3a8a',
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
    borderTop: '4px solid #1e3a8a',
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
  color: '#1e3a8a',
  backgroundColor: '#f8fafc'
};

styles.actionButton[':hover'] = {
  backgroundColor: '#1e3a8a',
  color: 'white',
  transform: 'translateY(-2px)',
  boxShadow: '0 8px 20px rgba(30, 58, 138, 0.2)'
};

styles.statItem[':hover'] = {
  transform: 'translateY(-2px)',
  boxShadow: '0 8px 20px rgba(30, 58, 138, 0.1)',
  borderColor: '#3b82f6'
};

styles.refreshButton[':hover'] = {
  backgroundColor: '#1e40af',
  transform: 'translateY(-1px)',
  boxShadow: '0 6px 20px rgba(30, 58, 138, 0.3)'
};

styles.card[':hover'] = {
  transform: 'translateY(-2px)',
  boxShadow: '0 8px 30px rgba(30, 58, 138, 0.12)'
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

export default PoliceDashboard;