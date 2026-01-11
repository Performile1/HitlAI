import { ChatOpenAI } from '@langchain/openai'

export class TechnicalExecutor {
  private llm: ChatOpenAI

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4-turbo-preview',
      temperature: 0.3,
      maxTokens: 8192
    })
  }

  async generateScript(
    mission: string,
    schema: any,
    auditResults: any,
    memoryLessons: any[]
  ): Promise<string> {
    const memoryContext = memoryLessons.length > 0
      ? `\n\nLessons from Previous Attempts:\n${memoryLessons.slice(0, 3).map(l => 
          `- ${l.lesson_text}\n  Resolution: ${l.resolution}`
        ).join('\n')}`
      : ''

    const prompt = `Generate a Playwright script for this mission: ${mission}

**Available UI Elements**:
${JSON.stringify(schema.interactive_elements || []).substring(0, 2000)}

**UX Audit Insights**:
${auditResults.summary}

Blocking Issues: ${auditResults.blockingIssues.join(', ')}
${memoryContext}

**Requirements**:
1. Use ARIA labels and roles first (most stable selectors)
2. Implement fallback selectors
3. Add retry logic with exponential backoff
4. Take screenshots before critical actions
5. Return structured error information

Generate a complete async function that returns:
{
  success: boolean,
  error?: string,
  screenshots?: string[]
}

Return ONLY the JavaScript/TypeScript code, no explanations.`

    const response = await this.llm.invoke(prompt)
    const content = response.content as string
    
    const codeMatch = content.match(/```(?:javascript|typescript)?\n([\s\S]*?)\n```/)
    if (codeMatch) {
      return codeMatch[1]
    }

    return content
  }
}
