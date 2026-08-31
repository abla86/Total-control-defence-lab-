/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TopologyMap } from './components/TopologyMap';
import { AttackStudio } from './components/AttackStudio';
import { DefenseConfigurator } from './components/DefenseConfigurator';
import { BenchmarkDashboard } from './components/BenchmarkDashboard';
import { AuditLogViewer } from './components/AuditLogViewer';
import { MetaHackerAssistant } from './components/MetaHackerAssistant';
import { DailyChallengeView } from './components/DailyChallengeView';
import { AdaptiveLearningView } from './components/AdaptiveLearningView';
import { WormDnaVisualizer } from './components/WormDnaVisualizer';
import { DriftHeatmapView } from './components/DriftHeatmapView';
import { SandboxIsolationView } from './components/SandboxIsolationView';
import { SystemHealthDiagnostics } from './components/SystemHealthDiagnostics';
import { SecurityCliTerminal } from './components/SecurityCliTerminal';
import { AuthModal } from './components/AuthModal';
import { UserProfileModal } from './components/UserProfileModal';
import {
  INITIAL_NODES,
  INITIAL_EDGES,
  PRESET_ATTACKS,
  INITIAL_DEFENSES,
} from './lib/constants/defaults';
import {
  AgentNode,
  NetworkEdge,
  AttackVector,
  DefenseModule,
  SimulationResult,
  AuditLogEntry,
  BenchmarkMetrics,
} from './types/security';
import { User, AuthSession, SecurityBadge } from './types/auth';
import { AuthStorage } from './lib/auth/storage';
import { SecurityEngine } from './lib/simulation/SecurityEngine';
import { WormDnaEngine } from './lib/simulation/WormDnaEngine';
import confetti from 'canvas-confetti';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('topology');
  const [nodes, setNodes] = useState<AgentNode[]>(INITIAL_NODES);
  const [edges, setEdges] = useState<NetworkEdge[]>(INITIAL_EDGES);
  const [defenses, setDefenses] = useState<DefenseModule[]>(INITIAL_DEFENSES);
  const [presetAttacks, setPresetAttacks] = useState<AttackVector[]>(PRESET_ATTACKS);
  const [selectedNode, setSelectedNode] = useState<AgentNode | null>(INITIAL_NODES[1]);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [lastSimulation, setLastSimulation] = useState<SimulationResult | null>(null);
  const [benchmarkResults, setBenchmarkResults] = useState<SimulationResult[]>([]);
  const [benchmarkMetrics, setBenchmarkMetrics] = useState<BenchmarkMetrics | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);

  // User Auth State
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const session = AuthStorage.getSession();
    return session ? session.user : null;
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Initial auto-benchmark on first load to seed data
  useEffect(() => {
    runBenchmark(false);
  }, []);

  // Run a single attack simulation
  const handleRunAttack = (attack: AttackVector) => {
    setIsRunning(true);
    setActiveTab('topology');

    setTimeout(() => {
      const { result, updatedNodes, updatedEdges, updatedDefenses, auditLogs: newLogs } = SecurityEngine.runSimulation(
        attack,
        nodes,
        edges,
        defenses
      );

      setNodes(updatedNodes);
      setEdges(updatedEdges);
      setDefenses(updatedDefenses);
      setLastSimulation(result);
      setAuditLogs((prev) => [...newLogs, ...prev]);
      setIsRunning(false);

      // Trigger visual feedback
      if (result.finalVerdict !== 'BREACHED') {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10b981', '#34d399', '#059669'],
        });
      }
    }, 400);
  };

  // Run full benchmark suite
  const runBenchmark = (switchTab: boolean = true) => {
    setIsRunning(true);
    if (switchTab) setActiveTab('benchmark');

    setTimeout(() => {
      const { results, overallScore, metrics } = SecurityEngine.runBenchmarkSuite(
        INITIAL_NODES,
        INITIAL_EDGES,
        defenses,
        presetAttacks
      );

      const passedCount = results.filter((r) => r.finalVerdict !== 'BREACHED').length;

      const summaryMetrics: BenchmarkMetrics = {
        overallSecurityScore: overallScore,
        wormContainmentRate: metrics.wormContainmentRate,
        provenanceEnforcementRate: metrics.provenanceEnforcementRate,
        toolDriftDefenseRate: metrics.toolDriftDefenseRate,
        multiAttemptResistance: metrics.multiAttemptResistance,
        falsePositiveEstimate: metrics.falsePositiveEstimate,
        averageDefenseLatencyMs: metrics.averageDefenseLatencyMs,
        totalTestsRun: results.length,
        testsPassed: passedCount,
      };

      setBenchmarkResults(results);
      setBenchmarkMetrics(summaryMetrics);

      // Populate audit logs from the benchmark runs
      const logsFromBench: AuditLogEntry[] = [];
      results.forEach((res) => {
        const lastStep = res.steps[res.steps.length - 1];
        if (lastStep) {
          logsFromBench.push({
            id: `audit_bench_${res.id}`,
            timestamp: res.timestamp,
            type: res.finalVerdict === 'BREACHED' ? 'ATTACK' : 'DEFENSE',
            source: 'Evaluation Harness',
            target: res.attackName,
            verdict: res.finalVerdict === 'BREACHED' ? 'ALLOW' : 'DENY',
            message: `Benchmark Run: ${res.attackName} - Verdict: ${res.finalVerdict}. ${lastStep.reason}`,
            hash: `sha256_${res.id.substring(4)}`,
            provenance: 'SYSTEM',
          });
        }
      });

      setAuditLogs((prev) => [...logsFromBench, ...prev]);
      setIsRunning(false);
    }, 500);
  };

  // Quick simulate worm attack
  const handleSimulateWorm = () => {
    const wormAttack = presetAttacks.find((a) => a.category === 'worm_propagation') || presetAttacks[0];
    handleRunAttack(wormAttack);
  };

  // Reset simulation state
  const handleReset = () => {
    setNodes(INITIAL_NODES);
    setEdges(INITIAL_EDGES);
    setLastSimulation(null);
    setSelectedNode(INITIAL_NODES[1]);
  };

  // Defense Toggle Handlers
  const handleToggleDefense = (id: string) => {
    setDefenses((prev) =>
      prev.map((d) => (d.id === id ? { ...d, enabled: !d.enabled } : d))
    );
  };

  const handleUpdateSensitivity = (id: string, sensitivity: 'conservative' | 'balanced' | 'strict') => {
    setDefenses((prev) =>
      prev.map((d) => (d.id === id ? { ...d, sensitivity } : d))
    );
  };

  const handleToggleFailClosed = (id: string) => {
    setDefenses((prev) =>
      prev.map((d) => (d.id === id ? { ...d, failClosed: !d.failClosed } : d))
    );
  };

  const handleToggleRule = (defenseId: string, ruleId: string) => {
    setDefenses((prev) =>
      prev.map((d) => {
        if (d.id === defenseId) {
          return {
            ...d,
            rules: d.rules.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r)),
          };
        }
        return d;
      })
    );
  };

  // Node Quarantine / Sanitize Handlers
  const handleQuarantineNode = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, status: 'quarantined' } : n))
    );
    if (selectedNode?.id === nodeId) {
      setSelectedNode((prev) => (prev ? { ...prev, status: 'quarantined' } : null));
    }
  };

  const handleCleanNode = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, status: 'clean' } : n))
    );
    if (selectedNode?.id === nodeId) {
      setSelectedNode((prev) => (prev ? { ...prev, status: 'clean' } : null));
    }
  };

  // Auto-Fix Remediation Handler
  const handleExecuteAutoFix = () => {
    // Sanitize all nodes
    setNodes((prev) =>
      prev.map((n) => ({
        ...n,
        status: 'clean',
        stateSummary: n.stateSummary.replace(/infected|compromised|leaked/gi, 'healthy'),
      }))
    );
    // Sanitize all edges
    setEdges((prev) =>
      prev.map((e) => ({
        ...e,
        isInfected: false,
        activeTransmission: false,
      }))
    );
    // Re-arm and harden all defense modules
    setDefenses((prev) =>
      prev.map((d) => ({
        ...d,
        enabled: true,
        sensitivity: 'strict',
        failClosed: true,
      }))
    );

    // Add log
    setAuditLogs((prev) => [
      {
        id: `autofix_${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        type: 'DEFENSE',
        source: 'Autonomous Auto-Fix Engine',
        target: 'System Cluster Topology',
        verdict: 'DENY',
        message: 'Executed global zero-trust remediation: sanitized tool schemas, purged compromised memory slots, and hardened firewalls.',
        hash: `sha256_${Math.random().toString(36).substring(2, 10)}`,
        provenance: 'AUTONOMOUS_SECURITY_KERNEL',
      },
      ...prev,
    ]);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.7 },
      colors: ['#06b6d4', '#10b981', '#a855f7'],
    });
  };

  const handleAirgapNode = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, status: 'quarantined' } : n))
    );
    setEdges((prev) =>
      prev.map((e) =>
        e.source === nodeId || e.target === nodeId
          ? { ...e, activeTransmission: false, isInfected: false }
          : e
      )
    );
  };

  const handleRestoreNode = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) => (n.id === nodeId ? { ...n, status: 'clean' } : n))
    );
  };

  const handleEmergencyIsolateAll = () => {
    setNodes((prev) =>
      prev.map((n) => (n.status === 'infected' ? { ...n, status: 'quarantined' } : n))
    );
    setEdges((prev) =>
      prev.map((e) => ({ ...e, activeTransmission: false, isInfected: false }))
    );
  };

  const handleRemediateDrift = (nodeId: string) => {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === nodeId
          ? {
              ...n,
              status: 'clean',
              tools: n.tools.map((t) => ({ ...t, driftRisk: 'low' as const })),
            }
          : n
      )
    );
  };

  const handleSimulateDriftSpike = () => {
    setNodes((prev) =>
      prev.map((n, idx) =>
        idx === 1
          ? {
              ...n,
              tools: n.tools.map((t) => ({ ...t, driftRisk: 'high' as const })),
            }
          : n
      )
    );
  };

  // Export Audit Report
  const handleExportReport = () => {
    const reportData = {
      reportTitle: 'Agent Defense Lab - Comprehensive Security Audit Report',
      timestamp: new Date().toISOString(),
      standardsEvaluated: ['NIST SP 800-218A', 'OWASP MCP Top 10 (2025/2026)', 'Morris II Agent Worm Mitigation'],
      summaryMetrics: benchmarkMetrics,
      activeDefenses: defenses.map((d) => ({
        id: d.id,
        name: d.name,
        enabled: d.enabled,
        sensitivity: d.sensitivity,
        failClosed: d.failClosed,
        blockedEvents: d.blockedCount,
      })),
      recentBenchmarkResults: benchmarkResults,
      auditLogsPreview: auditLogs.slice(0, 50),
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-security-audit-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // User Auth Handlers
  const handleAuthSuccess = (session: AuthSession) => {
    setCurrentUser(session.user);
  };

  const handleLogout = () => {
    AuthStorage.clearSession();
    setCurrentUser(null);
  };

  const handleUpdateUserProgress = (xpGain: number, challengeId: string, badge?: SecurityBadge) => {
    if (!currentUser) return;
    const updated = AuthStorage.updateUserProgress(currentUser.id, xpGain, challengeId, badge);
    if (updated) {
      setCurrentUser(updated);
    }
  };

  // Pattern Learning Handlers
  const handleApplyLearnedPatches = (updatedDefenses: DefenseModule[]) => {
    setDefenses(updatedDefenses);
  };

  const handleRunSynthesizedAttack = (attack: AttackVector) => {
    // Add synthesized attack to presets if not already there
    setPresetAttacks((prev) => {
      if (prev.some((a) => a.id === attack.id)) return prev;
      return [attack, ...prev];
    });
    handleRunAttack(attack);
  };

  // Determine overall threat level for header badge
  const hasInfectedNodes = nodes.some((n) => n.status === 'infected');
  const overallThreatLevel = hasInfectedNodes
    ? 'CRITICAL'
    : lastSimulation?.finalVerdict === 'BREACHED'
    ? 'ELEVATED'
    : 'NORMAL';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Header with Navigation & Live Metrics */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isRunningSimulation={isRunning}
        onRunBenchmark={() => runBenchmark(true)}
        onSimulateWorm={handleSimulateWorm}
        onReset={handleReset}
        onExportReport={handleExportReport}
        activeDefensesCount={defenses.filter((d) => d.enabled).length}
        totalDefensesCount={defenses.length}
        overallThreatLevel={overallThreatLevel}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'topology' && (
          <TopologyMap
            nodes={nodes}
            edges={edges}
            lastSimulation={lastSimulation}
            onNodeSelect={(node) => setSelectedNode(node)}
            selectedNode={selectedNode}
            onQuarantineNode={handleQuarantineNode}
            onCleanNode={handleCleanNode}
          />
        )}

        {activeTab === 'worm_dna' && (
          <WormDnaVisualizer
            nodes={nodes}
            defenses={defenses}
            onRunSimulation={handleRunAttack}
            onMutateWorm={(w) => {
              // Custom mutated worm generated
            }}
          />
        )}

        {activeTab === 'drift' && (
          <DriftHeatmapView
            nodes={nodes}
            defenses={defenses}
            onRemediateDrift={handleRemediateDrift}
            onSimulateDriftSpike={handleSimulateDriftSpike}
          />
        )}

        {activeTab === 'sandbox' && (
          <SandboxIsolationView
            nodes={nodes}
            edges={edges}
            defenses={defenses}
            onQuarantineNode={handleQuarantineNode}
            onAirgapNode={handleAirgapNode}
            onRestoreNode={handleRestoreNode}
            onEmergencyIsolateAll={handleEmergencyIsolateAll}
          />
        )}

        {activeTab === 'diagnostics' && (
          <SystemHealthDiagnostics
            nodes={nodes}
            edges={edges}
            defenses={defenses}
            onExecuteAutoFix={handleExecuteAutoFix}
            onResetTopology={handleReset}
          />
        )}

        {activeTab === 'cli' && (
          <SecurityCliTerminal
            nodes={nodes}
            edges={edges}
            defenses={defenses}
            onRunSimulation={handleRunAttack}
            onExecuteAutoFix={handleExecuteAutoFix}
            onQuarantineNode={handleQuarantineNode}
          />
        )}

        {activeTab === 'daily_challenge' && (
          <DailyChallengeView
            currentUser={currentUser}
            onUpdateUserProgress={handleUpdateUserProgress}
            onOpenAuth={() => setIsAuthModalOpen(true)}
          />
        )}

        {activeTab === 'attacks' && (
          <AttackStudio
            presetAttacks={presetAttacks}
            onRunAttack={handleRunAttack}
            isRunning={isRunning}
          />
        )}

        {activeTab === 'defenses' && (
          <DefenseConfigurator
            defenses={defenses}
            onToggleDefense={handleToggleDefense}
            onUpdateSensitivity={handleUpdateSensitivity}
            onToggleFailClosed={handleToggleFailClosed}
            onToggleRule={handleToggleRule}
          />
        )}

        {activeTab === 'learning' && (
          <AdaptiveLearningView
            recentSimulations={benchmarkResults}
            auditLogs={auditLogs}
            defenses={defenses}
            onApplyPatches={handleApplyLearnedPatches}
            onRunSynthesizedAttack={handleRunSynthesizedAttack}
          />
        )}

        {activeTab === 'benchmark' && (
          <BenchmarkDashboard
            benchmarkResults={benchmarkResults}
            benchmarkMetrics={benchmarkMetrics}
            onRunBenchmark={() => runBenchmark(true)}
            isRunning={isRunning}
            presetAttacks={presetAttacks}
          />
        )}

        {activeTab === 'logs' && (
          <AuditLogViewer
            logs={auditLogs}
            onClearLogs={() => setAuditLogs([])}
            onExportLogs={handleExportReport}
          />
        )}

        {activeTab === 'research' && (
          <MetaHackerAssistant
            defenses={defenses}
            recentSimulations={benchmarkResults}
            onApplyHardenedRules={(newRules) => {
              // Apply rules
            }}
          />
        )}
      </main>

      {/* Auth & Profile Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {currentUser && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          user={currentUser}
          onLogout={handleLogout}
          onOpenDailyChallenge={() => setActiveTab('daily_challenge')}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap items-center justify-between gap-2">
          <span>Agent Defense Lab &copy; 2026 &bull; Compliant with NIST AI Red-Teaming & OWASP MCP Top 10 Standards</span>
          <span className="font-mono text-[11px] text-slate-400">Zero-Trust Provenance & Deterministic Hash Integrity</span>
        </div>
      </footer>
    </div>
  );
}
