import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/authContext';
import { Lock, User, Eye, EyeOff, LogIn, AlertCircle, Sparkles, Factory, Shield } from 'lucide-react';

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
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900 flex items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-400/20 to-orange-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-teal-400/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-emerald-500/10 to-teal-600/10 rounded-full blur-3xl" />

        {/* Floating icons */}
        <div className="absolute top-20 left-20 animate-bounce" style={{ animationDuration: '3s' }}>
          <Factory size={32} className="text-amber-400/30" />
        </div>
        <div className="absolute bottom-32 right-24 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
          <Sparkles size={28} className="text-cyan-400/30" />
        </div>
        <div className="absolute top-1/3 right-32 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>
          <Shield size={24} className="text-teal-400/30" />
        </div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-28 h-28 rounded-3xl bg-gradient-to-br from-amber-400/20 via-teal-500/20 to-emerald-500/20 backdrop-blur-xl shadow-2xl shadow-teal-900/50 mb-5 p-3 border border-white/10">
            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center">
              <img
                src={`${import.meta.env.BASE_URL}images/company-logo.png`}
                alt="Corix"
                className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-4xl font-black bg-gradient-to-r from-amber-200 to-teal-200 bg-clip-text text-transparent">C</span>';
                }}
              />
            </div>
          </div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-teal-200 to-emerald-200 mb-2 tracking-tight">Corix</h1>
          <p className="text-teal-300/70 text-sm font-semibold tracking-[0.2em] uppercase">Tannery Management System</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl border border-white/10 ring-1 ring-white/5">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-white mb-1">Welcome Back</h2>
            <p className="text-teal-300/60 text-xs">Sign in to continue to your dashboard</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-300 text-sm backdrop-blur-sm">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-teal-200/80 mb-2 uppercase tracking-wider">
                Username
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-teal-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <div className="relative flex items-center">
                  <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-400/60 group-focus-within:text-teal-300 transition-colors" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-teal-300/40 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400/50 transition-all backdrop-blur-sm"
                    placeholder="Enter your username"
                    required
                    autoFocus
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-teal-200/80 mb-2 uppercase tracking-wider">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-teal-500/20 rounded-xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <div className="relative flex items-center">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-teal-400/60 group-focus-within:text-teal-300 transition-colors" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-teal-300/40 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-400/50 transition-all backdrop-blur-sm"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-400/60 hover:text-teal-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 px-6 relative overflow-hidden bg-gradient-to-r from-amber-500 via-teal-500 to-emerald-500 hover:from-amber-400 hover:via-teal-400 hover:to-emerald-400 text-white font-bold rounded-xl shadow-lg shadow-teal-900/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group/btn"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} className="group-hover/btn:translate-x-0.5 transition-transform" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Default credentials hint */}
          <div className="mt-6 p-4 bg-gradient-to-r from-amber-500/10 to-teal-500/10 border border-teal-500/20 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles size={12} className="text-amber-400" />
              <p className="text-xs font-semibold text-teal-200">Demo Credentials</p>
            </div>
            <p className="text-xs text-teal-300/60 ml-5">
              <span className="font-mono font-bold text-amber-300">admin</span>
              <span className="mx-1.5">/</span>
              <span className="font-mono font-bold text-amber-300">admin@123</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-teal-400/40 text-xs font-medium">
            © 2024 Corix Tannery Solutions. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
