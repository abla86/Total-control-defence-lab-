import React, { useState, useMemo } from 'react';
import {
  Activity,
  Flame,
  AlertTriangle,
  Radio,
  Sliders,
  Filter,
  RefreshCw,
  TrendingUp,
  Cpu,
  Layers,
  ShieldAlert,
  Info,
} from 'lucide-react';
import { AgentNode } from '../types/security';
import { BehavioralDriftSlot } from '../types/organism';
import { WormDnaEngine } from '../lib/simulation/WormDnaEngine';

interface DriftHeatmapViewProps {
  nodes: AgentNode[];
}

export const DriftHeatmapView: React.FC<DriftHeatmapViewProps> = ({ nodes }) => {
  const [epochsCount, setEpochsCount] = useState<number>(8);
  const [selectedMetric, setSelectedMetric] = useState<
    'compositeRisk' | 'semanticDrift' | 'toolEntropy' | 'memoryVolatility' | 'permissionElevationRisk' | 'provenanceDecay'
  >('compositeRisk');
  const [selectedSlot, setSelectedSlot] = useState<BehavioralDriftSlot | null>(null);

  // Generate drift slots
  const driftSlots = useMemo(() => {
    return WormDnaEngine.generateDriftHeatmap(nodes, epochsCount);
  }, [nodes, epochsCount]);

  // Unique epochs list
  const epochIndices = useMemo(() => {
    return Array.from({ length: epochsCount }, (_, i) => i + 1);
  }, [epochsCount]);

  const getMetricColor = (val: number) => {
    if (val < 25) return 'bg-emerald-950/60 text-emerald-300 border-emerald-900/60 hover:bg-emerald-900/60';
    if (val < 50) return 'bg-cyan-950/60 text-cyan-300 border-cyan-900/60 hover:bg-cyan-900/60';
    if (val < 70) return 'bg-amber-950/70 text-amber-300 border-amber-900/60 hover:bg-amber-900/60';
    return 'bg-rose-950/80 text-rose-300 border-rose-800 hover:bg-rose-900 animate-pulse';
  };

  const metricDescriptions = {
    compositeRisk: 'Weighted composite metric reflecting holistic behavioral divergence across all layers.',
    semanticDrift: 'Cosine distance of agent prompt/response embeddings compared to safe baseline instructions.',
    toolEntropy: 'Shannon entropy and polymorphism score of dynamic tool invocation arguments.',
    memoryVolatility: 'Rate of unauthorized key mutations and overwrites in episodic memory registers.',
    permissionElevationRisk: 'Proximity of executed actions to privileged subshell/network capabilities.',
    provenanceDecay: 'Degradation score of caller attribution tokens across multi-agent hops.',
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-rose-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold shrink-0 shadow-lg">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-slate-100">Temporal Agent Behavioral Drift Matrix</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800/80 font-mono">
                  LIVE EPOCH MONITOR
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {metricDescriptions[selectedMetric]}
              </p>
            </div>
          </div>

          {/* Metric Selector Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'compositeRisk', label: 'Composite Risk' },
              { id: 'semanticDrift', label: 'Semantic Drift' },
              { id: 'toolEntropy', label: 'Tool Entropy' },
              { id: 'memoryVolatility', label: 'Memory Volatility' },
              { id: 'permissionElevationRisk', label: 'Privilege Elevation' },
              { id: 'provenanceDecay', label: 'Provenance Decay' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedMetric(tab.id as any)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  selectedMetric === tab.id
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Heatmap Matrix Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 overflow-x-auto space-y-4">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <Flame className="w-4 h-4 text-amber-400" />
            <span>Agent Node Behavior Across {epochsCount} Temporal Epochs (T-16m to T-0)</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-emerald-900 border border-emerald-700" />
              <span className="text-slate-400 text-[11px]">Normal (&lt;25%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-cyan-900 border border-cyan-700" />
              <span className="text-slate-400 text-[11px]">Nominal (&lt;50%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-amber-900 border border-amber-700" />
              <span className="text-slate-400 text-[11px]">Elevated (&lt;70%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded bg-rose-900 border border-rose-700" />
              <span className="text-slate-400 text-[11px]">Critical (&gt;70%)</span>
            </div>
          </div>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
              <th className="pb-3 pr-4 font-semibold">Agent Node</th>
              {epochIndices.map((epoch) => (
                <th key={epoch} className="pb-3 px-2 text-center font-semibold">
                  Epoch {epoch}
                </th>
              ))}
              <th className="pb-3 pl-4 text-right font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {nodes.map((node) => {
              const nodeSlots = driftSlots.filter((s) => s.agentNodeId === node.id);
              const latestSlot = nodeSlots[nodeSlots.length - 1];

              return (
                <tr key={node.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          node.status === 'infected' ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'
                        }`}
                      />
                      <span className="text-xs font-bold text-slate-200">{node.name}</span>
                      <span className="text-[10px] font-mono text-slate-400 uppercase">({node.type})</span>
                    </div>
                  </td>

                  {nodeSlots.map((slot) => {
                    const value = slot[selectedMetric];
                    const isSelected = selectedSlot?.agentNodeId === slot.agentNodeId && selectedSlot.epochIndex === slot.epochIndex;

                    return (
                      <td key={slot.epochIndex} className="py-3 px-2 text-center">
                        <button
                          onClick={() => setSelectedSlot(slot)}
                          className={`w-full py-2 px-1 rounded-lg border text-xs font-mono font-bold transition-all ${getMetricColor(
                            value
                          )} ${isSelected ? 'ring-2 ring-amber-400 scale-105' : ''}`}
                        >
                          {value}%
                        </button>
                      </td>
                    );
                  })}

                  <td className="py-3 pl-4 text-right">
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border uppercase ${
                        node.status === 'infected'
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      }`}
                    >
                      {node.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Selected Slot Detailed Decomposition Drawer */}
      {selectedSlot && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                Epoch {selectedSlot.epochIndex} &bull; Time: {selectedSlot.timeLabel}
              </div>
              <h3 className="text-base font-bold text-slate-100 mt-0.5">
                Behavioral Trace: {selectedSlot.agentNodeName}
              </h3>
            </div>

            {selectedSlot.anomalyDetected && (
              <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-rose-950 border border-rose-800 text-rose-300 text-xs font-bold font-mono">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>ANOMALY FLAGGED</span>
              </span>
            )}
          </div>

          {selectedSlot.anomalyReason && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-900/60 text-xs text-rose-200">
              <span className="font-bold">Trigger Rule: </span> {selectedSlot.anomalyReason}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400">Semantic Drift</div>
              <div className="text-base font-bold font-mono text-cyan-300 mt-0.5">
                {selectedSlot.semanticDrift}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400">Tool Entropy</div>
              <div className="text-base font-bold font-mono text-purple-300 mt-0.5">
                {selectedSlot.toolEntropy}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400">Memory Volatility</div>
              <div className="text-base font-bold font-mono text-emerald-300 mt-0.5">
                {selectedSlot.memoryVolatility}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400">Privilege Elevation</div>
              <div className="text-base font-bold font-mono text-rose-300 mt-0.5">
                {selectedSlot.permissionElevationRisk}%
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <div className="text-[10px] text-slate-400">Composite Risk</div>
              <div className="text-base font-bold font-mono text-amber-300 mt-0.5">
                {selectedSlot.compositeRisk}%
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
