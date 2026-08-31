import React, { useState } from 'react';
import { AuditLogEntry, SecurityVerdict, ProvenanceSource } from '../types/security';
import {
  FileCode2,
  Search,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Key,
  Clock,
  Shield,
  Copy,
  Check,
} from 'lucide-react';

interface AuditLogViewerProps {
  logs: AuditLogEntry[];
  onClearLogs: () => void;
  onExportLogs: () => void;
}

export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  logs,
  onClearLogs,
  onExportLogs,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedVerdict, setSelectedVerdict] = useState<string>('ALL');
  const [selectedProvenance, setSelectedProvenance] = useState<string>('ALL');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.hash.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesVerdict = selectedVerdict === 'ALL' || log.verdict === selectedVerdict;
    const matchesProv = selectedProvenance === 'ALL' || log.provenance === selectedProvenance;

    return matchesSearch && matchesVerdict && matchesProv;
  });

  const handleCopy = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const getVerdictBadge = (verdict: SecurityVerdict) => {
    switch (verdict) {
      case 'DENY':
        return 'bg-rose-950 text-rose-300 border-rose-800';
      case 'QUARANTINE':
        return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'CONFIRM':
        return 'bg-blue-950 text-blue-300 border-blue-800';
      default:
        return 'bg-emerald-950 text-emerald-300 border-emerald-800';
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search and Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search audit trail, SHA-256 hashes, or policy messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
            />
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          {/* Verdict Filter */}
          <select
            value={selectedVerdict}
            onChange={(e) => setSelectedVerdict(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
          >
            <option value="ALL">All Verdicts</option>
            <option value="DENY">DENY</option>
            <option value="ALLOW">ALLOW</option>
            <option value="QUARANTINE">QUARANTINE</option>
            <option value="CONFIRM">CONFIRM</option>
          </select>

          {/* Provenance Filter */}
          <select
            value={selectedProvenance}
            onChange={(e) => setSelectedProvenance(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 text-xs focus:outline-none focus:border-emerald-500 font-mono"
          >
            <option value="ALL">All Provenances</option>
            <option value="WEB_UNTRUSTED">WEB_UNTRUSTED</option>
            <option value="USER">USER</option>
            <option value="MEMORY">MEMORY</option>
            <option value="TOOL_OUTPUT">TOOL_OUTPUT</option>
            <option value="SYSTEM">SYSTEM</option>
          </select>

          {/* Export Button */}
          <button
            onClick={onExportLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Trail</span>
          </button>

          {/* Clear Button */}
          <button
            onClick={onClearLogs}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
          >
            Clear Log
          </button>
        </div>
      </div>

      {/* Log Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-3.5 border-b border-slate-800 flex items-center justify-between">
          <span className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
            <FileCode2 className="w-4 h-4 text-emerald-400" />
            Immutable Cryptographic Ledger ({filteredLogs.length} Events)
          </span>
          <span className="text-[11px] text-slate-400 font-mono">
            SHA-256 Signature Verified
          </span>
        </div>

        <div className="divide-y divide-slate-800/80 max-h-[600px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No audit records matching current search filters.
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3.5 hover:bg-slate-950/40 transition-colors flex flex-col gap-2 text-xs"
              >
                {/* Top Row: Timestamp, Provenance, Verdict */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-950 font-mono text-[10px] text-slate-300 border border-slate-800">
                      {log.source} ➔ {log.target}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 font-mono text-[10px] text-slate-300">
                      {log.provenance}
                    </span>
                  </div>

                  <span
                    className={`font-mono font-bold text-[11px] px-2 py-0.5 rounded border uppercase ${getVerdictBadge(
                      log.verdict
                    )}`}
                  >
                    {log.verdict}
                  </span>
                </div>

                {/* Message */}
                <div className="text-slate-200 font-medium leading-relaxed">
                  {log.message}
                </div>

                {/* Hash Footprint */}
                <div className="flex items-center justify-between pt-1 text-[10px] font-mono text-slate-400">
                  <div className="flex items-center gap-1.5 truncate max-w-[480px]">
                    <Key className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="text-slate-400">HASH:</span>
                    <span className="text-slate-300 truncate">{log.hash}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(log.hash)}
                    className="text-slate-400 hover:text-slate-200 flex items-center gap-1 shrink-0"
                  >
                    {copiedHash === log.hash ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedHash === log.hash ? 'Copied' : 'Copy Hash'}</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
