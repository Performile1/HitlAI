import { ChatOpenAI } from '@langchain/openai'

export class MissionPlanner {
  private llm: ChatOpenAI

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.7,
      maxTokens: 4096
    })
  }

  async planMission(mission: string, persona: any, context: string) {
    const prompt = `You are a test mission strategist. Break down this user objective into atomic, testable steps.

**Objective**: ${mission}

**Persona**:
- Age: ${persona.age}
- Tech Literacy: ${persona.tech_literacy}
- Cognitive Load: ${persona.cognitive_load}
- Navigation Preference: ${persona.preferred_navigation}

**Page Context** (first 2000 chars):
${context.substring(0, 2000)}

Return a JSON object with this structure:
{
  "missionName": "descriptive name",
  "steps": [
    {
      "stepNumber": 1,
      "action": "specific action to take",
      "targetElement": "what to interact with",
      "validation": "how to verify success",
      "cognitiveNotes": "persona considerations"
    }
  ],
  "successCriteria": ["list of success indicators"],
  "failureScenarios": ["potential failure points"]
}

Focus on steps that align with the persona's capabilities and limitations.`

    const response = await this.llm.invoke(prompt)
    
    try {
      const content = response.content as string
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }
    } catch (error) {
      console.error('Failed to parse mission plan:', error)
    }

    return {
      missionName: mission,
      steps: [
        {
          stepNumber: 1,
          action: mission,
          targetElement: 'unknown',
          validation: 'manual',
          cognitiveNotes: 'fallback plan'
        }
      ],
      successCriteria: [],
      failureScenarios: []
    }
  }
}
