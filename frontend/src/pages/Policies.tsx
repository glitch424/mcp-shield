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

  if (!policies) return <div>Loading policies...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Security Policies</h2>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-accent hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Policies'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card p-6 rounded-xl border border-gray-800">
          <h3 className="text-lg font-bold text-allowed mb-2">Allowed Tools</h3>
          <p className="text-sm text-gray-400 mb-4">Tools that are always permitted.</p>
          <textarea
            className="w-full h-48 bg-background border border-gray-700 rounded-lg p-3 text-sm font-mono focus:border-accent focus:outline-none"
            value={policies.allowed_tools.join('\n')}
            onChange={(e) => updateList('allowed_tools', e.target.value)}
            placeholder="e.g., list_files"
          />
        </div>

        <div className="bg-card p-6 rounded-xl border border-gray-800">
          <h3 className="text-lg font-bold text-blocked mb-2">Blocked Tools</h3>
          <p className="text-sm text-gray-400 mb-4">Tools that will be instantly rejected.</p>
          <textarea
            className="w-full h-48 bg-background border border-gray-700 rounded-lg p-3 text-sm font-mono focus:border-accent focus:outline-none"
            value={policies.blocked_tools.join('\n')}
            onChange={(e) => updateList('blocked_tools', e.target.value)}
            placeholder="e.g., delete_note"
          />
        </div>

        <div className="bg-card p-6 rounded-xl border border-gray-800">
          <h3 className="text-lg font-bold text-warning mb-2">Warning Tools</h3>
          <p className="text-sm text-gray-400 mb-4">Tools that are allowed but flagged for review.</p>
          <textarea
            className="w-full h-48 bg-background border border-gray-700 rounded-lg p-3 text-sm font-mono focus:border-accent focus:outline-none"
            value={policies.warning_tools.join('\n')}
            onChange={(e) => updateList('warning_tools', e.target.value)}
            placeholder="e.g., create_note"
          />
        </div>

        <div className="bg-card p-6 rounded-xl border border-gray-800">
          <h3 className="text-lg font-bold text-blue-400 mb-2">Restricted Paths</h3>
          <p className="text-sm text-gray-400 mb-4">File paths that block any tool accessing them.</p>
          <textarea
            className="w-full h-48 bg-background border border-gray-700 rounded-lg p-3 text-sm font-mono focus:border-accent focus:outline-none"
            value={policies.restricted_paths.join('\n')}
            onChange={(e) => updateList('restricted_paths', e.target.value)}
            placeholder="e.g., .obsidian/"
          />
        </div>
      </div>
    </div>
  );
}
