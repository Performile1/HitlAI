/**
 * AI-Powered Issue Detection
 * Automatically detects usability issues using GPT-4 Vision
 */

import OpenAI from 'openai';

export interface DetectedIssue {
  type: 'usability' | 'accessibility' | 'performance' | 'design' | 'content';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  recommendation: string;
  confidence: number;
}

export interface IssueDetectionResult {
  issues: DetectedIssue[];
  summary: string;
  overallScore: number;
}

/**
 * Analyze screenshot for usability issues using GPT-4 Vision
 */
export async function analyzeScreenshotForIssues(
  imageUrl: string,
  context?: {
    url?: string;
    mission?: string;
    personaType?: string;
  }
): Promise<IssueDetectionResult> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const prompt = `You are an expert UX/UI analyst. Analyze this screenshot for usability, accessibility, and design issues.

${context?.url ? `URL: ${context.url}` : ''}
${context?.mission ? `User Task: ${context.mission}` : ''}
${context?.personaType ? `User Type: ${context.personaType}` : ''}

Identify issues in these categories:
1. Usability (navigation, clarity, user flow)
2. Accessibility (WCAG compliance, contrast, readability)
3. Performance (perceived speed, loading indicators)
4. Design (consistency, hierarchy, spacing)
5. Content (clarity, errors, helpful text)

For each issue found, provide:
- Type (usability/accessibility/performance/design/content)
- Severity (low/medium/high/critical)
- Title (brief description)
- Description (detailed explanation)
- Location (where on the page)
- Recommendation (how to fix)
- Confidence (0-100%)

Return as JSON array of issues, plus a summary and overall score (0-100).`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: imageUrl } }
          ]
        }
      ],
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result as IssueDetectionResult;
  } catch (error) {
    console.error('AI issue detection failed:', error);
    throw error;
  }
}

/**
 * Analyze text content for issues
 */
export async function analyzeTextForIssues(
  text: string,
  context?: {
    elementType?: string;
    purpose?: string;
  }
): Promise<DetectedIssue[]> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const prompt = `Analyze this UI text for clarity, tone, and usability issues:

Text: "${text}"
${context?.elementType ? `Element Type: ${context.elementType}` : ''}
${context?.purpose ? `Purpose: ${context.purpose}` : ''}

Check for:
- Clarity and conciseness
- Tone and professionalism
- Grammar and spelling
- Jargon or complex language
- Missing or unclear instructions
- Accessibility concerns

Return JSON array of issues found.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result.issues || [];
  } catch (error) {
    console.error('Text analysis failed:', error);
    return [];
  }
}

/**
 * Suggest improvements for detected issues
 */
export async function suggestImprovements(
  issue: DetectedIssue,
  screenshot?: string
): Promise<string[]> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const prompt = `Given this UX issue, suggest 3-5 specific, actionable improvements:

Issue Type: ${issue.type}
Severity: ${issue.severity}
Title: ${issue.title}
Description: ${issue.description}
Location: ${issue.location}

Provide concrete, implementable suggestions.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500
    });

    const suggestions = response.choices[0].message.content
      ?.split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^[-*]\s*/, '').trim()) || [];

    return suggestions;
  } catch (error) {
    console.error('Suggestion generation failed:', error);
    return [];
  }
}

/**
 * Find similar issues across multiple tests
 */
export async function findSimilarIssues(
  currentIssue: DetectedIssue,
  historicalIssues: DetectedIssue[]
): Promise<DetectedIssue[]> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const prompt = `Compare this issue with historical issues and find similar ones:

Current Issue:
- Type: ${currentIssue.type}
- Title: ${currentIssue.title}
- Description: ${currentIssue.description}

Historical Issues:
${historicalIssues.map((issue, i) => `${i + 1}. [${issue.type}] ${issue.title}: ${issue.description}`).join('\n')}

Return indices of similar issues (0-based) as JSON array.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    const indices = result.similar || [];
    
    return indices.map((i: number) => historicalIssues[i]).filter(Boolean);
  } catch (error) {
    console.error('Similar issue detection failed:', error);
    return [];
  }
}

/**
 * Generate automated test report
 */
export async function generateTestReport(
  issues: DetectedIssue[],
  metadata: {
    url: string;
    mission: string;
    duration: number;
    personaType: string;
  }
): Promise<string> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const prompt = `Generate a professional UX test report based on these findings:

Test Details:
- URL: ${metadata.url}
- Mission: ${metadata.mission}
- Duration: ${Math.round(metadata.duration / 1000)}s
- Persona: ${metadata.personaType}

Issues Found (${issues.length}):
${issues.map((issue, i) => `${i + 1}. [${issue.severity.toUpperCase()}] ${issue.title}
   Type: ${issue.type}
   Location: ${issue.location}
   Description: ${issue.description}
   Recommendation: ${issue.recommendation}`).join('\n\n')}

Create a structured report with:
1. Executive Summary
2. Key Findings
3. Critical Issues
4. Recommendations
5. Next Steps

Format in Markdown.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 2000
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Report generation failed:', error);
    return '';
  }
}

/**
 * Analyze accessibility compliance
 */
export async function analyzeAccessibility(
  screenshot: string,
  htmlContent?: string
): Promise<{
  wcagLevel: 'A' | 'AA' | 'AAA' | 'Non-compliant';
  violations: Array<{
    criterion: string;
    level: 'A' | 'AA' | 'AAA';
    description: string;
    impact: 'minor' | 'moderate' | 'serious' | 'critical';
  }>;
  score: number;
}> {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const prompt = `Analyze this interface for WCAG 2.1 accessibility compliance:

${htmlContent ? `HTML Content:\n${htmlContent.substring(0, 2000)}` : ''}

Check for:
- Color contrast (1.4.3)
- Text sizing (1.4.4)
- Keyboard navigation (2.1.1)
- Focus indicators (2.4.7)
- Alt text (1.1.1)
- Form labels (3.3.2)
- Heading structure (1.3.1)
- Link text (2.4.4)

Return JSON with:
- wcagLevel (A/AA/AAA/Non-compliant)
- violations array
- overall score (0-100)`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: screenshot } }
          ]
        }
      ],
      max_tokens: 1500,
      response_format: { type: 'json_object' }
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    return result;
  } catch (error) {
    console.error('Accessibility analysis failed:', error);
    throw error;
  }
}
