import React, { useState } from 'react';
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
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username || !password) {
      triggerShake();
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    const result = await login(username, password);
    if (result.success) {
      toast.success('Login successful!');
     
      const user = result.user;
      const groups = user.groups || [];
      const isSuperuser = user.is_superuser || false;
      
      if (isSuperuser || groups.includes('Admin')) {
        navigate('/admin');
      } else if (groups.includes('Police')) {
        navigate('/police');
      } else if (groups.includes('Court')) {
        navigate('/court');
      } else {
        toast.error('No valid role assigned');
      }
    } else {
      triggerShake();
      toast.error(result.error || 'Login failed');
    }
    
    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  return (
    <div style={styles.container}>
      <div style={styles.floatingBadge} className="floating">🔒</div>
      <div style={styles.floatingShield} className="floating">🛡️</div>
      
      <div style={styles.loginWrapper}>
        <div style={styles.welcomeSection}>
          <div style={styles.welcomeContent}>
            <div style={styles.welcomeText}>Welcome to</div>
            <h1 style={styles.systemTitle}>
              Crime Records &<br />
              Criminal Tracking<br />
              System
            </h1>
            <div style={styles.accentLine}></div>
          </div>
        </div>
        <div style={styles.loginSection}>
          <div style={styles.loginCard}>
            <h2 style={styles.loginTitle}>System Access</h2>
            
            <form onSubmit={handleSubmit} style={styles.form}>
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={{
                    ...styles.input,
                    ...(shake ? styles.inputError : {})
                  }}
                  placeholder="Enter your username"
                  required
                  disabled={loading}
                />
              </div>
              
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  Password
                </label>
                <div style={styles.inputContainer}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      ...styles.input,
                      ...(shake ? styles.inputError : {})
                    }}
                    placeholder="Enter your password"
                    required
                    disabled={loading}
                  />
                  <button 
                    type="button"
                    onClick={togglePasswordVisibility}
                    style={styles.eyeButton}
                    disabled={loading}
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>

              <div style={styles.rolesContainer}>
                <div style={styles.roleBadges}>
                  <div style={styles.roleBadge}>
                    <span style={styles.roleIcon}>👮</span>
                    Police
                  </div>
                  <div style={styles.roleBadge}>
                    <span style={styles.roleIcon}>⚖️</span>
                    Court
                  </div>
                  <div style={styles.roleBadge}>
                    <span style={styles.roleIcon}>👑</span>
                    Admin
                  </div>
                </div>
              </div>
              
              <button 
                type="submit" 
                style={loading ? styles.buttonDisabled : styles.button}
                disabled={loading}
                className="login-button"
              >
                {loading ? (
                  <div style={styles.loadingContent}>
                    <div style={styles.spinner}></div>
                    Authenticating...
                  </div>
                ) : (
                  'Login to System'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0c4a6e 0%, #1e3a8a 50%, #1e40af 100%)',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    padding: '20px',
    position: 'relative',
    overflow: 'hidden'
  },
  floatingBadge: {
    position: 'absolute',
    top: '15%',
    left: '8%',
    fontSize: '2rem',
    opacity: '0.1',
    animation: 'float 6s ease-in-out infinite'
  },
  floatingShield: {
    position: 'absolute',
    top: '75%',
    right: '8%',
    fontSize: '1.8rem',
    opacity: '0.1',
    animation: 'float 8s ease-in-out infinite 1s'
  },
  loginWrapper: {
    display: 'flex',
    width: '100%',
    maxWidth: '1000px',
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
    overflow: 'hidden',
    minHeight: '550px'
  },
  welcomeSection: {
    flex: 1,
    background: 'linear-gradient(135deg, #1e40af 0%, #3730a3 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '50px',
    color: 'white',
    position: 'relative'
  },
  welcomeContent: {
    maxWidth: '400px',
    textAlign: 'left'
  },
  welcomeText: {
    fontSize: '20px',
    fontWeight: '300',
    marginBottom: '15px',
    opacity: '0.9',
    letterSpacing: '1.2px'
  },
  systemTitle: {
    fontSize: '38px',
    fontWeight: '800',
    margin: '0 0 25px 0',
    lineHeight: '1.2',
    color: 'white',
    textShadow: '0 2px 10px rgba(0,0,0,0.1)'
  },
  accentLine: {
    width: '80px',
    height: '4px',
    background: 'rgba(255,255,255,0.9)',
    borderRadius: '2px'
  },
  loginSection: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '50px',
    background: 'white'
  },
  loginCard: {
    width: '100%',
    maxWidth: '380px'
  },
  loginTitle: {
    color: '#0f172a',
    fontSize: '32px',
    fontWeight: '700',
    margin: '0 0 30px 0',
    textAlign: 'center'
  },
  form: {
    textAlign: 'left'
  },
  inputGroup: {
    marginBottom: '24px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    color: '#475569',
    fontWeight: '600',
    fontSize: '14px'
  },
  inputContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  input: {
    width: '100%',
    padding: '16px',
    border: '2px solid #e2e8f0',
    borderRadius: '12px',
    fontSize: '16px',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    backgroundColor: 'white',
    fontFamily: 'inherit',
    paddingRight: '80px'
  },
  inputError: {
    borderColor: '#ef4444',
    boxShadow: '0 0 0 3px rgba(239, 68, 68, 0.1)',
    animation: 'shake 0.5s ease-in-out'
  },
  eyeButton: {
    position: 'absolute',
    right: '12px',
    background: 'none',
    border: 'none',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#64748b',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'all 0.2s ease',
    fontWeight: '500'
  },
  // Roles Container
  rolesContainer: {
    margin: '30px 0 20px 0'
  },
  roleBadges: {
    display: 'flex',
    justifyContent: 'space-around',
    gap: '10px'
  },
  roleBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    padding: '12px 8px',
    background: '#f8fafc',
    borderRadius: '10px',
    border: '2px solid #e2e8f0',
    fontSize: '13px',
    fontWeight: '600',
    color: '#475569',
    minWidth: '70px',
    transition: 'all 0.2s ease'
  },
  roleIcon: {
    fontSize: '18px'
  },
  button: {
    width: '100%',
    padding: '16px 24px',
    background: 'linear-gradient(135deg, #1e40af 0%, #3730a3 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '10px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(30, 64, 175, 0.3)'
  },
  buttonDisabled: {
    width: '100%',
    padding: '16px 24px',
    background: '#94a3b8',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'not-allowed',
    marginTop: '10px',
    opacity: '0.7'
  },
  loadingContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px'
  },
  spinner: {
    width: '18px',
    height: '18px',
    border: '2px solid transparent',
    borderTop: '2px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }
};

// Enhanced CSS animations
const enhancedStyles = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-15px) rotate(3deg); }
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  transform: translateY(-1px);
}

.eyeButton:hover {
  background-color: #f1f5f9;
  color: #475569;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(30, 64, 175, 0.4);
}

.roleBadge:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  border-color: #3b82f6;
}

.floating {
  animation-duration: 6s;
  animation-timing-function: ease-in-out;
  animation-iteration-count: infinite;
}

/* Pulse animation for loading states */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.button:disabled {
  animation: pulse 2s infinite;
}
`;

// Inject the enhanced CSS styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = enhancedStyles;
  document.head.appendChild(styleSheet);
}

export default Login;