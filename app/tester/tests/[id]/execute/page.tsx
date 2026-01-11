'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SentinelBiometricTracker } from '@/lib/services/sentinel';

interface TestRun {
  id: string;
  test_requests: {
    url: string;
    title: string;
    description: string;
  };
  personas: {
    name: string;
  };
}

interface Annotation {
  timestamp: number;
  text: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export default function TestExecutePage() {
  const params = useParams();
  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [currentAnnotation, setCurrentAnnotation] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [testStartTime] = useState(Date.now());
  const sentinelRef = useRef<SentinelBiometricTracker | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadTestRun();
    sentinelRef.current = new SentinelBiometricTracker();
    
    if (typeof window !== 'undefined') {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('focus', () => sentinelRef.current?.trackFocusEvent('focus'));
      window.addEventListener('blur', () => sentinelRef.current?.trackFocusEvent('blur'));
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [params.id]);

  const handleMouseMove = (e: MouseEvent) => {
    sentinelRef.current?.trackMouseMovement(e.clientX, e.clientY);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    sentinelRef.current?.trackKeystroke(e.key);
  };

  async function loadTestRun() {
    const { data, error } = await supabase
      .from('test_runs')
      .select('*, test_requests(url, title, description), personas(name)')
      .eq('id', params.id)
      .single();

    if (data) setTestRun(data);
    setLoading(false);
  }

  const addAnnotation = () => {
    if (!currentAnnotation.trim()) return;

    const timestamp = Date.now() - testStartTime;
    setAnnotations([...annotations, {
      timestamp,
      text: currentAnnotation,
      severity
    }]);
    setCurrentAnnotation('');
  };

  const submitTest = async () => {
    if (!sentinelRef.current) return;

    const biometricScore = sentinelRef.current.calculateHumanityScore();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      alert('Please log in to submit test');
      return;
    }

    try {
      const { data: tester } = await supabase
        .from('human_testers')
        .select('id')
        .eq('profile_id', user.id)
        .single();

      if (!tester) {
        alert('Tester profile not found');
        return;
      }

      await supabase.from('biometric_scores').insert({
        tester_id: tester.id,
        test_run_id: params.id as string,
        humanity_score: biometricScore.humanityScore,
        mouse_jitter_variance: biometricScore.mouseJitterVariance,
        typing_speed_variance: biometricScore.typingSpeedVariance,
        focus_event_count: biometricScore.focusEventCount,
        tab_switch_count: biometricScore.tabSwitchCount,
        flagged_for_review: biometricScore.flaggedForReview
      });

      for (const annotation of annotations) {
        await supabase.from('tester_annotations').insert({
          test_run_id: params.id as string,
          tester_id: tester.id,
          timestamp_ms: annotation.timestamp,
          annotation_type: 'comment',
          severity: annotation.severity,
          text: annotation.text
        });
      }

      await supabase
        .from('test_runs')
        .update({ status: 'completed' })
        .eq('id', params.id);

      alert('Test submitted successfully!');
      window.location.href = '/tester/mission-control';
    } catch (error) {
      alert(`Error submitting test: ${error}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading test...</div>
      </div>
    );
  }

  if (!testRun) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Test not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="flex h-screen">
        <div className="flex-1 flex flex-col">
          <div className="p-4 bg-slate-800 border-b border-slate-700">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white">{testRun.test_requests.title}</h2>
                <p className="text-sm text-slate-400">Persona: {testRun.personas.name}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={submitTest}
                  className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-colors"
                >
                  Submit Test
                </button>
              </div>
            </div>
          </div>

          <div className="flex-1 p-4 bg-slate-950">
            <iframe
              src={testRun.test_requests.url}
              className="w-full h-full rounded-lg border-2 border-slate-700"
              title="Test Application"
              sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
            />
          </div>
        </div>

        <div className="w-96 bg-slate-800 border-l border-slate-700 flex flex-col">
          <div className="p-4 border-b border-slate-700">
            <h3 className="text-lg font-bold text-white">Annotations</h3>
            <p className="text-sm text-slate-400">Record your findings</p>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {annotations.map((annotation, idx) => (
              <div key={idx} className="p-3 bg-slate-900 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    annotation.severity === 'critical' ? 'bg-rose-900/30 text-rose-400' :
                    annotation.severity === 'high' ? 'bg-orange-900/30 text-orange-400' :
                    annotation.severity === 'medium' ? 'bg-amber-900/30 text-amber-400' :
                    'bg-slate-700 text-slate-400'
                  }`}>
                    {annotation.severity}
                  </span>
                  <span className="text-xs text-slate-500">
                    {Math.floor(annotation.timestamp / 1000)}s
                  </span>
                </div>
                <p className="text-sm text-slate-300">{annotation.text}</p>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-slate-700 space-y-3">
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-indigo-600"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 mb-2 block">Annotation</label>
              <textarea
                value={currentAnnotation}
                onChange={(e) => setCurrentAnnotation(e.target.value)}
                placeholder="Describe what you found..."
                className="w-full h-24 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-indigo-600"
              />
            </div>
            <button
              onClick={addAnnotation}
              className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Add Annotation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
