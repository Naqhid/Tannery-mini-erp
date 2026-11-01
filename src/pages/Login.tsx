import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/authContext';
import { Lock, User, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="shell" style={{ paddingBottom: 0, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Header - same gradient/branding as the dashboard */}
      <header className="top" style={{ paddingTop: 0 }}>
        <div className="toprow" style={{ marginTop: -18, marginBottom: -24 }}>
          <div className="brand" style={{ gap: 18, alignItems: 'center' }}>
            <img src={`${import.meta.env.BASE_URL}images/company-logo-silver.png`} alt="Company logo" style={{ height: 150, width: 'auto', objectFit: 'contain' }} />
            <img src={`${import.meta.env.BASE_URL}images/product-logo-white.png`} alt="Product logo" style={{ height: 110, width: 'auto', objectFit: 'contain' }} />
          </div>
        </div>
        <div className="greeting" style={{ marginTop: 0 }}>
          <h2>Welcome back</h2>
          <p>Sign in to continue to your operations overview</p>
        </div>
      </header>

      <main style={{ flex: 1, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
        <div className="panel" style={{ width: '100%', marginTop: 24, padding: 20 }}>
          <div className="paneltitle">
            <h3>Sign in</h3>
            <span>Secure access</span>
          </div>

          {error && (
            <div className="notice" style={{ background: '#f7e9e5', borderColor: '#e6c9c2', color: '#9a4a42', display: 'flex', alignItems: 'center', gap: 8, marginTop: 0, marginBottom: 14 }}>
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <label style={labelStyle}>Username</label>
            <div style={{ position: 'relative', marginBottom: 14 }}>
              <User size={16} style={iconStyle} />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                style={inputStyle}
                placeholder="Enter your username"
                required
                autoFocus
              />
            </div>

            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative', marginBottom: 20 }}>
              <Lock size={16} style={iconStyle} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ ...inputStyle, paddingRight: 40 }}
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={eyeBtnStyle}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            <button type="submit" disabled={loading} style={submitStyle(loading)}>
              {loading ? (
                <>
                  <span style={spinnerStyle} />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <div className="footnote" style={{ marginBottom: 18 }}>
        © 2026 Tannery ERP · Powering Modern Tanneries
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 11,
  fontWeight: 700,
  color: '#66675f',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: 7,
};

const iconStyle: React.CSSProperties = {
  position: 'absolute',
  left: 12,
  top: '50%',
  transform: 'translateY(-50%)',
  color: '#8b857a',
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '11px 12px 11px 36px',
  border: '1px solid var(--line)',
  borderRadius: 10,
  background: '#fbfaf6',
  fontSize: 13,
  color: '#45463f',
  outline: 'none',
};

const eyeBtnStyle: React.CSSProperties = {
  position: 'absolute',
  right: 10,
  top: '50%',
  transform: 'translateY(-50%)',
  border: 0,
  background: 'transparent',
  color: '#8b857a',
  cursor: 'pointer',
  display: 'grid',
  placeItems: 'center',
};

const submitStyle = (loading: boolean): React.CSSProperties => ({
  width: '100%',
  padding: '12px 16px',
  border: 0,
  borderRadius: 10,
  background: 'linear-gradient(135deg,#172554,#3b5b9e)',
  color: '#fff',
  fontSize: 13,
  fontWeight: 700,
  cursor: loading ? 'not-allowed' : 'pointer',
  opacity: loading ? 0.6 : 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  boxShadow: '0 3px 10px #17255422',
});

const spinnerStyle: React.CSSProperties = {
  width: 16,
  height: 16,
  border: '2px solid #ffffff55',
  borderTopColor: '#fff',
  borderRadius: '50%',
  display: 'inline-block',
  animation: 'spin 0.7s linear infinite',
};
