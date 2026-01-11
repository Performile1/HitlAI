import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface SignalPayload {
  testRunId: string;
  signalType: 'human_submission' | 'ai_resume' | 'timeout';
  data?: any;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*' } });
  }

  try {
    const { testRunId, signalType, payload } = await req.json();

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    if (signalType === 'HumanSubmissionSignal') {
      await supabase
        .from('test_runs')
        .update({
          status: 'processing_human_evidence',
          human_submission_received: true
        })
        .eq('id', testRunId);

      await supabase.from('ai_learning_events').insert({
        event_type: 'human_submission_received',
        test_run_id: testRunId,
        details: { timestamp: new Date().toISOString() }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to process signal' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
