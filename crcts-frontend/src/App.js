import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import Login from './pages/Login';
import PoliceDashboard from './pages/Dashboard/PoliceDashboard';
import CourtDashboard from './pages/Dashboard/CourtDashboard';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import AdminCriminalList from './pages/Criminal/AdminCriminalList';
import SearchByFace from './pages/Criminal/SearchByFace';
import AdminFIRList from './pages/FIR/AdminFIRList';
import AdminCourtList from './pages/Court/AdminCourtList';
import AdminCaseRecordList from './pages/CaseRecord/AdminCaseRecordList';
import AdminPoliceStationList from './pages/PoliceStation/AdminPoliceStationList';
import AdminCaseCriminalList from './pages/CaseCriminal/AdminCaseCriminalList';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Loading CRCTS System...</p>
      </div>
    );
  }

  const getUserDashboard = (user) => {
    if (!user) return '/login';
    
    const groups = user.groups || [];
    const isSuperuser = user.is_superuser || false;
    
    if (isSuperuser) return '/admin';
    
  
    if (groups.includes('Police')) return '/police';
    if (groups.includes('Court')) return '/court';
    if (groups.includes('Admin')) return '/admin';
    
    return '/login';
  };

  return (
    <Routes>
    
      <Route 
        path="/login" 
        element={
          !user ? <Login /> : <Navigate to={getUserDashboard(user)} replace />
        } 
      />
      
      <Route 
        path="/police/*" 
        element={
          <ProtectedRoute allowedRoles={['Police', 'Admin']}>
            <PoliceDashboard />
          </ProtectedRoute>
        } 
      />
      
      <Route 
        path="/court/*" 
        element={
          <ProtectedRoute allowedRoles={['Court', 'Admin']}>
            <CourtDashboard />
          </ProtectedRoute>
        } 
      />
      

<Route 
  path="/admin/*" 
  element={
    <ProtectedRoute allowedRoles={['Admin']}>
      <AdminDashboard />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/admin-criminals" 
  element={
    <ProtectedRoute allowedRoles={['Admin']}>
      <AdminCriminalList />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/admin-firs" 
  element={
    <ProtectedRoute allowedRoles={['Admin']}>
      <AdminFIRList />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/admin-courts" 
  element={
    <ProtectedRoute allowedRoles={['Admin']}>
      <AdminCourtList />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/admin-cases" 
  element={
    <ProtectedRoute allowedRoles={['Admin']}>
      <AdminCaseRecordList />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/admin-police-stations" 
  element={
    <ProtectedRoute allowedRoles={['Admin']}>
      <AdminPoliceStationList />
    </ProtectedRoute>
  } 
/>

<Route 
  path="/admin-case-criminals" 
  element={
    <ProtectedRoute allowedRoles={['Admin']}>
      <AdminCaseCriminalList />
    </ProtectedRoute>
  } 
/>
    
      <Route 
        path="/" 
        element={<Navigate to={getUserDashboard(user)} replace />} 
      />

      <Route 
        path="/search-by-face" 
        element={
          <ProtectedRoute allowedRoles={['Police', 'Admin']}>
            <SearchByFace />
          </ProtectedRoute>
        } 
      />
      
      
      <Route path="*" element={<div style={styles.notFound}>404 - Page Not Found</div>} />
    </Routes>
  );
}


function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

const styles = {
  loading: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '5px solid #f3f3f3',
    borderTop: '5px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px'
  },
  notFound: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '24px',
    color: '#666'
  }
};

const styleSheet = document.styleSheets[0];
const keyframesRule = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

try {
  styleSheet.insertRule(keyframesRule, styleSheet.cssRules.length);
} catch (e) {

  const style = document.createElement('style');
  style.textContent = keyframesRule;
  document.head.appendChild(style);
}

export default App;