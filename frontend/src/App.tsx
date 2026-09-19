import { useState } from 'react';
import Dashboard from './pages/Dashboard';
import AuditLogs from './pages/AuditLogs';
import Policies from './pages/Policies';
import { Shield, Activity, FileText, Settings } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-background text-white flex">
      {/* Sidebar */}
      <div className="w-64 bg-card border-r border-gray-800 flex flex-col">
        <div className="p-6 flex items-center gap-3 border-b border-gray-800">
          <Shield className="w-8 h-8 text-accent" />
          <h1 className="text-xl font-bold tracking-wider">MCP SHIELD</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'dashboard' ? 'bg-accent/10 text-accent' : 'hover:bg-gray-800 text-gray-400'}`}
          >
            <Activity className="w-5 h-5" />
            Dashboard
          </button>
          
          <button 
            onClick={() => setActiveTab('logs')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'logs' ? 'bg-accent/10 text-accent' : 'hover:bg-gray-800 text-gray-400'}`}
          >
            <FileText className="w-5 h-5" />
            Audit Logs
          </button>
          
          <button 
            onClick={() => setActiveTab('policies')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'policies' ? 'bg-accent/10 text-accent' : 'hover:bg-gray-800 text-gray-400'}`}
          >
            <Settings className="w-5 h-5" />
            Policies
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-8">
          {activeTab === 'dashboard' && <Dashboard />}
          {activeTab === 'logs' && <AuditLogs />}
          {activeTab === 'policies' && <Policies />}
        </div>
      </div>
    </div>
  );
}

export default App;
