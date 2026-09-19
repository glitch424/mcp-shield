import { useEffect, useState } from 'react';
import { getMetrics, getLogs } from '../api/client';
import type { Metrics, AuditLog } from '../types';
import { ShieldCheck, ShieldAlert, AlertTriangle, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import IsometricGrid from '../components/IsometricGrid';

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
    
    fetchData();
    
    const eventSource = new EventSource('http://localhost:8000/logs/live');
    eventSource.onmessage = (_event) => {
        fetchData();
    };

    return () => {
        eventSource.close();
    };
  }, []);

  if (!metrics) return <div className="font-mono text-accent animate-pulse tracking-widest text-sm uppercase">Loading sequence initiated...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 relative">
      <IsometricGrid />
      
      <header className="flex items-center justify-between mb-8 relative z-10 py-12 pointer-events-none">
        <div>
          <p className="text-xs font-mono text-accent tracking-[0.2em] mb-1 uppercase drop-shadow-[0_0_5px_var(--color-accent-glow)]">Overview</p>
          <h2 className="text-5xl font-heading font-bold uppercase tracking-wide">Security Console</h2>
        </div>
        <div className="flex items-center gap-3 bg-card px-4 py-2 border border-border-subtle shadow-sm pointer-events-auto backdrop-blur-md">
          <div className="status-dot"></div>
          <span className="font-mono text-xs text-accent uppercase tracking-widest">Live Monitoring</span>
        </div>
      </header>
      
      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
        <div className="bg-card backdrop-blur-md p-6 border border-border-subtle flex flex-col relative group hover:border-accent hover:shadow-[0_0_15px_var(--color-accent-glow)] transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-allowed to-transparent opacity-50"></div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-text-muted font-mono text-xs tracking-widest uppercase">Security Score</h3>
            <ShieldCheck className={`w-5 h-5 ${metrics.security_score > 80 ? 'text-allowed drop-shadow-[0_0_5px_var(--color-allowed)]' : 'text-warning drop-shadow-[0_0_5px_var(--color-warning)]'}`} />
          </div>
          <p className="text-5xl font-mono font-bold text-text-primary tracking-tighter">{metrics.security_score}</p>
        </div>
        
        <div className="bg-card backdrop-blur-md p-6 border border-border-subtle relative group hover:border-accent hover:shadow-[0_0_15px_var(--color-accent-glow)] transition-all duration-300">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-text-muted font-mono text-xs tracking-widest uppercase">Total Requests</h3>
            <Activity className="w-5 h-5 text-accent drop-shadow-[0_0_5px_var(--color-accent)]" />
          </div>
          <p className="text-5xl font-mono font-bold text-text-primary tracking-tighter">{metrics.total_requests}</p>
        </div>

        <div className="bg-card backdrop-blur-md p-6 border border-border-subtle relative group hover:border-blocked hover:shadow-[0_0_15px_rgba(239,68,68,0.2)] transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blocked to-transparent opacity-50"></div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-text-muted font-mono text-xs tracking-widest uppercase">Blocked</h3>
            <ShieldAlert className="w-5 h-5 text-blocked drop-shadow-[0_0_5px_var(--color-blocked)]" />
          </div>
          <p className="text-5xl font-mono font-bold text-blocked tracking-tighter">{metrics.blocked}</p>
        </div>

        <div className="bg-card backdrop-blur-md p-6 border border-border-subtle relative group hover:border-warning hover:shadow-[0_0_15px_rgba(234,179,8,0.2)] transition-all duration-300 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-warning to-transparent opacity-50"></div>
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-text-muted font-mono text-xs tracking-widest uppercase">Warnings</h3>
            <AlertTriangle className="w-5 h-5 text-warning drop-shadow-[0_0_5px_var(--color-warning)]" />
          </div>
          <p className="text-5xl font-mono font-bold text-warning tracking-tighter">{metrics.warnings}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8 relative z-10">
        {/* Chart */}
        <div className="bg-card backdrop-blur-md p-6 border border-border-subtle h-[420px] flex flex-col">
          <p className="text-xs font-mono text-text-muted tracking-[0.2em] mb-2 uppercase">Telemetry</p>
          <h3 className="text-xl font-heading uppercase tracking-wide mb-6">Activity Timeline</h3>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={logs.slice().reverse()}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
                <XAxis dataKey="timestamp" stroke="var(--color-text-muted)" tick={{fontSize: 10, fontFamily: 'monospace'}} tickFormatter={(val) => new Date(val).toLocaleTimeString()} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="var(--color-text-muted)" tick={{fontSize: 10, fontFamily: 'monospace'}} tickLine={false} axisLine={false} dx={-10} />
                <Tooltip contentStyle={{backgroundColor: 'var(--color-card)', borderColor: 'var(--color-accent)', fontFamily: 'monospace', fontSize: '12px', color: 'var(--color-text-primary)'}} itemStyle={{color: 'var(--color-accent)'}} cursor={{stroke: 'var(--color-border-subtle)', strokeWidth: 1}} />
                <Line type="stepAfter" dataKey="id" stroke="var(--color-accent)" strokeWidth={2} dot={false} activeDot={{r: 4, fill: 'var(--color-accent)', stroke: '#000', strokeWidth: 2}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card backdrop-blur-md p-6 border border-border-subtle flex flex-col h-[420px]">
          <p className="text-xs font-mono text-text-muted tracking-[0.2em] mb-2 uppercase">Traffic Log</p>
          <h3 className="text-xl font-heading uppercase tracking-wide mb-6">Recent Interceptions</h3>
          <div className="overflow-y-auto flex-1 pr-2 custom-scrollbar">
            <table className="w-full text-left text-sm font-mono">
              <thead className="text-text-muted sticky top-0 bg-card backdrop-blur-md z-10 text-xs tracking-widest uppercase">
                <tr>
                  <th className="pb-4 font-normal">Tool / Origin</th>
                  <th className="pb-4 font-normal text-center">Status</th>
                  <th className="pb-4 font-normal text-right">Risk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {logs.map((log) => (
                  <tr key={log.id} className="group hover:bg-white/5 transition-colors">
                    <td className="py-4 text-text-primary pr-4 truncate max-w-[200px]">{log.tool_name}</td>
                    <td className="py-4 text-center">
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
                    <td className="py-4 text-right text-text-muted">{log.risk_level}</td>
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
