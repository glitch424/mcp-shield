import { useEffect, useState } from 'react';
import { getMetrics, getLogs } from '../api/client';
import type { Metrics, AuditLog } from '../types';
import { ShieldCheck, ShieldAlert, AlertTriangle, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [logs, setLogs] = useState<AuditLog[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [m, l] = await Promise.all([getMetrics(), getLogs()]);
        setMetrics(m);
        setLogs(l.slice(0, 10)); // Just 10 recent
      } catch (err) {
        console.error("Failed to load dashboard data");
      }
    };
    
    // Initial fetch
    fetchData();
    
    // Listen for live updates via SSE
    const eventSource = new EventSource('http://localhost:8000/logs/live');
    eventSource.onmessage = (_event) => {
        // A new log arrived
        fetchData();
    };

    return () => {
        eventSource.close();
    };
  }, []);

  if (!metrics) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-6">Security Overview</h2>
      
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-card p-6 rounded-xl border border-gray-800 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-400 font-medium">Security Score</h3>
            <ShieldCheck className={`w-6 h-6 ${metrics.security_score > 80 ? 'text-allowed' : 'text-warning'}`} />
          </div>
          <p className="text-4xl font-bold">{metrics.security_score}</p>
        </div>
        
        <div className="bg-card p-6 rounded-xl border border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-400 font-medium">Total Requests</h3>
            <Activity className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-4xl font-bold">{metrics.total_requests}</p>
        </div>

        <div className="bg-card p-6 rounded-xl border border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-400 font-medium">Blocked</h3>
            <ShieldAlert className="w-6 h-6 text-blocked" />
          </div>
          <p className="text-4xl font-bold text-blocked">{metrics.blocked}</p>
        </div>

        <div className="bg-card p-6 rounded-xl border border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-gray-400 font-medium">Warnings</h3>
            <AlertTriangle className="w-6 h-6 text-warning" />
          </div>
          <p className="text-4xl font-bold text-warning">{metrics.warnings}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Chart */}
        <div className="bg-card p-6 rounded-xl border border-gray-800 h-96">
          <h3 className="text-lg font-bold mb-4">Activity Timeline</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={logs.slice().reverse()}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="timestamp" stroke="#9CA3AF" tick={{fontSize: 12}} tickFormatter={(val) => new Date(val).toLocaleTimeString()} />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{backgroundColor: '#111827', borderColor: '#374151'}} />
              <Line type="monotone" dataKey="id" stroke="#F97316" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Activity */}
        <div className="bg-card p-6 rounded-xl border border-gray-800 overflow-hidden flex flex-col">
          <h3 className="text-lg font-bold mb-4">Recent Interceptions</h3>
          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left text-sm">
              <thead className="text-gray-400 border-b border-gray-800 sticky top-0 bg-card">
                <tr>
                  <th className="pb-3">Tool</th>
                  <th className="pb-3">Decision</th>
                  <th className="pb-3">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-800/50">
                    <td className="py-3 font-mono">{log.tool_name}</td>
                    <td className="py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        log.decision === 'Allow' ? 'bg-allowed/20 text-allowed' :
                        log.decision === 'Block' ? 'bg-blocked/20 text-blocked' :
                        'bg-warning/20 text-warning'
                      }`}>
                        {log.decision}
                      </span>
                    </td>
                    <td className="py-3">{log.risk_level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
