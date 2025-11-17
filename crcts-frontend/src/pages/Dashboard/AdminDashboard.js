import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import AdminCriminalList from '../Criminal/AdminCriminalList';
import AdminFIRList from '../FIR/AdminFIRList';
import AdminCourtList from '../Court/AdminCourtList';
import AdminCaseRecordList from '../CaseRecord/AdminCaseRecordList';
import AdminPoliceStationList from '../PoliceStation/AdminPoliceStationList';
import AdminCaseCriminalList from '../CaseCriminal/AdminCaseCriminalList';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalCriminals: 0,
    totalFIRs: 0,
    totalCases: 0,
    totalCourts: 0,
    totalPoliceStations: 0,
    totalCaseCriminals: 0,
    loading: true
  });

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchStatistics();
    }
  }, [activeTab]);

  const fetchStatistics = async () => {
    try {
      setStats(prev => ({ ...prev, loading: true }));
      console.log('⚡ Fetching fast statistics summary...');

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
      console.log('✅ Statistics fetched successfully:', data);

      setStats({
        totalCriminals: data.totalCriminals || 0,
        totalFIRs: data.totalFIRs || 0,
        totalCases: data.totalCases || 0,
        totalCourts: data.totalCourts || 0,
        totalPoliceStations: data.totalPoliceStations || 0,
        totalCaseCriminals: data.totalCaseCriminals || 0,
        loading: false
      });
    } catch (error) {
      console.error('❌ Error fetching statistics:', error);
      setStats(prev => ({ ...prev, loading: false }));
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'criminals':
        return <AdminCriminalList />;
      case 'firs':
        return <AdminFIRList />;
      case 'courts':
        return <AdminCourtList />;
      case 'cases':
        return <AdminCaseRecordList />;
      case 'policeStations':
        return <AdminPoliceStationList />;
      case 'caseCriminals':
        return <AdminCaseCriminalList />;
      default:
        return (
          <div style={styles.content}>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>📊 System Overview</h3>
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
                    <StatItem icon="👥" label="Total Criminals" value={stats.totalCriminals} />
                    <StatItem icon="📋" label="FIR Records" value={stats.totalFIRs} />
                    <StatItem icon="⚖️" label="Court Cases" value={stats.totalCases} />
                    <StatItem icon="🏛️" label="Courts" value={stats.totalCourts} />
                    <StatItem icon="🏢" label="Police Stations" value={stats.totalPoliceStations} />
                    <StatItem icon="🔗" label="Case-Criminal Mappings" value={stats.totalCaseCriminals} />
                  </div>
                  <button onClick={fetchStatistics} style={styles.refreshButton}>
                    🔄 Refresh Data
                  </button>
                </>
              )}
            </div>
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>🚀 Quick Actions</h3>
                <div style={styles.cardBadge}>Management</div>
              </div>
              <div style={styles.actionsGrid}>
                <ActionButton label="Manage Criminals" icon="👥" onClick={() => setActiveTab('criminals')} />
                <ActionButton label="Manage FIRs" icon="📋" onClick={() => setActiveTab('firs')} />
                <ActionButton label="Manage Courts" icon="🏛️" onClick={() => setActiveTab('courts')} />
                <ActionButton label="Manage Cases" icon="⚖️" onClick={() => setActiveTab('cases')} />
                <ActionButton label="Manage Police Stations" icon="🏢" onClick={() => setActiveTab('policeStations')} />
                <ActionButton label="Manage Case-Criminal Mappings" icon="🔗" onClick={() => setActiveTab('caseCriminals')} />
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div style={styles.container}>
    
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerLeft}>
            <h1 style={styles.title}>Admin Dashboard</h1>
            <p style={styles.subtitle}>CRCTS Management System</p>
          </div>
          <div style={styles.userInfo}>
            <div style={styles.userDetails}>
              <span style={styles.welcomeText}>Welcome,</span>
              <span style={styles.username}>{user?.username}</span>
            </div>
            <button onClick={logout} style={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </div>
      <div style={styles.tabContainer}>
        <div style={styles.tabContent}>
          {['overview', 'criminals', 'firs', 'courts', 'cases', 'policeStations', 'caseCriminals'].map(tab => (
            <button
              key={tab}
              style={activeTab === tab ? styles.activeTab : styles.tab}
              onClick={() => setActiveTab(tab)}
            >
              {getTabIcon(tab)} {tab === 'overview' ? 'Overview' : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
      </div>


      <div style={styles.mainContent}>{renderContent()}</div>
    </div>
  );
};

const StatItem = ({ icon, label, value }) => (
  <div style={styles.statItem}>
    <div style={styles.statIcon}>{icon}</div>
    <div style={styles.statInfo}>
      <div style={styles.statNumber}>{value.toLocaleString()}</div>
      <div style={styles.statLabel}>{label}</div>
    </div>
  </div>
);

const ActionButton = ({ label, icon, onClick }) => (
  <button style={styles.actionButton} onClick={onClick}>
    <span style={styles.actionIcon}>{icon}</span>
    <span style={styles.actionText}>{label}</span>
  </button>
);

const getTabIcon = tab => {
  const icons = {
    overview: '📊',
    criminals: '👤',
    firs: '📋',
    courts: '🏛️',
    cases: '⚖️',
    policeStations: '🏢',
    caseCriminals: '🔗'
  };
  return icons[tab] || '📁';
};

const styles = {
  container: { minHeight: '100vh', backgroundColor: '#f8fdf9', fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" },
  header: { background: 'linear-gradient(135deg, #166534 0%, #22c55e 100%)', color: 'white', boxShadow: '0 4px 20px rgba(22,101,52,0.3)' },
  headerContent: { maxWidth: '1200px', margin: '0 auto', padding: '20px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerLeft: { display: 'flex', flexDirection: 'column', gap: '4px' },
  title: { margin: 0, fontSize: '32px', fontWeight: '700', letterSpacing: '-0.5px' },
  subtitle: { margin: 0, fontSize: '14px', fontWeight: '400', opacity: '0.9' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '20px' },
  userDetails: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' },
  welcomeText: { fontSize: '12px', opacity: '0.8' },
  username: { fontSize: '16px', fontWeight: '600' },
  logoutButton: { padding: '10px 20px', backgroundColor: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '8px', cursor: 'pointer' },
  tabContainer: { backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(22,101,52,0.1)' },
  tabContent: { maxWidth: '1200px', margin: '0 auto', padding: '0 30px', display: 'flex', flexWrap: 'wrap' },
  tab: { padding: '18px 24px', backgroundColor: 'transparent', border: 'none', borderBottom: '3px solid transparent', cursor: 'pointer', fontSize: '14px', color: '#64748b' },
  activeTab: { padding: '18px 24px', borderBottom: '3px solid #166534', fontWeight: '600', color: '#166534' },
  mainContent: { padding: '40px 30px', maxWidth: '1200px', margin: '0 auto' },
  content: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' },
  card: { backgroundColor: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 25px rgba(22,101,52,0.08)' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', paddingBottom: '15px', borderBottom: '2px solid #f1f9f5' },
  cardTitle: { fontSize: '20px', fontWeight: '600' },
  cardBadge: { padding: '6px 12px', backgroundColor: '#dcfce7', color: '#166534', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '25px' },
  statItem: { display: 'flex', alignItems: 'center', padding: '20px', backgroundColor: '#f8fdf9', borderRadius: '12px', border: '1px solid #e2e8f0' },
  statIcon: { fontSize: '28px', marginRight: '15px', opacity: '0.8' },
  statInfo: { flex: 1 },
  statNumber: { fontSize: '22px', fontWeight: '700', color: '#166534' },
  statLabel: { fontSize: '12px', color: '#64748b', textTransform: 'uppercase', fontWeight: '600' },
  actionsGrid: { display: 'grid', gridTemplateColumns: '1fr', gap: '12px' },
  actionButton: { display: 'flex', alignItems: 'center', padding: '18px 20px', backgroundColor: '#f8fdf9', color: '#334155', border: '1px solid #e2e8f0', borderRadius: '10px', cursor: 'pointer' },
  actionIcon: { fontSize: '20px', marginRight: '15px', opacity: '0.7' },
  actionText: { fontSize: '15px', fontWeight: '500' },
  refreshButton: { padding: '12px 24px', backgroundColor: '#166534', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' },
  loadingContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', gap: '15px' },
  loadingSpinner: { width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTop: '4px solid #166534', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  loadingText: { color: '#64748b', fontSize: '14px', fontWeight: '500' }
};

export default AdminDashboard;
