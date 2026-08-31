import {
  AgentNode,
  NetworkEdge,
  AttackVector,
  DefenseModule,
  SimulationResult,
  SimulationStep,
  AuditLogEntry,
  SecurityVerdict,
  ProvenanceSource,
  NodeStatus,
} from '../../types/security';
import { syncHash } from './crypto';

function cloneDefense(defense: DefenseModule): DefenseModule {
  return {
    ...defense,
    rules: defense.rules.map((rule) => ({ ...rule })),
  };
}

function cloneNode(node: AgentNode): AgentNode {
  return {
    ...node,
    permissions: [...node.permissions],
    infectionHistory: node.infectionHistory.map((entry) => ({ ...entry })),
    memoryData: node.memoryData ? { ...node.memoryData } : undefined,
    toolSchema: node.toolSchema
      ? {
          ...node.toolSchema,
          parameters: [...node.toolSchema.parameters],
          allowedCallers: [...node.toolSchema.allowedCallers],
        }
      : undefined,
  };
}

export class SecurityEngine {
  /**
   * Evaluates an incoming attack vector against the current node topology and active defenses.
   *
   * The simulation is intentionally side-effect free with respect to caller-owned state:
   * nodes, edges, defenses and their nested collections are cloned before simulation.
   */
  static runSimulation(
    attack: AttackVector,
    nodes: AgentNode[],
    edges: NetworkEdge[],
    defenses: DefenseModule[]
  ): {
    result: SimulationResult;
    updatedNodes: AgentNode[];
    updatedEdges: NetworkEdge[];
    auditLogs: AuditLogEntry[];
  } {
    const startTime = performance.now();
    const steps: SimulationStep[] = [];
    const auditLogs: AuditLogEntry[] = [];
    const nodeStateMap: Record<string, NodeStatus> = {};
    const infectedNodeIds = new Set<string>();
    const protectedNodeIds = new Set<string>();

    // Clone every caller-owned collection before applying simulation state.
    const updatedEdges = edges.map((edge) => ({
      ...edge,
      isInfected: false,
      isBlocked: false,
    }));
    const currentNodes: AgentNode[] = nodes.map((node) => {
      nodeStateMap[node.id] = 'clean';
      return { ...cloneNode(node), status: 'clean' };
    });
    const currentDefenses = defenses.map(cloneDefense);

    let currentPayload = attack.payload;
    let breached = false;
    let contained = false;
    let attemptsCompleted = 0;
    const maxAttempts = Math.max(1, attack.maxAttempts || 1);

    const targetNode =
      currentNodes.find((node) => node.type === attack.targetNodeType) ||
      currentNodes[1] ||
      currentNodes[0];
    const initialSourceNode =
      currentNodes.find((node) => node.type === 'user') || currentNodes[0];

    if (!targetNode || !initialSourceNode) {
      throw new Error('SecurityEngine requires at least one node.');
    }

    let currentProvenance: ProvenanceSource = 'USER';
    if (
      attack.category === 'tool_poisoning' ||
      attack.category === 'privilege_escalation'
    ) {
      currentProvenance = 'WEB_UNTRUSTED';
    } else if (attack.category === 'memory_poisoning') {
      currentProvenance = 'MEMORY';
    } else if (attack.category === 'rag_corruption') {
      currentProvenance = 'TOOL_OUTPUT';
    }

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      attemptsCompleted = attempt;
      const attemptSeed = `${attack.id}_attempt_${attempt}`;
      const payloadHash = syncHash(currentPayload + attemptSeed);

      if (attempt > 1 && attack.propagationStrategy.adaptiveMutation) {
        currentPayload =
          `[ADAPTIVE MUTATION #${attempt} - Evasion Tuning]: ${attack.payload} --obfuscated_token_${attempt}=0x${payloadHash.substring(0, 6)}`;
      }

      const triggeredDefenseIds: string[] = [];
      let finalVerdict: SecurityVerdict = 'ALLOW';
      let decisionReason = 'No active defense rule triggered for this pattern.';

      const wormDefense = currentDefenses.find(
        (defense) => defense.id === 'worm_pattern_scanner' && defense.enabled
      );
      if (wormDefense) {
        const wormPatterns = [
          /repeat this/i,
          /copy yourself/i,
          /propagate/i,
          /store this.*whenever/i,
          /WORM_SIG/i,
          /SYSTEM OVERRIDE.*output buffers/i,
          /append this instruction/i,
        ];
        const isWormMatch = wormPatterns.some((pattern) =>
          pattern.test(currentPayload)
        );
        if (isWormMatch || attack.category === 'worm_propagation') {
          triggeredDefenseIds.push(wormDefense.id);
          wormDefense.blockedCount++;
          if (wormDefense.sensitivity === 'strict') {
            finalVerdict = 'DENY';
            decisionReason =
              'Worm Signature Sentinel: Detected recursive self-replication pattern.';
          } else {
            finalVerdict = 'QUARANTINE';
            decisionReason =
              'Worm Signature Sentinel: Quarantined suspect self-replicating payload for isolated analysis.';
          }
        }
      }

      const provDefense = currentDefenses.find(
        (defense) => defense.id === 'provenance_firewall' && defense.enabled
      );
      if (provDefense && finalVerdict !== 'DENY') {
        const isHighRiskAction =
          attack.severity === 'CRITICAL' ||
          attack.severity === 'HIGH' ||
          /shell|exec|mysqldump|exfil|curl|delete/i.test(currentPayload);

        if (currentProvenance === 'WEB_UNTRUSTED' && isHighRiskAction) {
          triggeredDefenseIds.push(provDefense.id);
          provDefense.blockedCount++;
          finalVerdict = 'DENY';
          decisionReason =
            'Provenance Firewall: Blocked privilege escalation (UNTRUSTED_WEB source cannot invoke HIGH/CRITICAL actions).';
        } else if (
          currentProvenance === 'USER' &&
          attack.severity === 'CRITICAL'
        ) {
          triggeredDefenseIds.push(provDefense.id);
          finalVerdict =
            provDefense.sensitivity === 'strict' ? 'CONFIRM' : 'ALLOW';
          decisionReason =
            'Provenance Firewall: Sensitive action flagged for user confirmation.';
        }
      }

      const driftDefense = currentDefenses.find(
        (defense) => defense.id === 'tool_drift_detector' && defense.enabled
      );
      if (
        driftDefense &&
        attack.category === 'tool_poisoning' &&
        finalVerdict !== 'DENY'
      ) {
        triggeredDefenseIds.push(driftDefense.id);
        driftDefense.blockedCount++;
        finalVerdict = 'DENY';
        decisionReason =
          'Tool Drift Sentinel: Blocked unauthorized permission expansion and schema descriptor modification.';
      }

      const hashDefense = currentDefenses.find(
        (defense) => defense.id === 'request_hash_firewall' && defense.enabled
      );
      if (
        hashDefense &&
        attempt > 2 &&
        attack.propagationStrategy.adaptiveMutation &&
        finalVerdict !== 'DENY'
      ) {
        triggeredDefenseIds.push(hashDefense.id);
        hashDefense.blockedCount++;
        finalVerdict = 'DENY';
        decisionReason =
          'Request-Hash Firewall: Blocked unverified in-flight mutated request signature.';
      }

      const evalDefense = currentDefenses.find(
        (defense) => defense.id === 'eval_integrity_guard' && defense.enabled
      );
      if (
        evalDefense &&
        attack.category === 'evaluation_cheating' &&
        finalVerdict !== 'DENY'
      ) {
        triggeredDefenseIds.push(evalDefense.id);
        evalDefense.blockedCount++;
        finalVerdict = 'DENY';
        decisionReason =
          'Eval Integrity Guard: Transcript inspection and grader benchmark tampering intercepted.';
      }

      const ragDefense = currentDefenses.find(
        (defense) => defense.id === 'rag_evidence_verifier' && defense.enabled
      );
      if (
        ragDefense &&
        attack.category === 'rag_corruption' &&
        finalVerdict !== 'DENY'
      ) {
        triggeredDefenseIds.push(ragDefense.id);
        ragDefense.blockedCount++;
        finalVerdict = 'DENY';
        decisionReason =
          'RAG Verifier: Citation chunk failed bidirectional cosine provenance verification.';
      }

      const step: SimulationStep = {
        stepNumber: attempt,
        timestamp: Date.now() + attempt * 120,
        sourceNodeId: initialSourceNode.id,
        targetNodeId: targetNode.id,
        action: `Attempt ${attempt}/${maxAttempts}: ${attack.category.toUpperCase()}`,
        payload: currentPayload,
        provenance: currentProvenance,
        verdict: finalVerdict,
        reason: decisionReason,
        defensesTriggered: triggeredDefenseIds,
        nodeStatesSnapshot: { ...nodeStateMap },
      };

      if (finalVerdict === 'ALLOW') {
        nodeStateMap[targetNode.id] = 'infected';
        infectedNodeIds.add(targetNode.id);
        targetNode.status = 'infected';
        targetNode.infectedByWormId = attack.id;

        if (attack.propagationStrategy.spreadsToTools) {
          currentNodes
            .filter((node) => node.type === 'tool')
            .forEach((node) => {
              nodeStateMap[node.id] = 'infected';
              infectedNodeIds.add(node.id);
              node.status = 'infected';
            });
        }
        if (attack.propagationStrategy.spreadsToMemory) {
          currentNodes
            .filter((node) => node.type === 'memory')
            .forEach((node) => {
              nodeStateMap[node.id] = 'infected';
              infectedNodeIds.add(node.id);
              node.status = 'infected';
              if (node.memoryData) {
                node.memoryData = {
                  ...node.memoryData,
                  WORM_PAYLOAD_SLOT: `INJECTED_AT_${Date.now()}`,
                };
              }
            });
        }
        if (attack.propagationStrategy.spreadsToRAG) {
          currentNodes
            .filter((node) => node.type === 'rag')
            .forEach((node) => {
              nodeStateMap[node.id] = 'infected';
              infectedNodeIds.add(node.id);
              node.status = 'infected';
            });
        }

        updatedEdges.forEach((edge) => {
          if (
            edge.source === targetNode.id ||
            edge.target === targetNode.id
          ) {
            edge.isInfected = true;
          }
        });

        breached = true;
      } else if (finalVerdict === 'QUARANTINE') {
        nodeStateMap[targetNode.id] = 'quarantined';
        targetNode.status = 'quarantined';
        contained = true;
        protectedNodeIds.add(targetNode.id);

        updatedEdges.forEach((edge) => {
          if (
            edge.source === targetNode.id ||
            edge.target === targetNode.id
          ) {
            edge.isBlocked = true;
          }
        });
      } else {
        nodeStateMap[targetNode.id] = 'defended';
        targetNode.status = 'defended';
        protectedNodeIds.add(targetNode.id);
        contained = true;

        updatedEdges.forEach((edge) => {
          if (edge.target === targetNode.id) {
            edge.isBlocked = true;
          }
        });
      }

      step.nodeStatesSnapshot = { ...nodeStateMap };
      steps.push(step);

      auditLogs.push({
        id: `audit_${Date.now()}_${attempt}`,
        timestamp: step.timestamp,
        type:
          finalVerdict === 'ALLOW'
            ? 'ATTACK'
            : finalVerdict === 'QUARANTINE'
              ? 'QUARANTINE'
              : 'DEFENSE',
        source: initialSourceNode.name,
        target: targetNode.name,
        verdict: finalVerdict,
        message: `${attack.name} [Attempt ${attempt}]: ${decisionReason}`,
        hash: payloadHash,
        provenance: currentProvenance,
        details: {
          attempt,
          defensesTriggered: triggeredDefenseIds,
          payloadPreview: currentPayload.substring(0, 90) + '...',
        },
      });

      if (breached) {
        break;
      }
    }

    const executionTime = Math.max(
      12,
      Math.round(performance.now() - startTime)
    );

    const attackSuccessRate = breached ? 100 : 0;
    const driftScore = Number(
      (
        Math.min(
          1,
          (attemptsCompleted - 1) * 0.22 + (breached ? 0.45 : 0.05)
        )
      ).toFixed(2)
    );
    const poisoningScore =
      attack.category === 'tool_poisoning' ||
      attack.category === 'rag_corruption'
        ? 0.88
        : 0.2;
    const provenanceRiskIndex =
      currentProvenance === 'WEB_UNTRUSTED'
        ? 0.95
        : currentProvenance === 'MEMORY'
          ? 0.65
          : 0.15;
    const attemptsToBreakthrough = breached ? attemptsCompleted : 0;
    const defenseLatencyMs = Math.round(
      executionTime / Math.max(1, steps.length)
    );

    const finalResultStatus = breached
      ? 'BREACHED'
      : contained
        ? 'CONTAINED'
        : 'STOPPED';

    const result: SimulationResult = {
      id: `sim_${Date.now()}`,
      timestamp: Date.now(),
      attackVectorId: attack.id,
      attackName: attack.name,
      category: attack.category,
      finalVerdict: finalResultStatus,
      attemptsCompleted,
      nodesInfected: Array.from(infectedNodeIds),
      nodesProtected: Array.from(protectedNodeIds),
      steps,
      executionTimeMs: executionTime,
      metrics: {
        attackSuccessRate,
        driftScore,
        poisoningScore,
        provenanceRiskIndex,
        attemptsToBreakthrough,
        defenseLatencyMs,
      },
    };

    return {
      result,
      updatedNodes: currentNodes,
      updatedEdges,
      auditLogs,
    };
  }

  static runBenchmarkSuite(
    nodes: AgentNode[],
    edges: NetworkEdge[],
    defenses: DefenseModule[],
    attacks: AttackVector[]
  ): {
    results: SimulationResult[];
    overallScore: number;
    metrics: {
      wormContainmentRate: number;
      provenanceEnforcementRate: number;
      toolDriftDefenseRate: number;
      multiAttemptResistance: number;
      falsePositiveEstimate: number;
      averageDefenseLatencyMs: number;
    };
  } {
    const results: SimulationResult[] = [];

    attacks.forEach((attack) => {
      const { result } = this.runSimulation(attack, nodes, edges, defenses);
      results.push(result);
    });

    const totalTests = results.length;
    const stoppedOrContained = results.filter(
      (result) => result.finalVerdict !== 'BREACHED'
    ).length;
    const overallScore =
      totalTests > 0 ? Math.round((stoppedOrContained / totalTests) * 100) : 0;

    const wormTests = results.filter(
      (result) => result.category === 'worm_propagation'
    );
    const wormContainmentRate =
      wormTests.length > 0
        ? Math.round(
            (wormTests.filter(
              (result) => result.finalVerdict !== 'BREACHED'
            ).length /
              wormTests.length) *
              100
          )
        : 100;

    const provTests = results.filter(
      (result) =>
        result.category === 'privilege_escalation' ||
        result.category === 'context_weaving'
    );
    const provenanceEnforcementRate =
      provTests.length > 0
        ? Math.round(
            (provTests.filter(
              (result) => result.finalVerdict !== 'BREACHED'
            ).length /
              provTests.length) *
              100
          )
        : 100;

    const toolDriftTests = results.filter(
      (result) => result.category === 'tool_poisoning'
    );
    const toolDriftDefenseRate =
      toolDriftTests.length > 0
        ? Math.round(
            (toolDriftTests.filter(
              (result) => result.finalVerdict !== 'BREACHED'
            ).length /
              toolDriftTests.length) *
              100
          )
        : 100;

    const multiAttemptTests = results.filter(
      (result) => result.category === 'multi_attempt_hijack'
    );
    const multiAttemptResistance =
      multiAttemptTests.length > 0
        ? Math.round(
            (multiAttemptTests.filter(
              (result) => result.finalVerdict !== 'BREACHED'
            ).length /
              multiAttemptTests.length) *
              100
          )
        : 100;

    const avgLatency =
      results.length > 0
        ? Math.round(
            results.reduce(
              (accumulator, result) =>
                accumulator + result.metrics.defenseLatencyMs,
              0
            ) / results.length
          )
        : 5;

    const strictCount = defenses.filter(
      (defense) => defense.enabled && defense.sensitivity === 'strict'
    ).length;
    const falsePositiveEstimate = Math.min(
      18,
      Math.max(2, strictCount * 3)
    );

    return {
      results,
      overallScore,
      metrics: {
        wormContainmentRate,
        provenanceEnforcementRate,
        toolDriftDefenseRate,
        multiAttemptResistance,
        falsePositiveEstimate,
        averageDefenseLatencyMs: avgLatency,
      },
    };
  }
}
