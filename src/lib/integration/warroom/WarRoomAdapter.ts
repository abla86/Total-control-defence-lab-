import { SecurityEngine } from '../../simulation/SecurityEngine';
import type {
  AgentNode,
  AttackVector,
  DefenseModule,
  NetworkEdge,
} from '../../../types/security';

export type WarRoomSimulation = ReturnType<typeof SecurityEngine.runSimulation>;

export interface WarRoomSimulationInput {
  attack: AttackVector;
  nodes: AgentNode[];
  edges: NetworkEdge[];
  defenses: DefenseModule[];
}

/**
 * Thin integration boundary between the WarRoom presentation layer and the
 * authoritative SecurityEngine.
 *
 * The adapter deliberately does not re-evaluate attacks or transform security
 * decisions. SecurityEngine remains the single source of truth.
 */
export function runWarRoomSimulation(
  input: WarRoomSimulationInput
): WarRoomSimulation {
  return SecurityEngine.runSimulation(
    input.attack,
    input.nodes,
    input.edges,
    input.defenses
  );
}
