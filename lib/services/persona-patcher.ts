import { createClient } from '@/lib/supabase/client';
import Anthropic from '@anthropic-ai/sdk';

interface HumanEvidence {
  id: string;
  personaId: string;
  userComment: string;
  uiElementSnapshot: string;
  interactionType: 'hesitation' | 'error' | 'confusion';
  testRunId: string;
}

export class PersonaPatcher {
  private supabase = createClient();
  private anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY || ''
  });

  async generatePersonaPatch(evidence: HumanEvidence): Promise<string> {
    const { data: persona } = await this.supabase
      .from('personas')
      .select('system_prompt, behavioral_constraints, demographic_data')
      .eq('id', evidence.personaId)
      .single();

    if (!persona) throw new Error('Persona not found');

    const patchPrompt = `
ACT AS: HitlAI Behavioral Engineer.

CURRENT PERSONA LOGIC:
${persona.system_prompt}

BEHAVIORAL CONSTRAINTS:
${JSON.stringify(persona.behavioral_constraints, null, 2)}

HUMAN EVIDENCE:
- Tester said: "${evidence.userComment}"
- At element: "${evidence.uiElementSnapshot}"
- Interaction type: ${evidence.interactionType}

TASK: Write a 1-sentence behavioral constraint to append to this persona
so the AI mimics this human struggle.

FORMAT: "When encountering [element], you must [behavioral limitation]."

IMPORTANT: Be specific about the UI pattern and the cognitive limitation.
`;

    const message = await this.anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: patchPrompt
      }]
    });

    const patch = message.content[0].type === 'text' ? message.content[0].text : '';

    await this.supabase.from('persona_patches').insert({
      persona_id: evidence.personaId,
      suggested_logic: patch,
      source_evidence_id: evidence.id,
      status: 'pending_review',
      patch_type: 'individual',
      evidence_count: 1
    });

    return patch;
  }

  async checkForConsensusPatch(personaId: string, uiElement: string): Promise<void> {
    const { data: insights } = await this.supabase
      .from('human_insights')
      .select('*')
      .eq('persona_id', personaId)
      .eq('ui_element_path', uiElement)
      .gte('severity_score', 3);

    if (insights && insights.length >= 3) {
      const consensusComment = insights.map(i => i.content).join(' | ');
      
      const { data: persona } = await this.supabase
        .from('personas')
        .select('system_prompt')
        .eq('id', personaId)
        .single();

      const consensusPatchPrompt = `
ACT AS: HitlAI Behavioral Engineer.

CURRENT PERSONA: ${persona?.system_prompt}

CONSENSUS EVIDENCE (${insights.length} testers struggled):
${consensusComment}

UI ELEMENT: ${uiElement}

TASK: Write a verified behavioral constraint based on this consensus data.
FORMAT: "When encountering [element], you must [behavioral limitation]."
`;

      const message = await this.anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: consensusPatchPrompt
        }]
      });

      const patch = message.content[0].type === 'text' ? message.content[0].text : '';

      await this.supabase.from('persona_patches').insert({
        persona_id: personaId,
        suggested_logic: patch,
        source_evidence_id: insights[0].id,
        status: 'pending_review',
        patch_type: 'consensus',
        evidence_count: insights.length
      });
    }
  }

  async applyPatch(patchId: string, adminId: string): Promise<void> {
    const { data: patch } = await this.supabase
      .from('persona_patches')
      .select('*, personas(*)')
      .eq('id', patchId)
      .single();

    if (!patch) throw new Error('Patch not found');

    const currentPrompt = patch.personas.system_prompt;
    const updatedPrompt = `${currentPrompt}\n\n[HUMAN-LEARNED CONSTRAINT v${patch.personas.version + 1}]: ${patch.suggested_logic}`;

    await this.supabase
      .from('personas')
      .update({
        system_prompt: updatedPrompt,
        version: patch.personas.version + 1,
        evidence_count: patch.personas.evidence_count + patch.evidence_count
      })
      .eq('id', patch.persona_id);

    await this.supabase
      .from('persona_patches')
      .update({
        status: 'approved',
        admin_id: adminId,
        applied_at: new Date().toISOString()
      })
      .eq('id', patchId);

    await this.supabase.from('ai_learning_events').insert({
      event_type: 'persona_patch',
      persona_id: patch.persona_id,
      details: {
        patch_id: patchId,
        patch_type: patch.patch_type,
        evidence_count: patch.evidence_count
      }
    });
  }

  async rejectPatch(patchId: string, adminId: string): Promise<void> {
    await this.supabase
      .from('persona_patches')
      .update({
        status: 'rejected',
        admin_id: adminId
      })
      .eq('id', patchId);
  }
}
