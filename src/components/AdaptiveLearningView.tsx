import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Bug,
  Activity,
  Zap,
  CheckCircle2,
  Layers,
  ArrowRight,
  TrendingUp,
  Cpu,
  Radar,
  RefreshCw,
} from 'lucide-react';
import {
  PatternDiscoveryEngine,
  DiscoveredPattern,
  LearningSystemState,
} from '../lib/learning/PatternDiscoveryEngine';
import { SimulationResult, AuditLogEntry, DefenseModule, AttackVector } from '../types/security';

interface AdaptiveLearningViewProps {
  recentSimulations: SimulationResult[];
  auditLogs: AuditLogEntry[];
  defenses: DefenseModule[];
  onApplyPatches: (updatedDefenses: DefenseModule[]) => void;
  onRunSynthesizedAttack: (attack: AttackVector) => void;
}

export const AdaptiveLearningView: React.FC<AdaptiveLearningViewProps> = ({
  recentSimulations,
  auditLogs,
  defenses,
  onApplyPatches,
  onRunSynthesizedAttack,
}) => {
  const [learningState, setLearningState] = useState<LearningSystemState>(() =>
    PatternDiscoveryEngine.analyzeAndLearn(recentSimulations, auditLogs)
  );

  const [appliedSuccess, setAppliedSuccess] = useState<boolean>(false);
  const [selectedPattern, setSelectedPattern] = useState<DiscoveredPattern>(
    learningState.discoveredPatterns[0]
  );

  const handleRefreshLearning = () => {
    const updated = PatternDiscoveryEngine.analyzeAndLearn(recentSimulations, auditLogs);
    setLearningState(updated);
    if (updated.discoveredPatterns.length > 0) {
      setSelectedPattern(updated.discoveredPatterns[0]);
    }
  };

  const handleDeployAllPatches = () => {
    const updatedDefenses = PatternDiscoveryEngine.applySynthesizedPatches(
      defenses,
      learningState.discoveredPatterns
    );
    onApplyPatches(updatedDefenses);
    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Learning Matrix Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold shrink-0 shadow-lg">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-slate-100">Autonomous Pattern Discovery & Learning</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/80 font-mono">
                  ACTIVE HEURISTIC ENGINE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Analyzes multi-attempt breach traces, clusters semantic evasion patterns, and auto-synthesizes hardened firewall rules.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRefreshLearning}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-Analyze Telemetry</span>
            </button>

            <button
              onClick={handleDeployAllPatches}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Deploy Auto-Tuned Patches</span>
            </button>
          </div>
        </div>

        {/* Applied Success Toast */}
        {appliedSuccess && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-200 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                Successfully integrated {learningState.discoveredPatterns.length} auto-learned defense rules into active firewalls!
              </span>
            </div>
            <span className="font-mono text-[10px] uppercase font-bold text-emerald-400">HARDENED</span>
          </div>
        )}

        {/* Heuristic Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              Attacks Analyzed
            </div>
            <div className="text-lg font-bold text-slate-100 font-mono mt-1">
              {learningState.totalAttacksAnalyzed} Runs
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
              Learning Convergence
            </div>
            <div className="text-lg font-bold text-cyan-400 font-mono mt-1">
              {learningState.learningConvergenceScore}%
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <Radar className="w-3.5 h-3.5 text-purple-400" />
              Discovered Clusters
            </div>
            <div className="text-lg font-bold text-purple-300 font-mono mt-1">
              {learningState.discoveredPatterns.length} Zero-Days
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              Auto-Patches Ready
            </div>
            <div className="text-lg font-bold text-amber-300 font-mono mt-1">
              {learningState.recommendedPatchesCount} Rules
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Discovered Threat Clusters & Auto-Synthesized Defenses */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left List of Discovered Patterns (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
            Discovered Emerging Threat Patterns ({learningState.discoveredPatterns.length})
          </div>

          <div className="space-y-2.5">
            {learningState.discoveredPatterns.map((pattern) => {
              const isSelected = selectedPattern?.id === pattern.id;
              return (
                <div
                  key={pattern.id}
                  onClick={() => setSelectedPattern(pattern)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500/80 shadow-lg'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-slate-200">{pattern.name}</div>
                      <div className="text-[11px] text-emerald-400 font-mono mt-0.5">{pattern.threatCategory}</div>
                    </div>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase shrink-0 ${
                        pattern.severity === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}
                    >
                      {pattern.severity}
                    </span>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Pattern Confidence:</span>
                    <span className="font-mono font-bold text-slate-200">{pattern.confidenceScore}%</span>
                  </div>

                  {/* Confidence Bar */}
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-1.5">
                    <div
                      className="h-full bg-emerald-500"
                      style={{ width: `${pattern.confidenceScore}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Detail Pane: Deep Pattern Analysis & Auto-Synthesized Rule (7 Cols) */}
        {selectedPattern && (
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-xs font-mono text-emerald-400 font-bold uppercase">
                    Cluster Analysis &bull; ID: {selectedPattern.id}
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mt-1">{selectedPattern.name}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 font-mono text-slate-300">
                    Confidence: {selectedPattern.confidenceScore}%
                  </span>
                </div>
              </div>

              {/* Observed Payload Snippet */}
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Bug className="w-3.5 h-3.5 text-rose-400" />
                  Observed Attack Payload Excerpt
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 font-mono text-xs text-rose-300/90 break-all">
                  {selectedPattern.observedPayloadSnippet}
                </div>
              </div>

              {/* Evasion Tactics Detected */}
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Identified Evasion Tactics
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {selectedPattern.evasionTacticsDetected.map((tactic, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-300 flex items-center gap-2"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                      <span>{tactic}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Affected Components */}
              <div>
                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Vulnerable Architecture Nodes
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedPattern.affectedComponents.map((comp, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-200"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>

              {/* Auto-Synthesized Defense Rule */}
              <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Auto-Synthesized Defense Rule
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold uppercase">
                    Action: {selectedPattern.synthesizedDefenseRule.recommendedAction}
                  </span>
                </div>

                <div className="text-xs font-bold text-slate-200">
                  {selectedPattern.synthesizedDefenseRule.ruleName}
                </div>

                <div className="p-2.5 rounded-lg bg-slate-950 font-mono text-[11px] text-emerald-300 border border-emerald-900/50">
                  {selectedPattern.synthesizedDefenseRule.condition}
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {selectedPattern.synthesizedDefenseRule.rationale}
                </p>
              </div>
            </div>

            {/* Auto-Synthesized Zero-Day Attack Vectors (Testing Harness) */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    Synthesized Zero-Day Attack Generator
                  </h4>
                  <p className="text-xs text-slate-400">
                    Adversarial vectors machine-generated to validate defense coverage against newly learned evasion tactics.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {learningState.synthesizedAttacksGenerated.map((synAttack) => (
                  <div
                    key={synAttack.id}
                    className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-200 truncate">{synAttack.name}</span>
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 border border-rose-800">
                          {synAttack.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 truncate mt-0.5">{synAttack.description}</p>
                    </div>

                    <button
                      onClick={() => onRunSynthesizedAttack(synAttack)}
                      className="px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/80 text-purple-300 border border-purple-800/80 text-xs font-bold transition-all shrink-0 flex items-center gap-1"
                    >
                      <span>Simulate</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
