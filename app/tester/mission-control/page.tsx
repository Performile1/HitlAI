'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';

interface Mission {
  id: string;
  title: string;
  persona: string;
  duration: number;
  reward: number;
  aiConfidence: number;
  isDispute: boolean;
  description: string;
}

interface TesterProfile {
  trustScore: number;
  totalEarnings: number;
  completedTests: number;
}

export default function MissionControlPage() {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [profile, setProfile] = useState<TesterProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: testerData } = await supabase
        .from('human_testers')
        .select('trust_score, total_earnings, completed_tests')
        .eq('profile_id', user.id)
        .single();

      if (testerData) {
        setProfile({
          trustScore: testerData.trust_score || 0,
          totalEarnings: testerData.total_earnings || 0,
          completedTests: testerData.completed_tests || 0
        });
      }

      const { data: availableTests } = await supabase
        .from('test_runs')
        .select('*, test_requests(*), personas(*)')
        .eq('status', 'pending_human')
        .limit(10);

      if (availableTests) {
        const formattedMissions: Mission[] = availableTests.map((test: any) => ({
          id: test.id,
          title: test.test_requests?.title || 'UX Test',
          persona: test.personas?.name || 'General User',
          duration: 15,
          reward: 15.00,
          aiConfidence: Math.random() * 100,
          isDispute: false,
          description: test.test_requests?.description || 'Test user experience'
        }));
        setMissions(formattedMissions);
      }
    }
    
    setLoading(false);
  }

  const trustPercentage = profile ? (profile.trustScore / 1000) * 100 : 0;
  const trustTier = profile && profile.trustScore >= 900 ? 'Judge' :
                    profile && profile.trustScore >= 750 ? 'Elite' :
                    profile && profile.trustScore >= 500 ? 'Veteran' : 'Novice';

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-extrabold text-white mb-2">Mission Control</h1>
            <p className="text-slate-400">Available testing missions • Real-time updates</p>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-3xl font-bold text-emerald-500">${profile?.totalEarnings.toFixed(2) || '0.00'}</p>
              <p className="text-sm text-slate-400">Total Earnings</p>
            </div>
            
            <motion.div 
              className="relative w-32 h-32"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-slate-800"
                />
                <motion.circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - trustPercentage / 100)}`}
                  className={`${
                    trustTier === 'Judge' ? 'text-purple-500' :
                    trustTier === 'Elite' ? 'text-emerald-500' :
                    trustTier === 'Veteran' ? 'text-indigo-500' :
                    'text-slate-500'
                  }`}
                  strokeLinecap="round"
                  initial={{ strokeDashoffset: 2 * Math.PI * 56 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 56 * (1 - trustPercentage / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-white">{profile?.trustScore || 0}</span>
                <span className="text-xs text-slate-400">Trust Score</span>
              </div>
            </motion.div>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
            <p className="text-2xl font-bold text-white">{profile?.completedTests || 0}</p>
            <p className="text-sm text-slate-400">Tests Completed</p>
          </div>
          <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
            <p className="text-2xl font-bold text-emerald-500">{trustTier}</p>
            <p className="text-sm text-slate-400">Current Tier</p>
          </div>
          <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
            <p className="text-2xl font-bold text-indigo-500">+{((profile?.trustScore || 0) / 2000 * 50).toFixed(0)}%</p>
            <p className="text-sm text-slate-400">Earnings Bonus</p>
          </div>
          <div className="p-4 bg-slate-900 rounded-lg border border-slate-800">
            <p className="text-2xl font-bold text-amber-500">{missions.length}</p>
            <p className="text-sm text-slate-400">Available Missions</p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Active Missions</h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="text-slate-400 mt-4">Loading missions...</p>
            </div>
          ) : missions.length === 0 ? (
            <div className="text-center py-12 bg-slate-900 rounded-lg border border-slate-800">
              <p className="text-slate-400 text-lg">No missions available right now</p>
              <p className="text-slate-500 text-sm mt-2">Check back soon for new testing opportunities</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {missions.map((mission, idx) => (
                <motion.div
                  key={mission.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className={`p-6 rounded-lg border shadow-lg hover:shadow-xl transition-all cursor-pointer ${
                    mission.isDispute
                      ? 'bg-indigo-900/30 border-indigo-700 hover:border-indigo-500'
                      : 'bg-slate-900 border-slate-800 hover:border-indigo-600'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {mission.isDispute && '🔥 '}
                        {mission.title}
                      </h3>
                      <p className="text-sm text-slate-400">
                        {mission.persona} • {mission.duration} min
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-emerald-500">
                        ${mission.reward.toFixed(2)}
                      </p>
                      {mission.isDispute && (
                        <p className="text-xs text-emerald-400">+50% Bonus</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex-1 bg-slate-800 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          mission.aiConfidence < 40 ? 'bg-rose-500' :
                          mission.aiConfidence < 70 ? 'bg-amber-500' :
                          'bg-indigo-600'
                        }`}
                        style={{ width: `${mission.aiConfidence}%` }}
                      ></div>
                    </div>
                    <span className={`text-sm font-medium ${
                      mission.aiConfidence < 40 ? 'text-rose-400' :
                      mission.aiConfidence < 70 ? 'text-amber-400' :
                      'text-indigo-400'
                    }`}>
                      {mission.aiConfidence.toFixed(0)}% AI Confidence
                    </span>
                  </div>

                  <p className="text-sm text-slate-300 mb-4">{mission.description}</p>

                  <button className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
                    Accept Mission
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
