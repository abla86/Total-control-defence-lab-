import { AgentNode, NetworkEdge, AttackVector, DefenseModule, SecurityVerdict } from './security';
import { SecurityBadge } from './auth';

export type ChallengeDifficulty = 'RECRUIT' | 'OPERATIVE' | 'BLACK_HAT_MASTER';

export interface ChallengeObjective {
  id: string;
  description: string;
  isMet: boolean;
  requiredMetric?: {
    type: 'min_containment' | 'zero_infections' | 'max_latency' | 'block_specific_node';
    threshold: number;
    targetId?: string;
  };
}

export interface DailyChallenge {
  id: string; // e.g. "challenge-2026-08-31"
  dateString: string; // YYYY-MM-DD
  dayNumber: number;
  title: string;
  difficulty: ChallengeDifficulty;
  category: string;
  threatBriefing: string;
  targetArchitectureSummary: string;
  xpReward: number;
  badgeReward?: SecurityBadge;
  initialNodes: AgentNode[];
  initialEdges: NetworkEdge[];
  attackVector: AttackVector;
  startingDefenses: DefenseModule[];
  objectives: ChallengeObjective[];
  hint: string;
  solutionBrief: string;
}

export interface ChallengeAttemptResult {
  challengeId: string;
  timestamp: number;
  success: boolean;
  score: number;
  objectivesMet: string[];
  executionSummary: string;
  nodesInfectedCount: number;
  defensesTriggeredCount: number;
  xpEarned: number;
  certificateHash?: string;
}
