import React, { useState } from 'react';
import {
  AgentNode,
  NetworkEdge,
  SimulationResult,
  SimulationStep,
  NodeStatus,
} from '../types/security';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Terminal,
  Globe,
  Database,
  Layers,
  User,
  HardDrive,
  AlertTriangle,
  Play,
  Pause,
  SkipForward,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Key,
} from 'lucide-react';

interface TopologyMapProps {
  nodes: AgentNode[];
  edges: NetworkEdge[];
  lastSimulation: SimulationResult | null;
  onNodeSelect: (node: AgentNode) => void;
  selectedNode: AgentNode | null;
  onQuarantineNode: (nodeId: string) => void;
  onCleanNode: (nodeId: string) => void;
}

export const TopologyMap: React.FC<TopologyMapProps> = ({
  nodes,
  edges,
  lastSimulation,
  onNodeSelect,
  selectedNode,
  onQuarantineNode,
  onCleanNode,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Derive current step state
  const activeStep: SimulationStep | null =
    lastSimulation && currentStepIndex >= 0 && currentStepIndex < lastSimulation.steps.length
      ? lastSimulation.steps[currentStepIndex]
      : lastSimulation && lastSimulation.steps.length > 0
      ? lastSimulation.steps[lastSimulation.steps.length - 1]
      : null;

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'agent':
        return Cpu;
      case 'tool':
        return Terminal;
      case 'memory':
        return HardDrive;
      case 'rag':
        return Layers;
      case 'database':
        return Database;
      case 'user':
        return User;
      default:
        return Globe;
    }
  };

  const getStatusColor = (status: NodeStatus) => {
    switch (status) {
      case 'infected':
        return {
          bg: 'bg-rose-950/80',
          border: 'border-rose-500',
          text: 'text-rose-400',
          badge: 'bg-rose-500 text-white',
          glow: 'shadow-[0_0_20px_rgba(244,63,94,0.4)]',
        };
      case 'quarantined':
        return {
          bg: 'bg-amber-950/80',
          border: 'border-amber-500 border-dashed',
          text: 'text-amber-400',
          badge: 'bg-amber-500 text-black',
          glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]',
        };
      case 'defended':
        return {
          bg: 'bg-emerald-950/80',
          border: 'border-emerald-500',
          text: 'text-emerald-400',
          badge: 'bg-emerald-600 text-white',
          glow: 'shadow-[0_0_15px_rgba(16,185,129,0.2)]',
        };
      default:
        return {
          bg: 'bg-slate-900',
          border: 'border-slate-700',
          text: 'text-slate-200',
          badge: 'bg-slate-800 text-slate-300',
          glow: '',
        };
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
      {/* Visual Canvas Area */}
      <div className="lg:col-span-8 flex flex-col gap-3">
        {/* Playback & Legend Bar */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-300">Topology Canvas:</span>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block" /> Clean
              </span>
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse inline-block" /> Infected
              </span>
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" /> Quarantined
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Defended
              </span>
            </div>
          </div>

          {/* Simulation Step Scrubber if simulation exists */}
          {lastSimulation && lastSimulation.steps.length > 0 && (
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800">
              <span className="text-slate-400">
                Step {Math.max(1, currentStepIndex + 1)} of {lastSimulation.steps.length}
              </span>
              <button
                onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentStepIndex <= 0}
                className="p-1 hover:bg-slate-800 rounded text-slate-300 disabled:opacity-40"
              >
                ◀
              </button>
              <button
                onClick={() =>
                  setCurrentStepIndex((prev) =>
                    prev < lastSimulation.steps.length - 1 ? prev + 1 : 0
                  )
                }
                className="p-1 hover:bg-slate-800 rounded text-slate-300"
              >
                ▶
              </button>
            </div>
          )}
        </div>

        {/* SVG Interactive Topology Diagram */}
        <div className="relative bg-slate-950 border border-slate-800 rounded-xl p-4 min-h-[460px] overflow-hidden flex items-center justify-center select-none shadow-inner">
          {/* Subtle Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-20 pointer-events-none" />

          <svg className="w-full h-[440px]" viewBox="0 0 740 440">
            <defs>
              <marker
                id="arrow"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 8 5 L 0 9 z" fill="#64748b" />
              </marker>
              <marker
                id="arrow-infected"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 8 5 L 0 9 z" fill="#f43f5e" />
              </marker>
              <marker
                id="arrow-blocked"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1 L 8 5 L 0 9 z" fill="#f59e0b" />
              </marker>
            </defs>

            {/* Render Network Edges */}
            {edges.map((edge) => {
              const sourceNode = nodes.find((n) => n.id === edge.source);
              const targetNode = nodes.find((n) => n.id === edge.target);
              if (!sourceNode || !targetNode) return null;

              const strokeColor = edge.isInfected
                ? '#f43f5e'
                : edge.isBlocked
                ? '#f59e0b'
                : '#475569';
              const markerId = edge.isInfected
                ? 'url(#arrow-infected)'
                : edge.isBlocked
                ? 'url(#arrow-blocked)'
                : 'url(#arrow)';

              const midX = (sourceNode.x + targetNode.x) / 2;
              const midY = (sourceNode.y + targetNode.y) / 2;

              return (
                <g key={edge.id}>
                  <line
                    x1={sourceNode.x}
                    y1={sourceNode.y}
                    x2={targetNode.x}
                    y2={targetNode.y}
                    stroke={strokeColor}
                    strokeWidth={edge.isInfected ? 3 : 1.75}
                    strokeDasharray={edge.isBlocked ? '5,5' : edge.isInfected ? '6,3' : 'none'}
                    className={edge.isInfected ? 'animate-pulse' : ''}
                    markerEnd={markerId}
                  />
                  {edge.label && (
                    <text
                      x={midX}
                      y={midY - 6}
                      fill="#94a3b8"
                      fontSize="9"
                      textAnchor="middle"
                      className="font-mono select-none"
                    >
                      {edge.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Render Nodes as SVG Groups */}
            {nodes.map((node) => {
              const Icon = getNodeIcon(node.type);
              const isSelected = selectedNode?.id === node.id;
              const styles = getStatusColor(node.status);

              return (
                <g
                  key={node.id}
                  transform={`translate(${node.x}, ${node.y})`}
                  onClick={() => onNodeSelect(node)}
                  className="cursor-pointer group"
                >
                  {/* Outer halo if selected or infected */}
                  {node.status === 'infected' && (
                    <circle
                      r="42"
                      className="fill-rose-500/20 animate-ping"
                    />
                  )}
                  {isSelected && (
                    <circle
                      r="38"
                      className="fill-emerald-500/10 stroke-emerald-400 stroke-2"
                      strokeDasharray="4,2"
                    />
                  )}

                  {/* Main Node Background Box / Circle */}
                  <rect
                    x="-50"
                    y="-28"
                    width="100"
                    height="56"
                    rx="10"
                    className={`transition-all ${
                      node.status === 'infected'
                        ? 'fill-rose-950 stroke-rose-500 stroke-2'
                        : node.status === 'quarantined'
                        ? 'fill-amber-950 stroke-amber-500 stroke-2'
                        : node.status === 'defended'
                        ? 'fill-emerald-950 stroke-emerald-500 stroke-2'
                        : 'fill-slate-900 stroke-slate-700 hover:stroke-slate-500'
                    }`}
                  />

                  {/* Provenance Indicator Pill */}
                  <rect
                    x="-44"
                    y="-22"
                    width="88"
                    height="12"
                    rx="3"
                    className="fill-slate-950/80"
                  />
                  <text
                    x="0"
                    y="-13"
                    fill={node.provenance === 'WEB_UNTRUSTED' ? '#f43f5e' : '#94a3b8'}
                    fontSize="7.5"
                    fontWeight="bold"
                    textAnchor="middle"
                    className="font-mono select-none"
                  >
                    {node.provenance}
                  </text>

                  {/* Node Label Text */}
                  <text
                    x="0"
                    y="6"
                    fill="#f1f5f9"
                    fontSize="9.5"
                    fontWeight="600"
                    textAnchor="middle"
                    className="select-none"
                  >
                    {node.name.length > 14 ? node.name.substring(0, 13) + '..' : node.name}
                  </text>

                  {/* Node Status Badge */}
                  <text
                    x="0"
                    y="20"
                    fill={
                      node.status === 'infected'
                        ? '#fb7185'
                        : node.status === 'quarantined'
                        ? '#fbbf24'
                        : node.status === 'defended'
                        ? '#34d399'
                        : '#64748b'
                    }
                    fontSize="8"
                    fontWeight="500"
                    textAnchor="middle"
                    className="font-mono uppercase select-none"
                  >
                    {node.status}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Current Step Telemetry Overlay */}
          {activeStep && (
            <div className="absolute bottom-3 left-3 right-3 bg-slate-900/90 backdrop-blur border border-slate-800 p-3 rounded-lg flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-slate-300 font-bold">
                  Step {activeStep.stepNumber}
                </span>
                <span className="text-slate-300 font-medium">{activeStep.action}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Verdict:</span>
                <span
                  className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                    activeStep.verdict === 'DENY'
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                      : activeStep.verdict === 'QUARANTINE'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-rose-950 text-rose-300 border border-rose-800'
                  }`}
                >
                  {activeStep.verdict}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Node Inspector & Telemetry Side Panel */}
      <div className="lg:col-span-4 flex flex-col gap-3">
        {selectedNode ? (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3.5">
            {/* Header with status badge */}
            <div className="flex items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-100">{selectedNode.name}</h3>
                  <span className="text-xs text-slate-400 font-mono">ID: {selectedNode.id}</span>
                </div>
              </div>
              <span
                className={`text-xs px-2.5 py-1 rounded-md font-mono font-bold uppercase ${
                  selectedNode.status === 'infected'
                    ? 'bg-rose-900/80 text-rose-300 border border-rose-700'
                    : selectedNode.status === 'quarantined'
                    ? 'bg-amber-900/80 text-amber-300 border border-amber-700'
                    : selectedNode.status === 'defended'
                    ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700'
                    : 'bg-slate-800 text-slate-300'
                }`}
              >
                {selectedNode.status}
              </span>
            </div>

            {/* Description & Provenance */}
            <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80">
              {selectedNode.description}
            </div>

            {/* Provenance & Risk Metatags */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] block uppercase font-mono">Provenance</span>
                <span
                  className={`font-semibold font-mono ${
                    selectedNode.provenance === 'WEB_UNTRUSTED' ? 'text-rose-400' : 'text-slate-200'
                  }`}
                >
                  {selectedNode.provenance}
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 text-[10px] block uppercase font-mono">Risk Exposure</span>
                <span
                  className={`font-semibold font-mono ${
                    selectedNode.riskScore > 50 ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {selectedNode.riskScore}/100
                </span>
              </div>
            </div>

            {/* Assigned Permissions */}
            <div>
              <span className="text-xs font-semibold text-slate-400 block mb-1.5">Active Permissions:</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedNode.permissions.map((perm) => (
                  <span
                    key={perm}
                    className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-700"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>

            {/* Memory Data or Tool Schema if present */}
            {selectedNode.memoryData && (
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                  <HardDrive className="w-3 h-3 text-slate-400" /> Memory Slots:
                </span>
                <pre className="text-[10px] font-mono text-emerald-400 bg-slate-900/90 p-2 rounded overflow-x-auto max-h-24">
                  {JSON.stringify(selectedNode.memoryData, null, 2)}
                </pre>
              </div>
            )}

            {selectedNode.toolSchema && (
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-xs font-semibold text-slate-300 block mb-1.5 flex items-center gap-1">
                  <Key className="w-3 h-3 text-slate-400" /> Schema SHA-256 Hash:
                </span>
                <code className="text-[10px] font-mono text-slate-300 block truncate">
                  {selectedNode.toolSchema.hash}
                </code>
              </div>
            )}

            {/* Node Actions */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
              {selectedNode.status === 'infected' ? (
                <button
                  onClick={() => onCleanNode(selectedNode.id)}
                  className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-all"
                >
                  Sanitize Node
                </button>
              ) : (
                <button
                  onClick={() => onQuarantineNode(selectedNode.id)}
                  className="flex-1 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-black text-xs font-semibold transition-all"
                >
                  Quarantine Node
                </button>
              )}
              <button
                onClick={() => onCleanNode(selectedNode.id)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col items-center justify-center text-center gap-2 min-h-[300px]">
            <Cpu className="w-10 h-10 text-slate-600" />
            <h4 className="font-semibold text-sm text-slate-300">No Node Selected</h4>
            <p className="text-xs text-slate-500 max-w-[220px]">
              Click any node in the topology diagram to inspect its permissions, provenance, and active memory state.
            </p>
          </div>
        )}

        {/* Threat Summary Card */}
        {lastSimulation && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 flex flex-col gap-2 text-xs">
            <span className="font-bold text-slate-200">Last Simulation Telemetry:</span>
            <div className="flex items-center justify-between text-slate-400">
              <span>Attack Vector:</span>
              <span className="font-mono text-slate-200 font-semibold truncate max-w-[160px]">
                {lastSimulation.attackName}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Final Outcome:</span>
              <span
                className={`font-mono font-bold ${
                  lastSimulation.finalVerdict === 'BREACHED'
                    ? 'text-rose-400'
                    : lastSimulation.finalVerdict === 'CONTAINED'
                    ? 'text-amber-400'
                    : 'text-emerald-400'
                }`}
              >
                {lastSimulation.finalVerdict}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Attempts Executed:</span>
              <span className="font-mono text-slate-200">{lastSimulation.attemptsCompleted}</span>
            </div>
            <div className="flex items-center justify-between text-slate-400">
              <span>Defense Latency:</span>
              <span className="font-mono text-slate-200">{lastSimulation.metrics.defenseLatencyMs} ms</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
