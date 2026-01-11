'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface Dispute {
  id: string;
  test_id: string;
  company_id: string;
  status: string;
  conditional_credits_granted: number;
  penalty_surcharge_amount: number;
  ai_findings_json: any;
  human_findings_json: any;
  reason: string;
  created_at: string;
}

export default function DisputeReviewPage() {
  const params = useParams();
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');
  const supabase = createClient();

  useEffect(() => {
    loadDispute();
  }, [params.id]);

  async function loadDispute() {
    const { data, error } = await supabase
      .from('disputes')
      .select('*')
      .eq('id', params.id)
      .single();

    if (data) setDispute(data);
    setLoading(false);
  }

  async function resolveDispute(verdict: 'ai_upheld' | 'ai_overruled') {
    if (!dispute) return;

    try {
      setLoading(true);

      if (verdict === 'ai_upheld') {
        const { error: rpcError } = await supabase.rpc('charge_dispute_penalty', {
          p_company_id: dispute.company_id,
          p_credits: dispute.conditional_credits_granted,
          p_penalty: dispute.penalty_surcharge_amount
        });

        if (rpcError) {
          alert(`Error charging penalty: ${rpcError.message}`);
          setLoading(false);
          return;
        }
      } else {
        const { error: rpcError } = await supabase.rpc('refund_dispute', {
          p_company_id: dispute.company_id,
          p_dispute_id: dispute.id
        });

        if (rpcError) {
          alert(`Error processing refund: ${rpcError.message}`);
          setLoading(false);
          return;
        }
      }

      const { error: updateError } = await supabase
        .from('disputes')
        .update({
          status: 'resolved',
          verdict,
          admin_notes: adminNotes,
          resolved_at: new Date().toISOString()
        })
        .eq('id', dispute.id);

      if (updateError) {
        alert(`Error updating dispute: ${updateError.message}`);
        setLoading(false);
        return;
      }

      alert(`Dispute resolved: ${verdict === 'ai_upheld' ? 'AI Upheld - Penalty Charged' : 'AI Overruled - Company Refunded'}`);
      window.location.href = '/admin/disputes';
    } catch (err) {
      alert(`Unexpected error: ${err}`);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading dispute...</div>
      </div>
    );
  }

  if (!dispute) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Dispute not found</div>
      </div>
    );
  }

  const aiFindings = dispute.ai_findings_json || [];
  const humanFindings = dispute.human_findings_json || [];

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center pb-6 border-b border-slate-700">
          <div>
            <h1 className="text-3xl font-bold text-indigo-400">Dispute Review Center</h1>
            <p className="text-slate-400 mt-2">Dispute ID: {dispute.id.slice(0, 8)}</p>
          </div>
          <div className="text-right">
            <div className="px-4 py-2 bg-amber-900/30 border border-amber-700 rounded-lg">
              <span className="text-amber-400 font-semibold uppercase">{dispute.status}</span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
              Escrow: {dispute.conditional_credits_granted} credits + ${dispute.penalty_surcharge_amount} penalty
            </p>
          </div>
        </div>

        <div className="p-6 bg-slate-800 rounded-lg border border-slate-700 shadow-lg">
          <h2 className="text-xl font-semibold text-white mb-2">Company Complaint</h2>
          <p className="text-slate-300">{dispute.reason}</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-indigo-600 rounded-full"></div>
              <h2 className="text-2xl font-bold text-indigo-400">AI Findings</h2>
            </div>
            <div className="p-6 bg-slate-900 rounded-lg border border-slate-700 space-y-3">
              {aiFindings.length > 0 ? (
                aiFindings.map((finding: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-800 rounded border border-slate-600">
                    <div className="flex items-start gap-3">
                      <div className={`px-2 py-1 rounded text-xs font-semibold ${
                        finding.severity === 'critical' ? 'bg-rose-900/30 text-rose-400' :
                        finding.severity === 'high' ? 'bg-orange-900/30 text-orange-400' :
                        finding.severity === 'medium' ? 'bg-amber-900/30 text-amber-400' :
                        'bg-slate-700 text-slate-400'
                      }`}>
                        {finding.severity || 'info'}
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-200 font-medium">{finding.title || finding.description}</p>
                        {finding.element && (
                          <p className="text-xs text-slate-500 font-mono mt-1">{finding.element}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 italic">No AI findings recorded</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <h2 className="text-2xl font-bold text-emerald-400">Human Validation</h2>
            </div>
            <div className="p-6 bg-slate-900 rounded-lg border border-emerald-700 space-y-3">
              {humanFindings.length > 0 ? (
                humanFindings.map((finding: any, idx: number) => (
                  <div key={idx} className="p-4 bg-slate-800 rounded border border-emerald-600/50">
                    <div className="flex items-start gap-3">
                      <div className={`px-2 py-1 rounded text-xs font-semibold ${
                        finding.severity === 'critical' ? 'bg-rose-900/30 text-rose-400' :
                        finding.severity === 'high' ? 'bg-orange-900/30 text-orange-400' :
                        finding.severity === 'medium' ? 'bg-amber-900/30 text-amber-400' :
                        'bg-slate-700 text-slate-400'
                      }`}>
                        {finding.severity || 'info'}
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-200 font-medium">{finding.title || finding.description}</p>
                        {finding.element && (
                          <p className="text-xs text-slate-500 font-mono mt-1">{finding.element}</p>
                        )}
                        {finding.tester_count && (
                          <p className="text-xs text-emerald-400 mt-1">
                            Confirmed by {finding.tester_count}/3 testers
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 italic">No human findings recorded</p>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 bg-slate-800 rounded-lg border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-3">Admin Notes</h3>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Explain your verdict decision (sent to company)..."
            className="w-full h-32 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-600"
          />
        </div>

        <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 p-6 -mx-8 -mb-8">
          <div className="max-w-7xl mx-auto flex gap-4">
            <button
              onClick={() => resolveDispute('ai_upheld')}
              className="flex-1 px-8 py-4 bg-indigo-600 text-white rounded-lg font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg"
            >
              ⚖️ UPHOLD AI - Charge Penalty
            </button>
            <button
              onClick={() => resolveDispute('ai_overruled')}
              className="flex-1 px-8 py-4 bg-emerald-600 text-white rounded-lg font-bold text-lg hover:bg-emerald-700 transition-colors shadow-lg"
            >
              🔄 OVERRULE AI - Refund Company
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
