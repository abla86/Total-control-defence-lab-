import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Flame,
  Award,
  Play,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  FileCheck,
  RotateCcw,
  Sparkles,
  Bug,
  Lock,
  Layers,
  ArrowRight,
  Download,
  Share2,
} from 'lucide-react';
import { DailyChallenge, ChallengeObjective } from '../types/challenge';
import { DailyChallengeEngine } from '../lib/challenges/DailyChallengeEngine';
import { DefenseModule, SimulationResult, AgentNode, NetworkEdge } from '../types/security';
import { SecurityEngine } from '../lib/simulation/SecurityEngine';
import { User, SecurityBadge } from '../types/auth';
import confetti from 'canvas-confetti';

interface DailyChallengeViewProps {
  currentUser: User | null;
  onUpdateUserProgress: (xp: number, challengeId: string, badge?: SecurityBadge) => void;
  onOpenAuth: () => void;
}

export const DailyChallengeView: React.FC<DailyChallengeViewProps> = ({
  currentUser,
  onUpdateUserProgress,
  onOpenAuth,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [challenge, setChallenge] = useState<DailyChallenge>(() =>
    DailyChallengeEngine.getChallengeForDate(todayStr)
  );

  const [activeDefenses, setActiveDefenses] = useState<DefenseModule[]>(challenge.startingDefenses);
  const [challengeNodes, setChallengeNodes] = useState<AgentNode[]>(challenge.initialNodes);
  const [challengeEdges, setChallengeEdges] = useState<NetworkEdge[]>(challenge.initialEdges);

  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [certificateData, setCertificateData] = useState<{
    certificateId: string;
    hash: string;
    issuedAt: string;
  } | null>(null);

  // Reload challenge when selected date changes
  useEffect(() => {
    const newChallenge = DailyChallengeEngine.getChallengeForDate(selectedDate);
    setChallenge(newChallenge);
    setActiveDefenses(newChallenge.startingDefenses);
    setChallengeNodes(newChallenge.initialNodes);
    setChallengeEdges(newChallenge.initialEdges);
    setSimulationResult(null);
    setShowHint(false);
    setCertificateData(null);
  }, [selectedDate]);

  const isCompleted = currentUser?.completedChallenges.includes(challenge.id) || false;

  // Change date offset
  const handleChangeDate = (offsetDays: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + offsetDays);
    const newDateStr = current.toISOString().split('T')[0];
    setSelectedDate(newDateStr);
  };

  // Toggle defense in challenge
  const handleToggleDefense = (id: string) => {
    setActiveDefenses((prev) =>
      prev.map((d) => (d.id === id ? { ...d, enabled: !d.enabled } : d))
    );
  };

  const handleUpdateSensitivity = (id: string, sensitivity: 'conservative' | 'balanced' | 'strict') => {
    setActiveDefenses((prev) =>
      prev.map((d) => (d.id === id ? { ...d, sensitivity } : d))
    );
  };

  const handleToggleFailClosed = (id: string) => {
    setActiveDefenses((prev) =>
      prev.map((d) => (d.id === id ? { ...d, failClosed: !d.failClosed } : d))
    );
  };

  // Run the challenge simulation
  const handleRunChallenge = () => {
    setIsSimulating(true);
    setSimulationResult(null);

    setTimeout(() => {
      const { result, updatedNodes, updatedEdges } = SecurityEngine.runSimulation(
        challenge.attackVector,
        challenge.initialNodes,
        challenge.initialEdges,
        activeDefenses
      );

      setChallengeNodes(updatedNodes);
      setChallengeEdges(updatedEdges);
      setSimulationResult(result);
      setIsSimulating(false);

      // Check objective criteria
      const passed = result.finalVerdict !== 'BREACHED';

      if (passed) {
        // Trigger celebratory confetti
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#38bdf8', '#fbbf24'],
        });

        const cert = DailyChallengeEngine.generateCompletionCertificate(
          challenge,
          currentUser ? currentUser.name : 'Anonymous Security Researcher'
        );
        setCertificateData(cert);

        if (currentUser) {
          onUpdateUserProgress(challenge.xpReward, challenge.id, challenge.badgeReward);
        }
      }
    }, 450);
  };

  // Reset challenge state
  const handleResetChallenge = () => {
    const refreshed = DailyChallengeEngine.getChallengeForDate(selectedDate);
    setActiveDefenses(refreshed.startingDefenses);
    setChallengeNodes(refreshed.initialNodes);
    setChallengeEdges(refreshed.initialEdges);
    setSimulationResult(null);
    setShowHint(false);
  };

  const getDifficultyBadge = (diff: DailyChallenge['difficulty']) => {
    switch (diff) {
      case 'BLACK_HAT_MASTER':
        return 'bg-rose-950 text-rose-300 border-rose-800/80';
      case 'OPERATIVE':
        return 'bg-amber-950 text-amber-300 border-amber-800/80';
      default:
        return 'bg-blue-950 text-blue-300 border-blue-800/80';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Date Switcher, Streak & Reward */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 flex flex-wrap items-center justify-between gap-4">
        {/* Date Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
            <button
              onClick={() => handleChangeDate(-1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              title="Previous Day's Challenge"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1 text-xs font-mono font-bold text-emerald-400 flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{selectedDate}</span>
              {selectedDate === todayStr && (
                <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-[10px] text-emerald-300 border border-emerald-800 font-sans">
                  TODAY
                </span>
              )}
            </div>
            <button
              onClick={() => handleChangeDate(1)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
              title="Next Day's Challenge"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => setSelectedDate(todayStr)}
            className="text-xs text-slate-400 hover:text-slate-200 underline font-medium"
          >
            Jump to Today
          </button>
        </div>

        {/* User Streak & Reward Status */}
        <div className="flex items-center gap-3">
          {currentUser ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-950/40 border border-amber-800/60 text-amber-300 text-xs font-bold">
                <Flame className="w-4 h-4 fill-amber-400 text-amber-500 animate-pulse" />
                <span>{currentUser.streakDays} Day Streak</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs font-bold">
                <Award className="w-4 h-4" />
                <span>+{challenge.xpReward} XP Reward</span>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Sign in to track daily streaks</span>
            </button>
          )}

          {isCompleted && (
            <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-900/60 text-emerald-200 border border-emerald-700 text-xs font-bold font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              SOLVED
            </span>
          )}
        </div>
      </div>

      {/* Main Challenge Layout: Split into Briefing & Interactive Defense Lab */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Threat Scenario Briefing & Objectives (5 Cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Briefing Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <span
                className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-md border uppercase ${getDifficultyBadge(
                  challenge.difficulty
                )}`}
              >
                {challenge.difficulty.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400 font-mono">Day #{challenge.dayNumber}</span>
            </div>

            <div>
              <h2 className="text-base font-bold text-slate-100">{challenge.title}</h2>
              <p className="text-xs text-emerald-400 font-mono mt-0.5">{challenge.category}</p>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Bug className="w-3.5 h-3.5 text-rose-400" />
                Threat Briefing
              </div>
              {challenge.threatBriefing}
            </div>

            {/* Target Architecture */}
            <div className="text-xs text-slate-400">
              <span className="font-semibold text-slate-300">Target System:</span>{' '}
              {challenge.targetArchitectureSummary}
            </div>

            {/* Intercepted Malicious Payload */}
            <div>
              <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span>Intercepted Adversary Payload</span>
                <span className="text-[10px] text-slate-400 font-mono">Max Attempts: {challenge.attackVector.maxAttempts}</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 text-rose-300/90 font-mono text-[11px] break-all">
                {challenge.attackVector.payload}
              </div>
            </div>

            {/* Objectives */}
            <div>
              <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Challenge Objectives
              </div>
              <div className="space-y-2">
                {challenge.objectives.map((obj, idx) => {
                  const isMet =
                    simulationResult && simulationResult.finalVerdict !== 'BREACHED';
                  return (
                    <div
                      key={obj.id}
                      className={`p-2.5 rounded-xl border text-xs flex items-start gap-2.5 transition-colors ${
                        isMet
                          ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200'
                          : 'bg-slate-950/40 border-slate-800 text-slate-300'
                      }`}
                    >
                      <div className="mt-0.5">
                        {isMet ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[10px] text-slate-400 font-mono">
                            {idx + 1}
                          </div>
                        )}
                      </div>
                      <span className="leading-snug">{obj.description}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hint Dropdown */}
            <div className="pt-2 border-t border-slate-800/80">
              <button
                onClick={() => setShowHint(!showHint)}
                className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1.5 font-medium transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showHint ? 'Hide Tactical Hint' : 'Need a tactical hint?'}</span>
              </button>
              {showHint && (
                <div className="mt-2 p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-amber-200 text-xs leading-relaxed">
                  {challenge.hint}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Defense Workbench & Simulation Execution (7 Cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Action Header & Firewalls Config */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Tactical Defense Configuration
                </h3>
                <p className="text-xs text-slate-400">
                  Tune sensitivity parameters and enable strict provenance to stop the attack.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleResetChallenge}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors"
                  title="Reset defenses to initial scenario state"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleRunChallenge}
                  disabled={isSimulating}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {isSimulating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Simulating Exploit...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Execute Defense Test</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Defense Modules Tuning Cards */}
            <div className="space-y-3">
              {activeDefenses.map((defense) => (
                <div
                  key={defense.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    defense.enabled
                      ? 'bg-slate-950/80 border-slate-800'
                      : 'bg-slate-950/30 border-slate-800/40 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <input
                        type="checkbox"
                        checked={defense.enabled}
                        onChange={() => handleToggleDefense(defense.id)}
                        className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <div className="text-xs font-bold text-slate-200 truncate">{defense.name}</div>
                        <div className="text-[11px] text-slate-400 line-clamp-1">{defense.description}</div>
                      </div>
                    </div>

                    {/* Sensitivity Selector */}
                    {defense.enabled && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <select
                          value={defense.sensitivity}
                          onChange={(e) =>
                            handleUpdateSensitivity(
                              defense.id,
                              e.target.value as 'conservative' | 'balanced' | 'strict'
                            )
                          }
                          className="bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="conservative">Conservative</option>
                          <option value="balanced">Balanced</option>
                          <option value="strict">Strict</option>
                        </select>

                        <button
                          type="button"
                          onClick={() => handleToggleFailClosed(defense.id)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-mono border font-semibold transition-colors ${
                            defense.failClosed
                              ? 'bg-rose-950/50 border-rose-800 text-rose-300'
                              : 'bg-slate-900 border-slate-700 text-slate-400'
                          }`}
                          title="Toggle Fail-Closed Mode"
                        >
                          {defense.failClosed ? 'FAIL-CLOSED' : 'FAIL-OPEN'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Simulation Output Banner */}
          {simulationResult && (
            <div
              className={`p-5 rounded-2xl border transition-all ${
                simulationResult.finalVerdict !== 'BREACHED'
                  ? 'bg-emerald-950/30 border-emerald-800/80 text-emerald-100'
                  : 'bg-rose-950/30 border-rose-800/80 text-rose-100'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold shrink-0 ${
                      simulationResult.finalVerdict !== 'BREACHED'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                    }`}
                  >
                    {simulationResult.finalVerdict !== 'BREACHED' ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <ShieldAlert className="w-6 h-6" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold">
                      {simulationResult.finalVerdict !== 'BREACHED'
                        ? 'Scenario Successfully Defended!'
                        : 'Defense Breached - Payload Injected'}
                    </h4>
                    <p className="text-xs opacity-90 mt-0.5">
                      {simulationResult.finalVerdict !== 'BREACHED'
                        ? `Containment verified in ${simulationResult.executionTimeMs}ms across ${simulationResult.attemptsCompleted} simulated attempts.`
                        : `The attack successfully breached the topology on Attempt #${simulationResult.attemptsCompleted}. Adjust firewalls to contain the vector.`}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
                    simulationResult.finalVerdict !== 'BREACHED'
                      ? 'bg-emerald-900/60 border-emerald-700 text-emerald-200'
                      : 'bg-rose-900/60 border-rose-700 text-rose-200'
                  }`}
                >
                  {simulationResult.finalVerdict}
                </span>
              </div>

              {/* Execution Steps Breakdown */}
              <div className="mt-4 space-y-2 max-h-48 overflow-y-auto pr-1">
                {simulationResult.steps.map((step) => (
                  <div
                    key={step.stepNumber}
                    className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-[11px] flex items-start justify-between gap-2"
                  >
                    <div>
                      <span className="font-mono text-slate-400 font-bold mr-2">
                        Attempt {step.stepNumber}:
                      </span>
                      <span className="text-slate-200">{step.reason}</span>
                    </div>
                    <span
                      className={`font-mono text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                        step.verdict === 'ALLOW'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : step.verdict === 'QUARANTINE'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      }`}
                    >
                      {step.verdict}
                    </span>
                  </div>
                ))}
              </div>

              {/* Certificate & Reward Area when solved */}
              {simulationResult.finalVerdict !== 'BREACHED' && certificateData && (
                <div className="mt-4 pt-4 border-t border-emerald-800/40 flex items-center justify-between flex-wrap gap-3">
                  <div className="text-xs text-emerald-300">
                    <span className="font-bold">Verification ID:</span>{' '}
                    <span className="font-mono text-emerald-200">{certificateData.certificateId}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        const blob = new Blob(
                          [
                            JSON.stringify(
                              {
                                certificate: certificateData,
                                challenge: {
                                  id: challenge.id,
                                  title: challenge.title,
                                  date: challenge.dateString,
                                  category: challenge.category,
                                  xpEarned: challenge.xpReward,
                                },
                                recipient: currentUser ? currentUser.name : 'Security Analyst',
                                verifiedBy: 'Agent Defense Lab Cryptographic Red-Team Engine',
                              },
                              null,
                              2
                            ),
                          ],
                          { type: 'application/json' }
                        );
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `defense-certificate-${challenge.id}.json`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold shadow-sm transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Certificate</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
