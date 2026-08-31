import React, { useState } from 'react';
import {
  Wrench,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Cpu,
  RefreshCw,
  Zap,
  Layers,
  Sparkles,
  LifeBuoy,
} from 'lucide-react';
import { SystemIntegrityIssue } from '../types/organism';
import { AgentNode, NetworkEdge, DefenseModule } from '../types/security';
import { WormDnaEngine } from '../lib/simulation/WormDnaEngine';
import confetti from 'canvas-confetti';

interface SystemHealthDiagnosticsProps {
  nodes: AgentNode[];
  edges: NetworkEdge[];
  defenses: DefenseModule[];
  onApplyAutoFix: (updatedNodes: AgentNode[], updatedEdges: NetworkEdge[], updatedDefenses: DefenseModule[]) => void;
}

export const SystemHealthDiagnostics: React.FC<SystemHealthDiagnosticsProps> = ({
  nodes,
  edges,
  defenses,
  onApplyAutoFix,
}) => {
  const [issues, setIssues] = useState<SystemIntegrityIssue[]>(() =>
    WormDnaEngine.runSystemIntegrityAudit(nodes, edges, defenses)
  );
  const [isFixing, setIsFixing] = useState<boolean>(false);
  const [fixSuccess, setFixSuccess] = useState<boolean>(false);

  const handleRefreshAudit = () => {
    const freshIssues = WormDnaEngine.runSystemIntegrityAudit(nodes, edges, defenses);
    setIssues(freshIssues);
  };

  const handleRunAutoFix = () => {
    setIsFixing(true);
    setTimeout(() => {
      const result = WormDnaEngine.executeAutoFix(issues, nodes, edges, defenses);
      onApplyAutoFix(result.updatedNodes, result.updatedEdges, result.updatedDefenses);

      // Re-audit
      const freshIssues = WormDnaEngine.runSystemIntegrityAudit(
        result.updatedNodes,
        result.updatedEdges,
        result.updatedDefenses
      );
      setIssues(freshIssues);
      setIsFixing(false);
      setFixSuccess(true);

      confetti({
        particleCount: 50,
        spread: 70,
        origin: { y: 0.6 },
      });

      setTimeout(() => setFixSuccess(false), 4000);
    }, 800);
  };

  const activeIssues = issues.filter((i) => !i.isFixed);
  const criticalCount = activeIssues.filter((i) => i.severity === 'CRITICAL').length;
  const highCount = activeIssues.filter((i) => i.severity === 'HIGH').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold shrink-0 shadow-lg">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-slate-100">System Integrity Diagnostics & Autonomous Auto-Fix</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/80 font-mono">
                  SELF-HEALING POSTURE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Continuously evaluates node state integrity, broken network links, tool schema drifts, and automates real-time remediation.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefreshAudit}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-Scan System</span>
            </button>

            <button
              onClick={handleRunAutoFix}
              disabled={isFixing || activeIssues.length === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all"
            >
              <Sparkles className={`w-3.5 h-3.5 ${isFixing ? 'animate-spin' : ''}`} />
              <span>{isFixing ? 'Remediating Topology...' : 'Execute Autonomous Auto-Fix'}</span>
            </button>
          </div>
        </div>

        {/* Success Toast */}
        {fixSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                Autonomous Auto-Fix executed successfully: Memory sanitized, defense firewalls re-engaged, and channel links secured!
              </span>
            </div>
            <span className="font-mono text-[10px] font-bold text-emerald-400">OPTIMAL</span>
          </div>
        )}

        {/* Health Scorecards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400">Total Integrity Items</div>
            <div className="text-lg font-bold text-slate-100 font-mono mt-1">
              {issues.length} Audited
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400">Critical Anomalies</div>
            <div className={`text-lg font-bold font-mono mt-1 ${criticalCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {criticalCount} Issues
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400">High Risk Deviations</div>
            <div className={`text-lg font-bold font-mono mt-1 ${highCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {highCount} Warnings
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400">Auto-Remediation Ready</div>
            <div className="text-lg font-bold text-cyan-400 font-mono mt-1">
              {issues.filter((i) => i.canAutoFix).length} Fixes
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostics Issues List */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
          Detected Integrity Audit Items ({issues.length})
        </div>

        <div className="grid grid-cols-1 gap-3">
          {issues.map((issue) => (
            <div
              key={issue.id}
              className={`p-4 rounded-xl border flex flex-wrap items-center justify-between gap-4 transition-all ${
                issue.isFixed
                  ? 'bg-slate-900/40 border-slate-800 text-slate-400'
                  : issue.severity === 'CRITICAL'
                  ? 'bg-rose-950/20 border-rose-900/60 text-slate-200'
                  : issue.severity === 'HIGH'
                  ? 'bg-amber-950/20 border-amber-900/60 text-slate-200'
                  : 'bg-slate-900 border-slate-800 text-slate-200'
              }`}
            >
              <div className="space-y-1 max-w-2xl">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                      issue.isFixed
                        ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                        : issue.severity === 'CRITICAL'
                        ? 'bg-rose-950 text-rose-300 border-rose-800'
                        : issue.severity === 'HIGH'
                        ? 'bg-amber-950 text-amber-300 border-amber-800'
                        : 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {issue.isFixed ? 'RESOLVED' : issue.severity}
                  </span>
                  <span className="text-xs font-bold text-slate-100">{issue.title}</span>
                  <span className="text-[10px] font-mono text-slate-400">[{issue.component}]</span>
                </div>
                <p className="text-xs text-slate-400">{issue.description}</p>
                <div className="text-[10px] font-mono text-cyan-400">Path: {issue.affectedPath}</div>
              </div>

              {issue.canAutoFix && !issue.isFixed && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {issue.fixActionLabel}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
