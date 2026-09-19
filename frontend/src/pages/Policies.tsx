import { useEffect, useState } from 'react';
import { getPolicies, updatePolicies } from '../api/client';
import type { Policies as PolicyType } from '../types';
import { Save } from 'lucide-react';

export default function Policies() {
  const [policies, setPolicies] = useState<PolicyType | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPolicies().then(setPolicies);
  }, []);

  const handleSave = async () => {
    if (!policies) return;
    setSaving(true);
    try {
      await updatePolicies(policies);
      alert('Policies saved successfully');
    } catch (err) {
      alert('Failed to save policies');
    }
    setSaving(false);
  };

  const updateList = (key: keyof PolicyType, value: string) => {
    if (!policies) return;
    const array = value.split('\n').map(s => s.trim()).filter(s => s !== '');
    setPolicies({ ...policies, [key]: array });
  };

  if (!policies) return <div className="font-mono text-accent animate-pulse tracking-widest text-sm uppercase">Loading policies...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-mono text-text-muted tracking-[0.2em] mb-1 uppercase">Rule Engine</p>
          <h2 className="text-3xl font-heading font-bold uppercase tracking-wide">Security Policies</h2>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-accent text-black font-heading uppercase tracking-widest px-6 py-2 border border-accent flex items-center gap-2 transition-all hover:bg-accent/90 hover:shadow-[0_0_15px_var(--color-accent-glow)] disabled:opacity-50 disabled:shadow-none"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Policies'}
        </button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-card p-6 border border-border-subtle relative overflow-hidden group hover:border-allowed hover:shadow-[0_0_15px_rgba(34,197,94,0.1)] transition-all">
          <div className="absolute top-0 left-0 w-1 h-full bg-allowed"></div>
          <h3 className="text-xl font-heading uppercase tracking-wide text-allowed mb-2">Allowed Tools</h3>
          <p className="text-xs font-mono text-text-muted tracking-widest uppercase mb-4">Tools that are always permitted.</p>
          <textarea
            className="w-full h-48 bg-background border border-border-subtle p-4 text-sm font-mono text-text-primary focus:border-allowed focus:ring-1 focus:ring-allowed focus:outline-none transition-all custom-scrollbar"
            value={policies.allowed_tools.join('\n')}
            onChange={(e) => updateList('allowed_tools', e.target.value)}
            placeholder="e.g., list_files"
          />
        </div>

        <div className="bg-card p-6 border border-border-subtle relative overflow-hidden group hover:border-blocked hover:shadow-[0_0_15px_rgba(239,68,68,0.1)] transition-all">
          <div className="absolute top-0 left-0 w-1 h-full bg-blocked"></div>
          <h3 className="text-xl font-heading uppercase tracking-wide text-blocked mb-2">Blocked Tools</h3>
          <p className="text-xs font-mono text-text-muted tracking-widest uppercase mb-4">Tools that will be instantly rejected.</p>
          <textarea
            className="w-full h-48 bg-background border border-border-subtle p-4 text-sm font-mono text-text-primary focus:border-blocked focus:ring-1 focus:ring-blocked focus:outline-none transition-all custom-scrollbar"
            value={policies.blocked_tools.join('\n')}
            onChange={(e) => updateList('blocked_tools', e.target.value)}
            placeholder="e.g., delete_note"
          />
        </div>

        <div className="bg-card p-6 border border-border-subtle relative overflow-hidden group hover:border-warning hover:shadow-[0_0_15px_rgba(234,179,8,0.1)] transition-all">
          <div className="absolute top-0 left-0 w-1 h-full bg-warning"></div>
          <h3 className="text-xl font-heading uppercase tracking-wide text-warning mb-2">Warning Tools</h3>
          <p className="text-xs font-mono text-text-muted tracking-widest uppercase mb-4">Tools that are allowed but flagged.</p>
          <textarea
            className="w-full h-48 bg-background border border-border-subtle p-4 text-sm font-mono text-text-primary focus:border-warning focus:ring-1 focus:ring-warning focus:outline-none transition-all custom-scrollbar"
            value={policies.warning_tools.join('\n')}
            onChange={(e) => updateList('warning_tools', e.target.value)}
            placeholder="e.g., create_note"
          />
        </div>

        <div className="bg-card p-6 border border-border-subtle relative overflow-hidden group hover:border-accent hover:shadow-[0_0_15px_var(--color-accent-glow)] transition-all">
          <div className="absolute top-0 left-0 w-1 h-full bg-accent"></div>
          <h3 className="text-xl font-heading uppercase tracking-wide text-accent mb-2">Restricted Paths</h3>
          <p className="text-xs font-mono text-text-muted tracking-widest uppercase mb-4">File paths that block any tool accessing them.</p>
          <textarea
            className="w-full h-48 bg-background border border-border-subtle p-4 text-sm font-mono text-text-primary focus:border-accent focus:ring-1 focus:ring-accent focus:outline-none transition-all custom-scrollbar"
            value={policies.restricted_paths.join('\n')}
            onChange={(e) => updateList('restricted_paths', e.target.value)}
            placeholder="e.g., .obsidian/"
          />
        </div>
      </div>
    </div>
  );
}
