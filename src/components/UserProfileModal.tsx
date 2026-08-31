import React from 'react';
import {
  User as UserIcon,
  Shield,
  Award,
  Flame,
  CheckCircle2,
  LogOut,
  X,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Lock,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { User } from '../types/auth';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onLogout: () => void;
  onOpenDailyChallenge: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  onOpenDailyChallenge,
}) => {
  if (!isOpen) return null;

  const nextLevelXp = user.clearanceLevel * 500;
  const currentLevelBaseXp = (user.clearanceLevel - 1) * 500;
  const xpInCurrentLevel = Math.max(0, user.xp - currentLevelBaseXp);
  const xpNeededForNext = 500;
  const levelProgress = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNext) * 100));

  const roleLabels: Record<User['role'], string> = {
    chief_security_officer: 'Chief Security Officer (CSO)',
    blue_team_lead: 'Blue Team Lead Architect',
    red_team: 'Red Team Adversary Researcher',
    analyst: 'AI Security Analyst',
  };

  const getRarityBadge = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'border-amber-500/50 bg-amber-950/40 text-amber-300';
      case 'epic':
        return 'border-purple-500/50 bg-purple-950/40 text-purple-300';
      case 'rare':
        return 'border-blue-500/50 bg-blue-950/40 text-blue-300';
      default:
        return 'border-slate-700 bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden text-slate-100 relative max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800 transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Profile Summary */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/80">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xl shadow-lg shrink-0">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg font-bold text-slate-100 truncate">{user.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-mono">
                  CLEARANCE LVL {user.clearanceLevel}
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate">{user.email}</p>
              <p className="text-xs text-emerald-400 font-medium mt-0.5">{roleLabels[user.role] || user.role}</p>
            </div>
          </div>

          {/* XP Clearance Progress Bar */}
          <div className="mt-5 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                Clearance XP Progress
              </span>
              <span className="font-mono text-emerald-300 font-semibold">
                {user.xp} XP ({user.clearanceLevel >= 10 ? 'MAX RANK' : `${xpInCurrentLevel}/${xpNeededForNext} to Lvl ${user.clearanceLevel + 1}`})
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden border border-slate-700/50">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
                style={{ width: `${user.clearanceLevel >= 10 ? 100 : levelProgress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 divide-x divide-slate-800 border-b border-slate-800 bg-slate-950/40">
          <div className="p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-amber-400 text-sm font-bold font-mono">
              <Flame className="w-4 h-4 fill-amber-400 text-amber-500 animate-pulse" />
              <span>{user.streakDays} Days</span>
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Daily Streak</div>
          </div>
          <div className="p-3 text-center">
            <div className="text-emerald-400 text-sm font-bold font-mono">
              {user.completedChallenges.length}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Puzzles Solved</div>
          </div>
          <div className="p-3 text-center">
            <div className="text-cyan-400 text-sm font-bold font-mono">
              {user.earnedBadges.length}
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mt-0.5">Badges Earned</div>
          </div>
        </div>

        {/* Scrollable Body: Badges & Challenge Activity */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 scrollbar-thin">
          {/* Earned Badges Section */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              Security Achievements & Badges ({user.earnedBadges.length})
            </h3>
            {user.earnedBadges.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-400">
                Complete daily puzzles to unlock security certifications and badges.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {user.earnedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`p-3 rounded-xl border flex items-start gap-3 ${getRarityBadge(badge.rarity)}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-slate-900/80 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold truncate">{badge.name}</span>
                        <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-slate-900/60">
                          {badge.rarity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-2">{badge.description}</p>
                      <div className="text-[10px] text-slate-400 mt-1">Unlocked: {badge.earnedAt}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Daily Challenge Callout */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/40 to-slate-900 border border-emerald-800/40 flex items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Today's Daily Challenge Scenario
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Solve today's puzzle to defend against zero-day vector propagation and maintain your {user.streakDays}-day streak.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenDailyChallenge();
              }}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shrink-0 transition-colors"
            >
              <span>Attempt</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Footer with Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="text-[11px] text-slate-400">
            Account created on <span className="font-mono text-slate-300">{user.createdAt}</span>
          </div>
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 border border-rose-800/60 text-xs font-semibold transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
