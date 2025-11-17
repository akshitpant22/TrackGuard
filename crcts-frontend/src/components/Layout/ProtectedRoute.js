import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner}></div>
        <p>Checking permissions...</p>
      </div>
    );
  }

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  const userGroups = user.groups || [];
  const hasPermission = allowedRoles.some(role => 
    userGroups.includes(role) || user.is_superuser
  );

  // If user doesn't have permission, show access denied
  if (!hasPermission) {
    return (
      <div style={styles.accessDenied}>
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
        <p>Your roles: {userGroups.join(', ') || 'None'}</p>
        <p>Required roles: {allowedRoles.join(', ')}</p>
        <button 
          onClick={() => window.location.href = '/login'}
          style={styles.button}
        >
          Go to Login
        </button>
      </div>
    );
  }

  // User has permission, show the protected content
  return children;
};

// Styles for the component
const styles = {
  loading: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5',
    fontFamily: 'Arial, sans-serif'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px'
  },
  accessDenied: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#fff5f5',
    color: '#c53030',
    textAlign: 'center',
    fontFamily: 'Arial, sans-serif',
    padding: '20px'
  },
  button: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#667eea',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px'
  }
};

// Add CSS for spinner animation
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(style);
}

export default ProtectedRoute;