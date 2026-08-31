import React, { useState } from 'react';
import {
  Dna,
  Bug,
  Sparkles,
  Zap,
  ShieldCheck,
  ShieldAlert,
  Activity,
  Layers,
  RotateCcw,
  Sliders,
  Play,
  Flame,
  Radio,
  Target,
  RefreshCw,
  Terminal,
  Cpu,
} from 'lucide-react';
import { GeneCodon, WormOrganism } from '../types/organism';
import { INITIAL_WORM_ORGANISM, WormDnaEngine } from '../lib/simulation/WormDnaEngine';
import { AttackVector } from '../types/security';

interface WormDnaVisualizerProps {
  onSimulateOrganism: (attack: AttackVector) => void;
}

export const WormDnaVisualizer: React.FC<WormDnaVisualizerProps> = ({ onSimulateOrganism }) => {
  const [organism, setOrganism] = useState<WormOrganism>(INITIAL_WORM_ORGANISM);
  const [mutationRate, setMutationRate] = useState<number>(0.35);
  const [selectedCodon, setSelectedCodon] = useState<GeneCodon>(organism.genomeCodons[0]);
  const [isSimulatingMutation, setIsSimulatingMutation] = useState<boolean>(false);

  const handleMutateLive = () => {
    setIsSimulatingMutation(true);
    setTimeout(() => {
      const evolved = WormDnaEngine.mutateOrganism(organism, mutationRate);
      setOrganism(evolved);
      // Update selected codon if available
      const updatedSelected = evolved.genomeCodons.find((c) => c.id === selectedCodon.id) || evolved.genomeCodons[0];
      setSelectedCodon(updatedSelected);
      setIsSimulatingMutation(false);
    }, 450);
  };

  const handleToggleCodon = (codonId: string) => {
    setOrganism((prev) => {
      const updated = prev.genomeCodons.map((c) => (c.id === codonId ? { ...c, active: !c.active } : c));
      return {
        ...prev,
        genomeCodons: updated,
      };
    });
  };

  const handleExpressionChange = (codonId: string, value: number) => {
    setOrganism((prev) => {
      const updated = prev.genomeCodons.map((c) =>
        c.id === codonId ? { ...c, expressionLevel: value, active: value > 0 } : c
      );
      return {
        ...prev,
        genomeCodons: updated,
      };
    });
  };

  const handleConvertAndLaunch = () => {
    const activeCodonCodes = organism.genomeCodons.filter((c) => c.active).map((c) => c.code);
    const generatedAttack: AttackVector = {
      id: `dna-worm-${organism.id}-gen${organism.generation}`,
      name: `${organism.name} (Gen ${organism.generation} DNA Worm)`,
      category: 'worm_propagation',
      description: organism.phenotypeDescription,
      severity: organism.vitality > 75 ? 'CRITICAL' : 'HIGH',
      payload: organism.activePayload,
      targetNodeType: 'agent',
      maxAttempts: Math.round(organism.replicationRate * 2),
      propagationStrategy: {
        spreadsToTools: activeCodonCodes.includes('TOOL_SHADOW'),
        spreadsToMemory: activeCodonCodes.includes('EPISODIC_HIJACK') || activeCodonCodes.includes('RECURSIVE_SPAWN'),
        spreadsToRAG: activeCodonCodes.includes('RAG_ANCHOR'),
        spreadsToNetwork: activeCodonCodes.includes('BASH_EXFIL') || activeCodonCodes.includes('PROV_SPOOF'),
        adaptiveMutation: organism.mutationProbability > 0.2,
      },
    };

    onSimulateOrganism(generatedAttack);
  };

  return (
    <div className="space-y-6">
      {/* Top Organism Identity Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/20 to-rose-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 font-bold shrink-0 shadow-lg">
              <Dna className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-slate-100">{organism.name}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-300 border border-purple-800/80 font-mono">
                  STRAIN: {organism.strain}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800/80 font-mono">
                  GEN {organism.generation}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {organism.phenotypeDescription}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleMutateLive}
              disabled={isSimulatingMutation}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 text-purple-200 border border-purple-800 text-xs font-bold transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulatingMutation ? 'animate-spin' : ''}`} />
              <span>Mutate Genome (Epoch)</span>
            </button>

            <button
              onClick={handleConvertAndLaunch}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white text-xs font-bold shadow-md transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Release & Simulate Worm</span>
            </button>
          </div>
        </div>

        {/* Vitality & Trait Telemetry Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-800/80">
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-rose-400" />
                Organism Vitality
              </span>
              <span className="text-rose-400 font-mono font-bold">{organism.vitality}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
              <div className="h-full bg-rose-500" style={{ width: `${organism.vitality}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Radio className="w-3.5 h-3.5 text-cyan-400" />
                Stealth Index
              </span>
              <span className="text-cyan-400 font-mono font-bold">{organism.stealthIndex}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
              <div className="h-full bg-cyan-500" style={{ width: `${organism.stealthIndex}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Replication Factor
              </span>
              <span className="text-amber-400 font-mono font-bold">{organism.replicationRate}x</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
              <div className="h-full bg-amber-500" style={{ width: `${(organism.replicationRate / 5) * 100}%` }} />
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-purple-400" />
                Mutation Rate
              </span>
              <span className="text-purple-300 font-mono font-bold">{Math.round(mutationRate * 100)}%</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mt-2">
              <div className="h-full bg-purple-500" style={{ width: `${mutationRate * 100}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Genome Double-Helix Sequencer & Codon Controller */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: DNA Codon Sequence Grid (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Dna className="w-4 h-4 text-purple-400" />
              <span>Worm Genome Codon Array ({organism.genomeCodons.length} Alleles)</span>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Mutation Sensitivity:</span>
              <input
                type="range"
                min="0.05"
                max="0.8"
                step="0.05"
                value={mutationRate}
                onChange={(e) => setMutationRate(parseFloat(e.target.value))}
                className="w-20 accent-purple-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {organism.genomeCodons.map((codon) => {
              const isSelected = selectedCodon?.id === codon.id;
              return (
                <div
                  key={codon.id}
                  onClick={() => setSelectedCodon(codon)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-slate-900 border-purple-500 shadow-lg ring-1 ring-purple-500/30'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleCodon(codon.id);
                        }}
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                          codon.active
                            ? 'bg-purple-600 border-purple-500 text-white'
                            : 'bg-slate-800 border-slate-700'
                        }`}
                      >
                        {codon.active && <span className="text-[10px] font-bold">&bull;</span>}
                      </button>
                      <div>
                        <div className="text-xs font-bold text-slate-200">{codon.code}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-[150px]">{codon.name}</div>
                      </div>
                    </div>

                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-purple-300">
                      P{codon.potency}
                    </span>
                  </div>

                  {/* Expression Slider */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span>Expression:</span>
                      <span className="font-mono font-bold text-slate-200">
                        {Math.round(codon.expressionLevel * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={codon.expressionLevel}
                      onChange={(e) => handleExpressionChange(codon.id, parseFloat(e.target.value))}
                      className="w-full h-1 accent-purple-400 bg-slate-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Codon Details & Active Payload Editor (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {selectedCodon && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-mono text-purple-400 font-bold uppercase">
                    Codon Allele Inspector
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 mt-0.5">{selectedCodon.name}</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-300">
                  {selectedCodon.category}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{selectedCodon.description}</p>

              {/* Modality Vector Mapping */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Targeted Attack Surfaces
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {organism.targetedModalities.map((mod, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] font-mono font-bold text-cyan-300"
                    >
                      {mod}
                    </span>
                  ))}
                </div>
              </div>

              {/* Active Worm Assembly Payload */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Assembled Worm Payload</span>
                  <span className="text-[10px] font-mono text-rose-400">POLYMORPHIC</span>
                </div>
                <textarea
                  value={organism.activePayload}
                  onChange={(e) => setOrganism({ ...organism, activePayload: e.target.value })}
                  rows={4}
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-rose-300 focus:outline-none focus:border-purple-500 leading-relaxed resize-none"
                />
              </div>

              {/* Discovered Architecture Exploits */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Discovered Vector Exploits
                </div>
                <div className="space-y-1.5">
                  {organism.discoveredVulnerabilities.map((vuln, idx) => (
                    <div
                      key={idx}
                      className="p-2 rounded-lg bg-rose-950/20 border border-rose-900/50 text-[11px] text-rose-300/90 flex items-start gap-1.5"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400 mt-1 shrink-0" />
                      <span>{vuln}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
