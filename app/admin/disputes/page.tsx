'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

interface Dispute {
  id: string;
  test_id: string;
  company_id: string;
  status: string;
  reason: string;
  conditional_credits_granted: number;
  penalty_surcharge_amount: number;
  created_at: string;
}

export default function DisputesListPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const supabase = createClient();

  useEffect(() => {
    loadDisputes();
  }, [filter]);

  async function loadDisputes() {
    setLoading(true);
    let query = supabase
      .from('disputes')
      .select('*')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data, error } = await query;

    if (data) setDisputes(data);
    setLoading(false);
  }

  const statusColors = {
    pending: 'bg-amber-900/30 border-amber-700 text-amber-400',
    processing: 'bg-blue-900/30 border-blue-700 text-blue-400',
    resolved: 'bg-emerald-900/30 border-emerald-700 text-emerald-400',
    valid: 'bg-green-900/30 border-green-700 text-green-400',
    invalid: 'bg-rose-900/30 border-rose-700 text-rose-400'
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-indigo-400">Dispute Management</h1>
            <p className="text-slate-400 mt-2">Review and resolve company disputes</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'pending'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                filter === 'resolved'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              Resolved
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            <p className="text-slate-400 mt-4">Loading disputes...</p>
          </div>
        ) : disputes.length === 0 ? (
          <div className="text-center py-12 bg-slate-800 rounded-lg border border-slate-700">
            <p className="text-slate-400 text-lg">No disputes found</p>
            <p className="text-slate-500 text-sm mt-2">
              {filter === 'all' ? 'No disputes have been created yet' : `No ${filter} disputes`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {disputes.map((dispute) => (
              <Link
                key={dispute.id}
                href={`/admin/disputes/${dispute.id}`}
                className="block p-6 bg-slate-800 rounded-lg border border-slate-700 hover:border-indigo-600 transition-all cursor-pointer"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-white">
                        Dispute #{dispute.id.slice(0, 8)}
                      </h3>
                      <span
                        className={`px-3 py-1 rounded text-xs font-semibold border ${
                          statusColors[dispute.status as keyof typeof statusColors] ||
                          'bg-slate-700 border-slate-600 text-slate-400'
                        }`}
                      >
                        {dispute.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-300 mb-2">{dispute.reason}</p>
                    <p className="text-sm text-slate-500">
                      Test ID: {dispute.test_id.slice(0, 8)} • Company ID: {dispute.company_id.slice(0, 8)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-emerald-500">
                      {dispute.conditional_credits_granted} credits
                    </p>
                    <p className="text-sm text-rose-400">
                      +${dispute.penalty_surcharge_amount.toFixed(2)} penalty
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      {new Date(dispute.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <span className="text-indigo-400 text-sm font-semibold hover:text-indigo-300">
                    Review Dispute →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
