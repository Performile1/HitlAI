'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { SentinelBiometricTracker } from '@/lib/services/sentinel';
import { enableElementPicker, getElementInfo, ElementInfo } from '@/lib/utils/elementSelector';
import { captureAndUploadScreenshot } from '@/lib/utils/screenshotCapture';
import { ScreenRecorder } from '@/lib/utils/screenRecorder';
import ScreenshotMarkup from '@/components/ScreenshotMarkup';
import { Camera, Video, Target, Sparkles, StopCircle } from 'lucide-react';

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

interface EnhancedAnnotation {
  timestamp: number;
  text: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  elementInfo?: ElementInfo;
  screenshotUrl?: string;
  markupData?: any;
}

export default function EnhancedTestExecutePage() {
  const params = useParams();
  const [testRun, setTestRun] = useState<TestRun | null>(null);
  const [loading, setLoading] = useState(true);
  const [annotations, setAnnotations] = useState<EnhancedAnnotation[]>([]);
  const [currentAnnotation, setCurrentAnnotation] = useState('');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [testStartTime] = useState(Date.now());
  const [isRecording, setIsRecording] = useState(false);
  const [isPickingElement, setIsPickingElement] = useState(false);
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null);
  const [screenshotForMarkup, setScreenshotForMarkup] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  
  const sentinelRef = useRef<SentinelBiometricTracker | null>(null);
  const recorderRef = useRef<ScreenRecorder | null>(null);
  const elementPickerCleanupRef = useRef<(() => void) | null>(null);
  const supabase = createClient();

  useEffect(() => {
    loadTestRun();
    sentinelRef.current = new SentinelBiometricTracker();
    recorderRef.current = new ScreenRecorder();
    
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
      if (elementPickerCleanupRef.current) {
        elementPickerCleanupRef.current();
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

  const handleElementPicker = () => {
    if (isPickingElement) {
      if (elementPickerCleanupRef.current) {
        elementPickerCleanupRef.current();
        elementPickerCleanupRef.current = null;
      }
      setIsPickingElement(false);
    } else {
      setIsPickingElement(true);
      elementPickerCleanupRef.current = enableElementPicker((elementInfo) => {
        setSelectedElement(elementInfo);
        setIsPickingElement(false);
        elementPickerCleanupRef.current = null;
      });
    }
  };

  const handleScreenshot = async () => {
    try {
      const { url, screenshot } = await captureAndUploadScreenshot(supabase);
      setScreenshotForMarkup(url);
    } catch (error) {
      alert(`Screenshot failed: ${error}`);
    }
  };

  const handleStartRecording = async () => {
    try {
      await recorderRef.current?.startRecording();
      setIsRecording(true);
    } catch (error) {
      alert(`Recording failed: ${error}`);
    }
  };

  const handleStopRecording = async () => {
    try {
      const result = await recorderRef.current?.stopRecording();
      if (result) {
        // Upload recording
        const { uploadRecording } = await import('@/lib/utils/screenRecorder');
        const url = await uploadRecording(result.blob, params.id as string, supabase);
        console.log('Recording saved:', url);
      }
      setIsRecording(false);
    } catch (error) {
      alert(`Stop recording failed: ${error}`);
    }
  };

  const handleAISuggestions = async () => {
    try {
      // Capture screenshot for AI analysis
      const { url } = await captureAndUploadScreenshot(supabase);
      
      // Call AI issue detector
      const response = await fetch('/api/ai/detect-issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageUrl: url,
          context: {
            url: testRun?.test_requests.url,
            mission: testRun?.test_requests.description,
            personaType: testRun?.personas.name
          }
        })
      });

      const result = await response.json();
      if (result.issues) {
        setAiSuggestions(result.issues.map((issue: any) => 
          `[${issue.severity.toUpperCase()}] ${issue.title}: ${issue.description}`
        ));
      }
    } catch (error) {
      console.error('AI suggestions failed:', error);
    }
  };

  const addAnnotation = () => {
    if (!currentAnnotation.trim()) return;

    const timestamp = Date.now() - testStartTime;
    setAnnotations([...annotations, {
      timestamp,
      text: currentAnnotation,
      severity,
      elementInfo: selectedElement || undefined
    }]);
    setCurrentAnnotation('');
    setSelectedElement(null);
  };

  const handleMarkupSave = (markupData: any, imageDataUrl: string) => {
    // Convert data URL to blob and upload
    fetch(imageDataUrl)
      .then(res => res.blob())
      .then(async blob => {
        const filename = `markup-${Date.now()}.png`;
        const { uploadScreenshot } = await import('@/lib/utils/screenshotCapture');
        const url = await uploadScreenshot(blob, filename, supabase);
        
        const timestamp = Date.now() - testStartTime;
        setAnnotations([...annotations, {
          timestamp,
          text: currentAnnotation || 'Screenshot with markup',
          severity,
          screenshotUrl: url,
          markupData
        }]);
        
        setScreenshotForMarkup(null);
        setCurrentAnnotation('');
      });
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
          text: annotation.text,
          position: annotation.elementInfo ? {
            selector: annotation.elementInfo.selector,
            xpath: annotation.elementInfo.xpath,
            boundingBox: annotation.elementInfo.boundingBox
          } : null,
          screenshot_url: annotation.screenshotUrl,
          markup: annotation.markupData
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
    <>
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
                    onClick={handleElementPicker}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                      isPickingElement
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                    title="Pick Element"
                  >
                    <Target className="w-4 h-4" />
                    {isPickingElement ? 'Picking...' : 'Pick Element'}
                  </button>
                  <button
                    onClick={handleScreenshot}
                    className="px-4 py-2 bg-slate-700 text-slate-300 hover:bg-slate-600 rounded-lg font-semibold transition-colors flex items-center gap-2"
                    title="Take Screenshot"
                  >
                    <Camera className="w-4 h-4" />
                    Screenshot
                  </button>
                  <button
                    onClick={isRecording ? handleStopRecording : handleStartRecording}
                    className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2 ${
                      isRecording
                        ? 'bg-rose-600 text-white animate-pulse'
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                    title={isRecording ? 'Stop Recording' : 'Start Recording'}
                  >
                    {isRecording ? <StopCircle className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    {isRecording ? 'Stop' : 'Record'}
                  </button>
                  <button
                    onClick={handleAISuggestions}
                    className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg font-semibold transition-colors flex items-center gap-2"
                    title="AI Suggestions"
                  >
                    <Sparkles className="w-4 h-4" />
                    AI Detect
                  </button>
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

            {aiSuggestions.length > 0 && (
              <div className="p-4 bg-purple-900/20 border-b border-purple-700/50">
                <h4 className="text-sm font-semibold text-purple-300 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  AI Detected Issues
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {aiSuggestions.map((suggestion, idx) => (
                    <div key={idx} className="text-xs text-purple-200 bg-purple-900/30 p-2 rounded">
                      {suggestion}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedElement && (
              <div className="p-4 bg-indigo-900/20 border-b border-indigo-700/50">
                <h4 className="text-sm font-semibold text-indigo-300 mb-2">Selected Element</h4>
                <div className="text-xs text-indigo-200 space-y-1">
                  <div><span className="text-slate-400">Type:</span> {selectedElement.elementType}</div>
                  <div className="truncate"><span className="text-slate-400">Selector:</span> {selectedElement.selector}</div>
                  {selectedElement.elementText && (
                    <div className="truncate"><span className="text-slate-400">Text:</span> {selectedElement.elementText}</div>
                  )}
                </div>
              </div>
            )}

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
                    {annotation.elementInfo && (
                      <span className="text-xs text-indigo-400">📍 Element</span>
                    )}
                    {annotation.screenshotUrl && (
                      <span className="text-xs text-blue-400">📸 Screenshot</span>
                    )}
                  </div>
                  <p className="text-sm text-slate-300">{annotation.text}</p>
                  {annotation.elementInfo && (
                    <div className="mt-2 text-xs text-slate-500 truncate">
                      {annotation.elementInfo.selector}
                    </div>
                  )}
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

      {screenshotForMarkup && (
        <ScreenshotMarkup
          imageUrl={screenshotForMarkup}
          onSave={handleMarkupSave}
          onClose={() => setScreenshotForMarkup(null)}
        />
      )}
    </>
  );
}
