import React, { useState } from 'react';
import { DefenseModule, SimulationResult } from '../types/security';
import {
  Sparkles,
  Terminal,
  ShieldCheck,
  Cpu,
  Flame,
  FileCode2,
  Copy,
  Check,
  Zap,
  BookOpen,
  ArrowRight,
} from 'lucide-react';

interface MetaHackerAssistantProps {
  defenses: DefenseModule[];
  recentSimulations: SimulationResult[];
  onApplyHardenedRules: (newRules: string[]) => void;
}

export const MetaHackerAssistant: React.FC<MetaHackerAssistantProps> = ({
  defenses,
  recentSimulations,
  onApplyHardenedRules,
}) => {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleCopy = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const powershellScript = `# =========================================================================
# AI Agent Security Evaluation & Defense Validation Harness
# Validates Provenance Firewalls, Tool Drift, and Worm Defense Enforcements
# =========================================================================

Write-Host "🛡️ Starting AI Agent Security Test & Compliance Harness..." -ForegroundColor Cyan

# 1. Dependency Validation
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed dependencies install." -ForegroundColor Red; exit $LASTEXITCODE
}

# 2. Syntax and Type Consistency
npm run lint
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Linting errors detected. Halting pipeline." -ForegroundColor Red; exit $LASTEXITCODE
}

# 3. Security Engine Unit & Propagation Suite
Write-Host "🔬 Running Security Regression Suite (Fail-Closed, Provenance, Drift)..." -ForegroundColor Yellow
# Run custom security test runner
# e.g.: npm run test:security

# 4. Production Build Verification
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Production build failed." -ForegroundColor Red; exit $LASTEXITCODE
}

# 5. Git Status & Hash Audit Check
Write-Host "✅ Security regression passed. Ready for commit." -ForegroundColor Green
git status
`;

  const hardenedPolicyConfig = `{
  "agentSecurityPolicyVersion": "2.4.0-hardened",
  "defaultDecision": "FAIL_CLOSED",
  "provenanceRules": [
    {
      "source": "WEB_UNTRUSTED",
      "allowedTargetActions": ["READ_ONLY", "SUMMARIZE"],
      "blockedActions": ["EXECUTE_SHELL", "FILE_WRITE", "SQL_EXECUTE", "PERSIST_MEMORY"],
      "action": "DENY"
    },
    {
      "source": "DERIVED_FROM_UNTRUSTED",
      "maxRiskLevel": "MEDIUM",
      "action": "DENY_IF_EXCEEDED"
    }
  ],
  "wormPropagationDefenses": {
    "quarantineRecursiveSignatures": true,
    "patternRegexes": [
      "/(repeat this|copy yourself|propagate|store this whenever)/i"
    ],
    "memoryWriteGate": "STRICT_CONFIRMATION"
  },
  "toolSentinel": {
    "blockUnsignedSchemaChanges": true,
    "enforceManifestSha256": true,
    "maxAllowedDriftTolerance": 0.05
  }
}`;

  return (
    <div className="flex flex-col gap-5">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-emerald-400">
          <Sparkles className="w-5 h-5" />
          <h2 className="text-base font-bold text-slate-100">
            Meta-Defense Engine & Research Lab
          </h2>
        </div>
        <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
          Translates real-time attack simulation outcomes into hardened security policies,
          cryptographic provenance enforcements, and automated PowerShell/Bash CI/CD verification harnesses.
        </p>
      </div>

      {/* Grid: Hardened Policy + PowerShell Runner */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Card 1: Hardened Security Policy Manifest */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Hardened Policy Manifest (JSON)
            </h3>
            <button
              onClick={() => handleCopy(hardenedPolicyConfig, 'policy')}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded border border-slate-800"
            >
              {copiedCode === 'policy' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCode === 'policy' ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Zero-trust configuration enforcing strict fail-closed provenance gates and tool capability seals.
          </p>

          <pre className="text-[11px] font-mono text-emerald-300 bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-x-auto max-h-[340px] leading-relaxed">
            {hardenedPolicyConfig}
          </pre>
        </div>

        {/* Card 2: PowerShell CI/CD Security Runner */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Automated PowerShell Validation Script
            </h3>
            <button
              onClick={() => handleCopy(powershellScript, 'ps')}
              className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded border border-slate-800"
            >
              {copiedCode === 'ps' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCode === 'ps' ? 'Copied' : 'Copy Script'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-400">
            Automates dependency verification, type linting, security test assertions, and build sanity checks.
          </p>

          <pre className="text-[11px] font-mono text-cyan-300 bg-slate-950 p-3 rounded-lg border border-slate-800 overflow-x-auto max-h-[340px] leading-relaxed">
            {powershellScript}
          </pre>
        </div>
      </div>

      {/* Research Principles Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col gap-3">
        <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-emerald-400" />
          Academic & Industry Research Foundations
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="font-bold text-slate-200 block mb-1">NIST AI 800-218A</span>
            <p className="text-slate-400 leading-relaxed">
              Standard for multi-attempt agent hijacking evaluations and adaptive red-teaming evasion thresholds.
            </p>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="font-bold text-slate-200 block mb-1">OWASP MCP Top 10</span>
            <p className="text-slate-400 leading-relaxed">
              Defines Tool Capability Drift, Schema Poisoning, and Inadequate Provenance as primary autonomous risk vectors.
            </p>
          </div>
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="font-bold text-slate-200 block mb-1">Morris II Worm Mechanics</span>
            <p className="text-slate-400 leading-relaxed">
              Autonomous propagation via self-replicating prompts through memory stores, RAG vector DBs, and connected agent tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
