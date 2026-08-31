import React from 'react';
import {
  SimulationResult,
  BenchmarkMetrics,
  AttackVector,
} from '../types/security';
import {
  BarChart3,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  Activity,
  Layers,
  Flame,
  Bug,
} from 'lucide-react';

interface BenchmarkDashboardProps {
  benchmarkResults: SimulationResult[];
  benchmarkMetrics: BenchmarkMetrics | null;
  onRunBenchmark: () => void;
  isRunning: boolean;
  presetAttacks: AttackVector[];
}

export const BenchmarkDashboard: React.FC<BenchmarkDashboardProps> = ({
  benchmarkResults,
  benchmarkMetrics,
  onRunBenchmark,
  isRunning,
  presetAttacks,
}) => {
  return (
    <div className="flex flex-col gap-5">
      {/* Top Benchmark Action & Status */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
            NIST & OWASP AI Agent Security Evaluation Matrix
          </h2>
          <p className="text-xs text-slate-400">
            Automated red-team benchmark measuring worm containment, provenance gates, and multi-attempt resistance.
          </p>
        </div>

        <button
          onClick={onRunBenchmark}
          disabled={isRunning}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
        >
          {isRunning ? (
            <Activity className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          <span>{isRunning ? 'Evaluating Defenses...' : 'Run Comprehensive Benchmark'}</span>
        </button>
      </div>

      {/* Metric Cards Grid */}
      {benchmarkMetrics && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Overall Resilience */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase font-mono">
              Resilience Score
            </span>
            <div className="flex items-baseline gap-1.5">
              <span
                className={`text-2xl font-bold font-mono ${
                  benchmarkMetrics.overallSecurityScore >= 80
                    ? 'text-emerald-400'
                    : benchmarkMetrics.overallSecurityScore >= 50
                    ? 'text-amber-400'
                    : 'text-rose-400'
                }`}
              >
                {benchmarkMetrics.overallSecurityScore}%
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              {benchmarkMetrics.testsPassed}/{benchmarkMetrics.totalTestsRun} Tests Defended
            </span>
          </div>

          {/* Worm Containment */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase font-mono">
              Worm Containment
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {benchmarkMetrics.wormContainmentRate}%
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Propagation Intercepts</span>
          </div>

          {/* Provenance Enforcement */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase font-mono">
              Provenance Gates
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {benchmarkMetrics.provenanceEnforcementRate}%
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Untrusted Source Blocks</span>
          </div>

          {/* Tool Drift Defense */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase font-mono">
              Tool Drift Defense
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {benchmarkMetrics.toolDriftDefenseRate}%
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Schema Mutation Stops</span>
          </div>

          {/* Multi-Attempt Resistance */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase font-mono">
              Multi-Attempt
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-emerald-400">
                {benchmarkMetrics.multiAttemptResistance}%
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Adaptive Evasion Holds</span>
          </div>

          {/* Avg Defense Latency */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-1">
            <span className="text-[11px] font-semibold text-slate-400 uppercase font-mono">
              Avg Latency
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-slate-200">
                {benchmarkMetrics.averageDefenseLatencyMs} ms
              </span>
            </div>
            <span className="text-[10px] text-slate-400">Per Step Evaluation</span>
          </div>
        </div>
      )}

      {/* Benchmark Results Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" />
            Adversarial Test Suite Results ({benchmarkResults.length} vectors)
          </h3>
          <span className="text-xs text-slate-400 font-mono">Evaluated against NIST AI Red-Team Standard</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-mono">
                <th className="p-3">Attack Vector</th>
                <th className="p-3">Category</th>
                <th className="p-3">Outcome</th>
                <th className="p-3">Attempts Handled</th>
                <th className="p-3">Drift Score</th>
                <th className="p-3">Defense Response</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-200">
              {benchmarkResults.map((result) => {
                const isBreached = result.finalVerdict === 'BREACHED';
                const isContained = result.finalVerdict === 'CONTAINED';
                const lastStep = result.steps[result.steps.length - 1];

                return (
                  <tr
                    key={result.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isBreached ? 'bg-rose-950/20' : ''
                    }`}
                  >
                    <td className="p-3 font-medium">
                      <div className="font-semibold text-slate-100">{result.attackName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{result.id}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-[11px] text-slate-300">
                        {result.category}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono font-bold text-xs ${
                          isBreached
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : isContained
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                        }`}
                      >
                        {isBreached ? (
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        )}
                        <span>{result.finalVerdict}</span>
                      </span>
                    </td>
                    <td className="p-3 font-mono text-slate-300">
                      {result.attemptsCompleted} Attempt(s)
                    </td>
                    <td className="p-3 font-mono">
                      <span
                        className={
                          result.metrics.driftScore > 0.5
                            ? 'text-rose-400 font-bold'
                            : 'text-emerald-400'
                        }
                      >
                        {result.metrics.driftScore}
                      </span>
                    </td>
                    <td className="p-3 text-slate-300 text-xs max-w-[280px]">
                      {lastStep?.reason || 'Evaluation completed successfully.'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
