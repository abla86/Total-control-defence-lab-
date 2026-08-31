import React, { useState } from 'react';
import {
  ShieldCheck,
  User as UserIcon,
  Lock,
  Mail,
  X,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Shield,
  KeyRound,
} from 'lucide-react';
import { AuthStorage } from '../lib/auth/storage';
import { User, AuthSession } from '../types/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (session: AuthSession) => void;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<User['role']>('analyst');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      if (mode === 'login') {
        const result = AuthStorage.login(email, password);
        if (result.success && result.session) {
          onAuthSuccess(result.session);
          onClose();
        } else {
          setError(result.error || 'Failed to authenticate.');
        }
      } else {
        const result = AuthStorage.signUp(email, password, name, role);
        if (result.success && result.session) {
          onAuthSuccess(result.session);
          onClose();
        } else {
          setError(result.error || 'Failed to register.');
        }
      }
      setIsLoading(false);
    }, 300);
  };

  const handleQuickDemoLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = AuthStorage.login(demoEmail, demoPass);
      if (result.success && result.session) {
        onAuthSuccess(result.session);
        onClose();
      } else {
        setError(result.error || 'Failed to login with demo profile.');
      }
      setIsLoading(false);
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden text-slate-100 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/60 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-100">
              {mode === 'login' ? 'Security Personnel Sign In' : 'Register Defense Clearance'}
            </h2>
            <p className="text-xs text-slate-400">
              {mode === 'login'
                ? 'Access your daily streaks, custom rules, and audit records.'
                : 'Create an encrypted researcher account to log defense simulations.'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {mode === 'signup' && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name / Callsign</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Anne-Beth Andersen"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Security Role / Tier</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as User['role'])}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="chief_security_officer">Chief Security Officer (CSO)</option>
                  <option value="blue_team_lead">Blue Team Lead Architect</option>
                  <option value="red_team">Red Team Adversary Researcher</option>
                  <option value="analyst">AI Security Analyst</option>
                </select>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@defense.lab"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            {mode === 'signup' && (
              <p className="text-[10px] text-slate-400 mt-1">Minimum 6 characters. Stored securely with SHA-256 hash vaulting.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <span>Authenticating...</span>
            ) : mode === 'login' ? (
              <>
                <span>Sign In to Terminal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Create Secure Profile</span>
                <CheckCircle2 className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Logins Section */}
        <div className="p-4 mx-6 mb-4 rounded-xl bg-slate-950/80 border border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="font-semibold flex items-center gap-1.5 text-slate-300">
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              Quick Demo Accounts
            </span>
            <span className="text-[10px] text-slate-400">1-click test</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('annebeth.andersen@gmail.com', 'admin123')}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
            >
              <div className="text-[11px] font-bold text-emerald-300 truncate">Anne-Beth (CSO)</div>
              <div className="text-[10px] text-slate-400">Level 9 &bull; 14d Streak</div>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('researcher@defense.lab', 'demo123')}
              className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-left transition-colors"
            >
              <div className="text-[11px] font-bold text-amber-300 truncate">Alex (Red Team)</div>
              <div className="text-[10px] text-slate-400">Level 5 &bull; 3d Streak</div>
            </button>
          </div>
        </div>

        {/* Switch mode footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 text-center text-xs text-slate-400">
          {mode === 'login' ? (
            <span>
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setError(null);
                }}
                className="text-emerald-400 font-semibold hover:underline"
              >
                Sign Up Here
              </button>
            </span>
          ) : (
            <span>
              Already have clearance?{' '}
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
                className="text-emerald-400 font-semibold hover:underline"
              >
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
