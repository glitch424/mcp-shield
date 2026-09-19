import { useEffect, useState } from 'react';
import { getLogs } from '../api/client';
import type { AuditLog } from '../types';

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    getLogs().then(setLogs);
  }, []);

  const filteredLogs = logs.filter(log => filter === 'All' || log.decision === filter);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-mono text-text-muted tracking-[0.2em] mb-1 uppercase">System Records</p>
          <h2 className="text-3xl font-heading font-bold uppercase tracking-wide">Audit Logs</h2>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="bg-background border border-border-subtle text-text-primary rounded-md px-4 py-2 font-mono text-sm focus:outline-none focus:border-accent focus:shadow-[0_0_10px_var(--color-accent-glow)] transition-all"
          >
            <option value="All">All Events</option>
            <option value="Allow">Allowed</option>
            <option value="Block">Blocked</option>
            <option value="Warning">Warnings</option>
          </select>
        </div>
      </header>

      <div className="bg-card border border-border-subtle overflow-hidden relative shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent to-transparent opacity-30"></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-mono">
            <thead className="text-text-muted border-b border-border-subtle bg-card text-xs tracking-widest uppercase">
              <tr>
                <th className="pb-4 pt-6 px-6 font-normal">Timestamp</th>
                <th className="pb-4 pt-6 px-6 font-normal">Tool / Origin</th>
                <th className="pb-4 pt-6 px-6 font-normal text-center">Risk</th>
                <th className="pb-4 pt-6 px-6 font-normal text-center">Status</th>
                <th className="pb-4 pt-6 px-6 font-normal">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="group hover:bg-white/5 transition-colors">
                  <td className="py-5 px-6 text-text-muted text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="py-5 px-6 text-text-primary font-mono">{log.tool_name}</td>
                  <td className="py-5 px-6 text-center">
                    <span className={`inline-flex items-center px-2 py-1 border text-[10px] tracking-widest uppercase ${
                      log.risk_level === 'Critical' ? 'border-blocked/50 text-blocked bg-blocked/5' :
                      log.risk_level === 'High' ? 'border-warning/50 text-warning bg-warning/5' :
                      log.risk_level === 'Medium' ? 'border-warning/30 text-warning bg-warning/5' :
                      'border-allowed/30 text-allowed bg-allowed/5'
                    }`}>
                      {log.risk_level}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-center">
                    <span className={`inline-flex items-center gap-2 px-2 py-1 border text-[10px] tracking-widest uppercase ${
                      log.decision === 'Allow' ? 'border-allowed/30 text-allowed bg-allowed/5' :
                      log.decision === 'Block' ? 'border-blocked/30 text-blocked bg-blocked/5' :
                      'border-warning/30 text-warning bg-warning/5'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        log.decision === 'Allow' ? 'bg-allowed' :
                        log.decision === 'Block' ? 'bg-blocked' :
                        'bg-warning'
                      }`}></span>
                      {log.decision}
                    </span>
                  </td>
                  <td className="py-5 px-6 text-text-muted text-xs truncate max-w-xs" title={log.reason}>
                    {log.reason}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-text-muted font-mono text-sm tracking-widest uppercase">No telemetry data matching filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
