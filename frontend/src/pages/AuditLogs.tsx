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
    <div className="bg-card rounded-xl border border-gray-800 p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Audit Logs</h2>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="bg-background border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-accent"
        >
          <option value="All">All Events</option>
          <option value="Allow">Allowed</option>
          <option value="Block">Blocked</option>
          <option value="Warning">Warnings</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="text-gray-400 border-b border-gray-800 bg-card">
            <tr>
              <th className="pb-3 px-4">Timestamp</th>
              <th className="pb-3 px-4">Tool Name</th>
              <th className="pb-3 px-4">Risk Level</th>
              <th className="pb-3 px-4">Decision</th>
              <th className="pb-3 px-4">Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filteredLogs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-800/50">
                <td className="py-4 px-4 text-gray-300">{new Date(log.timestamp).toLocaleString()}</td>
                <td className="py-4 px-4 font-mono text-blue-400">{log.tool_name}</td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 rounded text-xs border ${
                    log.risk_level === 'Critical' ? 'border-red-500 text-red-500' :
                    log.risk_level === 'High' ? 'border-orange-500 text-orange-500' :
                    log.risk_level === 'Medium' ? 'border-yellow-500 text-yellow-500' :
                    'border-green-500 text-green-500'
                  }`}>
                    {log.risk_level}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    log.decision === 'Allow' ? 'bg-allowed/20 text-allowed' :
                    log.decision === 'Block' ? 'bg-blocked/20 text-blocked' :
                    'bg-warning/20 text-warning'
                  }`}>
                    {log.decision}
                  </span>
                </td>
                <td className="py-4 px-4 text-gray-400 text-xs truncate max-w-xs" title={log.reason}>
                  {log.reason}
                </td>
              </tr>
            ))}
            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">No logs found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
