'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { PersonaPatcher } from '@/lib/services/persona-patcher';

interface PersonaPatch {
  id: string;
  persona_id: string;
  suggested_logic: string;
  status: string;
  patch_type: string;
  evidence_count: number;
  created_at: string;
  personas?: {
    name: string;
    system_prompt: string;
    version: number;
  };
}

export default function ForgePage() {
  const [patches, setPatches] = useState<PersonaPatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatch, setSelectedPatch] = useState<PersonaPatch | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadPatches();
  }, []);

  async function loadPatches() {
    const { data, error } = await supabase
      .from('persona_patches')
      .select('*, personas(name, system_prompt, version)')
      .eq('status', 'pending_review')
      .order('created_at', { ascending: false });

    if (data) setPatches(data);
    setLoading(false);
  }

  async function handleApprove(patchId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const patcher = new PersonaPatcher();
      await patcher.applyPatch(patchId, user.id);
      alert('Patch applied successfully!');
      loadPatches();
      setSelectedPatch(null);
    } catch (error) {
      alert(`Error applying patch: ${error}`);
    }
  }

  async function handleReject(patchId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    try {
      const patcher = new PersonaPatcher();
      await patcher.rejectPatch(patchId, user.id);
      alert('Patch rejected');
      loadPatches();
      setSelectedPatch(null);
    } catch (error) {
      alert(`Error rejecting patch: ${error}`);
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-indigo-400">The Forge</h1>
          <p className="text-slate-400 mt-2">AI Persona Patching Engine - Human-Driven Learning</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-2xl font-bold text-amber-500">{patches.length}</p>
            <p className="text-sm text-slate-400">Pending Review</p>
          </div>
          <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-2xl font-bold text-emerald-500">
              {patches.filter(p => p.patch_type === 'consensus').length}
            </p>
            <p className="text-sm text-slate-400">Consensus Patches</p>
          </div>
          <div className="p-4 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-2xl font-bold text-indigo-500">
              {patches.filter(p => p.patch_type === 'individual').length}
            </p>
            <p className="text-sm text-slate-400">Individual Patches</p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-slate-400 mt-4">Loading patches...</p>
          </div>
        ) : patches.length === 0 ? (
          <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-slate-400 text-lg">No patches pending review</p>
            <p className="text-slate-500 text-sm mt-2">Patches will appear here when humans struggle with UI elements</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Pending Patches</h2>
              {patches.map((patch) => (
                <div
                  key={patch.id}
                  onClick={() => setSelectedPatch(patch)}
                  className={`p-4 rounded-lg border cursor-pointer transition-all ${
                    selectedPatch?.id === patch.id
                      ? 'bg-indigo-900/30 border-indigo-600'
                      : 'bg-slate-800 border-slate-700 hover:border-indigo-700'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-white">{patch.personas?.name || 'Unknown Persona'}</h3>
                      <p className="text-xs text-slate-500">v{patch.personas?.version || 0}</p>
                    </div>
                    <div className="flex gap-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          patch.patch_type === 'consensus'
                            ? 'bg-emerald-900/30 border border-emerald-700 text-emerald-400'
                            : 'bg-indigo-900/30 border border-indigo-700 text-indigo-400'
                        }`}
                      >
                        {patch.patch_type}
                      </span>
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-slate-700 text-slate-300">
                        {patch.evidence_count} evidence
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-slate-300 line-clamp-2">{patch.suggested_logic}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {new Date(patch.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>

            <div className="space-y-4">
              {selectedPatch ? (
                <>
                  <h2 className="text-xl font-bold text-white">Patch Review</h2>
                  <div className="p-6 bg-slate-800 rounded-lg border border-slate-700 space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-indigo-400 mb-2">
                        {selectedPatch.personas?.name || 'Unknown Persona'}
                      </h3>
                      <p className="text-sm text-slate-400">
                        Version {selectedPatch.personas?.version || 0} • {selectedPatch.patch_type} patch • {selectedPatch.evidence_count} evidence
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-400 mb-2">Current System Prompt</h4>
                      <div className="p-4 bg-slate-900 rounded border border-slate-700 max-h-40 overflow-y-auto">
                        <p className="text-sm text-slate-300 font-mono whitespace-pre-wrap">
                          {selectedPatch.personas?.system_prompt || 'No prompt available'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-emerald-400 mb-2">Suggested Patch</h4>
                      <div className="p-4 bg-emerald-900/10 rounded border border-emerald-700">
                        <p className="text-sm text-emerald-300 font-mono whitespace-pre-wrap">
                          {selectedPatch.suggested_logic}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button
                        onClick={() => handleApprove(selectedPatch.id)}
                        className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors"
                      >
                        ✓ Approve & Apply
                      </button>
                      <button
                        onClick={() => handleReject(selectedPatch.id)}
                        className="flex-1 px-6 py-3 bg-rose-600 text-white rounded-lg font-bold hover:bg-rose-700 transition-colors"
                      >
                        ✗ Reject
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-12 bg-slate-800 rounded-lg border border-slate-700 text-center">
                  <p className="text-slate-400">Select a patch to review</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
