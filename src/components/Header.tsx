import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Activity,
  Play,
  RotateCcw,
  Download,
  Terminal,
  Bug,
  Cpu,
  BarChart3,
  FileCode2,
  Sparkles,
  Calendar,
  Flame,
  Brain,
  User as UserIcon,
  LogIn,
  Dna,
  Lock,
  Wrench,
} from 'lucide-react';
import { User } from '../types/auth';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isRunningSimulation: boolean;
  onRunBenchmark: () => void;
  onSimulateWorm: () => void;
  onReset: () => void;
  onExportReport: () => void;
  activeDefensesCount: number;
  totalDefensesCount: number;
  overallThreatLevel: 'NORMAL' | 'ELEVATED' | 'CRITICAL';
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  isRunningSimulation,
  onRunBenchmark,
  onSimulateWorm,
  onReset,
  onExportReport,
  activeDefensesCount,
  totalDefensesCount,
  overallThreatLevel,
  currentUser,
  onOpenAuth,
  onOpenProfile,
}) => {
  const tabs = [
    { id: 'topology', label: 'Topology & Spread Map', icon: Cpu },
    { id: 'worm_dna', label: 'Worm DNA & Organism', icon: Dna, highlightBadge: 'GENOME' },
    { id: 'daily_challenge', label: 'Daily Challenge', icon: Calendar, highlightBadge: 'DAILY' },
    { id: 'attacks', label: 'Attack Studio & Worms', icon: Bug },
    { id: 'defenses', label: 'Defense Firewalls', icon: ShieldCheck },
    { id: 'drift', label: 'Drift Heatmaps', icon: Flame },
    { id: 'sandbox', label: 'Sandbox Isolation', icon: Lock },
    { id: 'learning', label: 'Pattern Learning & Zero-Day', icon: Brain },
    { id: 'diagnostics', label: 'Health & Auto-Fix', icon: Wrench, highlightBadge: 'AUTO-FIX' },
    { id: 'cli', label: 'Security CLI & XAI', icon: Terminal, highlightBadge: 'CLI' },
    { id: 'benchmark', label: 'Evaluation Matrix', icon: BarChart3 },
    { id: 'logs', label: 'Audit Log & Hashes', icon: FileCode2 },
    { id: 'research', label: 'Meta-Defense Lab', icon: Sparkles },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-40">
      {/* Top Banner / Metrics */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* App Title & Status */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-100 tracking-tight">Agent Defense Lab</h1>
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50 font-mono">
                NIST & OWASP MCP
              </span>
            </div>
            <p className="text-xs text-slate-400">Adaptive AI Agent Security & Worm Propagation Workbench</p>
          </div>
        </div>

        {/* Live Threat Bar & Quick Actions */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3">
          {/* Defense health indicator */}
          <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-lg text-xs">
            <span className="text-slate-400">Firewalls:</span>
            <span className="font-mono font-bold text-emerald-400">
              {activeDefensesCount}/{totalDefensesCount} Active
            </span>
            <div
              className={`w-2 h-2 rounded-full ${
                overallThreatLevel === 'CRITICAL'
                  ? 'bg-rose-500 animate-ping'
                  : overallThreatLevel === 'ELEVATED'
                  ? 'bg-amber-500 animate-pulse'
                  : 'bg-emerald-500'
              }`}
            />
          </div>

          {/* User Account / Profile Badge */}
          {currentUser ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-[10px] flex items-center justify-center border border-emerald-500/30">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-slate-200 truncate max-w-[120px]">{currentUser.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-bold">
                Lvl {currentUser.clearanceLevel}
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sign In</span>
            </button>
          )}

          {/* Simulate Worm Quick Button */}
          <button
            onClick={onSimulateWorm}
            disabled={isRunningSimulation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800/60 text-xs font-semibold transition-all disabled:opacity-50"
            title="Inject Self-Replicating Agent Worm"
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Simulate Worm</span>
          </button>

          {/* Run Red Team Suite */}
          <button
            onClick={onRunBenchmark}
            disabled={isRunningSimulation}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            {isRunningSimulation ? <Activity className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
            <span>Run Benchmark Suite</span>
          </button>

          {/* Export Report */}
          <button
            onClick={onExportReport}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-all"
            title="Export Security Audit Report"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Reset */}
          <button
            onClick={onReset}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-all"
            title="Reset Simulation State"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto scrollbar-none border-t border-slate-800/80">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              {tab.highlightBadge && (
                <span className="text-[9px] font-bold font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  {tab.highlightBadge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
