import { AttackVector, NodeType, ProvenanceSource, SecurityVerdict, ActionRiskLevel } from './security';

export interface GeneCodon {
  id: string;
  code: string; // e.g. "MUT_DRIFT", "RECURSIVE_SPAWN", "PROV_SPOOF"
  name: string;
  category: 'PROPAGATION' | 'EVASION' | 'PAYLOAD' | 'PERSISTENCE' | 'TARGETING';
  expressionLevel: number; // 0.0 to 1.0
  active: boolean;
  description: string;
  potency: number; // 1 to 10
  color: string;
}

export interface WormOrganism {
  id: string;
  name: string;
  strain: string; // e.g. "Morris-II-Polyglot-v4"
  generation: number;
  vitality: number; // 0 to 100%
  replicationRate: number; // e.g. 2.4x per hop
  mutationProbability: number; // 0.0 to 1.0
  stealthIndex: number; // 0 to 100%
  genomeCodons: GeneCodon[];
  lifecycleState: 'DORMANT' | 'HUNTING' | 'REPLICATING' | 'MUTATING' | 'CONTAINED' | 'NEUTRALIZED';
  phenotypeDescription: string;
  activePayload: string;
  targetedModalities: Array<'TEXT' | 'TOOL' | 'MEMORY' | 'RAG' | 'NETWORK'>;
  discoveredVulnerabilities: string[];
}

export interface BehavioralDriftSlot {
  epochIndex: number;
  timestamp: string;
  timeLabel: string;
  agentNodeId: string;
  agentNodeName: string;
  semanticDrift: number; // 0 to 100
  toolEntropy: number; // 0 to 100
  memoryVolatility: number; // 0 to 100
  permissionElevationRisk: number; // 0 to 100
  provenanceDecay: number; // 0 to 100
  compositeRisk: number; // 0 to 100
  anomalyDetected: boolean;
  anomalyReason?: string;
}

export interface SandboxExecutionTrap {
  id: string;
  type: 'EGRESS_TRAP' | 'MOCK_SHELL' | 'HONEYPOT_DATABASE' | 'MEMORY_AIRGAP' | 'CANARY_TOKEN';
  name: string;
  status: 'ARMED' | 'TRIGGERED' | 'ISOLATED';
  interceptedPayload?: string;
  originNode: string;
  timestamp: number;
}

export interface SystemIntegrityIssue {
  id: string;
  severity: ActionRiskLevel;
  component: string;
  nodeId?: string;
  title: string;
  description: string;
  affectedPath: string;
  canAutoFix: boolean;
  fixActionLabel: string;
  isFixed: boolean;
}

export interface XAIExplainabilityNode {
  id: string;
  layer: 'PROVENANCE_INGRESS' | 'INTENT_SEMANTICS' | 'TOOL_SCHEMA_CHECK' | 'WORM_SIGNATURE' | 'FINAL_DECISION';
  name: string;
  confidenceScore: number;
  verdict: SecurityVerdict;
  rationale: string;
  heuristicFactors: Array<{ name: string; weight: number; status: 'SAFE' | 'VIOLATION' | 'FLAGGED' }>;
  nistAlignment: string;
  owaspAlignment: string;
}
