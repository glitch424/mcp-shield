import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import AuditLogs from './pages/AuditLogs';
import Policies from './pages/Policies';
import { Shield, Activity, FileText, Settings } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen flex text-text-primary selection:bg-accent selection:text-black">
      {/* Sidebar */}
      <div className="w-64 bg-background/80 backdrop-blur-md border-r border-border-subtle flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.4)]">
        <div className="p-6 flex items-center gap-3 border-b border-border-subtle">
          <Shield className="w-8 h-8 text-accent drop-shadow-[0_0_8px_var(--color-accent-glow)]" />
          <h1 className="text-2xl font-heading font-bold tracking-widest uppercase mt-1">MCP Shield</h1>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1">
          <p className="px-4 text-xs font-mono text-text-muted tracking-[0.2em] mb-4 uppercase">System Menu</p>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-300 font-mono text-sm ${activeTab === 'dashboard' ? 'bg-accent/10 text-accent border-l-2 border-accent shadow-[inset_4px_0_12px_var(--color-accent-glow)]' : 'hover:bg-card text-text-muted hover:text-text-primary border-l-2 border-transparent'}`}
          >
            <Activity className="w-4 h-4" />
            Dashboard
          </button>
          
          <button 
            onClick={() => setActiveTab('logs')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-300 font-mono text-sm ${activeTab === 'logs' ? 'bg-accent/10 text-accent border-l-2 border-accent shadow-[inset_4px_0_12px_var(--color-accent-glow)]' : 'hover:bg-card text-text-muted hover:text-text-primary border-l-2 border-transparent'}`}
          >
            <FileText className="w-4 h-4" />
            Audit Logs
          </button>
          
          <button 
            onClick={() => setActiveTab('policies')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-300 font-mono text-sm ${activeTab === 'policies' ? 'bg-accent/10 text-accent border-l-2 border-accent shadow-[inset_4px_0_12px_var(--color-accent-glow)]' : 'hover:bg-card text-text-muted hover:text-text-primary border-l-2 border-transparent'}`}
          >
            <Settings className="w-4 h-4" />
            Policies
          </button>
        </nav>
        
        {/* Status Indicator */}
        <div className="p-4 border-t border-border-subtle flex items-center gap-3 font-mono text-xs text-text-muted">
           <div className="status-dot"></div>
           <span className="tracking-widest uppercase">System Online</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 h-screen overflow-auto relative z-0">
        <div className="p-8 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'logs' && <AuditLogs />}
          {activeTab === 'policies' && <Policies />}
        </div>
      </div>
    </div>
  );
}

export default App;
