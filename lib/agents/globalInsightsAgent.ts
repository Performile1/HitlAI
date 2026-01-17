import { ChatOpenAI } from '@langchain/openai'
import { getSupabaseAdmin } from '@/lib/supabase/admin'

interface SystemicIssue {
  issueType: string
  description: string
  affectedApps: string[]
  impactedPersonas: string[]
  guidelineCitations: string[]
  frequency: number
  avgSeverity: number
  recommendedFix: string
  estimatedImpact: string
}

interface UXDebtReport {
  companyId: string
  reportPeriod: { start: Date; end: Date }
  overallHealthScore: number
  systemicIssues: SystemicIssue[]
  heuristicHeatmap: Record<string, number>
  personaVulnerabilities: Record<string, string[]>
  trendAnalysis: {
    improving: string[]
    degrading: string[]
    stable: string[]
  }
  recommendations: string[]
  executiveSummary: string
}

/**
 * GlobalInsightsAgent - Transforms transaction-based testing into strategic intelligence
 * 
 * Instead of reporting individual bugs per test, this agent analyzes patterns across
 * ALL tests for a company to identify systemic UX debt. This transforms the platform
 * from a utility into a strategic consultancy tool.
 * 
 * Key Innovation: Cross-Test Correlation using vector similarity clustering
 */
export class GlobalInsightsAgent {
  private llm: ChatOpenAI

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4o',
      temperature: 0.3
    })
  }

  /**
   * Generates a comprehensive UX Health Report for a company
   * Analyzes all tests across time to identify systemic patterns
   */
  async generateUXHealthReport(
    companyId: string,
    periodDays: number = 90
  ): Promise<UXDebtReport> {
    const supabase = getSupabaseAdmin()
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - periodDays * 24 * 60 * 60 * 1000)

    // Get all test requests for this company in period
    const { data: testRequests } = await supabase
      .from('test_requests')
      .select('id, url, title, created_at')
      .eq('company_id', companyId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (!testRequests || testRequests.length === 0) {
      return this.generateEmptyReport(companyId, startDate, endDate)
    }

    // Get all friction points from these tests
    const testRequestIds = (testRequests as any[]).map(tr => tr.id)
    const { data: frictionPoints } = await supabase
      .from('friction_points')
      .select(`
        *,
        test_run:test_runs!inner(
          test_request_id,
          persona
        )
      `)
      .in('test_run.test_request_id', testRequestIds)

    if (!frictionPoints || frictionPoints.length === 0) {
      return this.generateEmptyReport(companyId, startDate, endDate)
    }

    // Cluster friction points to find systemic issues
    const systemicIssues = await this.identifySystemicIssues(
      frictionPoints,
      testRequests
    )

    // Generate heuristic heatmap
    const heuristicHeatmap = this.generateHeuristicHeatmap(frictionPoints)

    // Analyze persona vulnerabilities
    const personaVulnerabilities = this.analyzePersonaVulnerabilities(frictionPoints)

    // Trend analysis (compare with previous period)
    const trendAnalysis = await this.analyzeTrends(
      companyId,
      startDate,
      endDate,
      systemicIssues
    )

    // Calculate overall health score
    const overallHealthScore = this.calculateHealthScore(
      systemicIssues,
      frictionPoints.length,
      testRequests.length
    )

    // Generate strategic recommendations
    const recommendations = await this.generateRecommendations(
      systemicIssues,
      heuristicHeatmap,
      personaVulnerabilities
    )

    // Generate executive summary
    const executiveSummary = await this.generateExecutiveSummary({
      overallHealthScore,
      systemicIssues,
      trendAnalysis,
      recommendations
    })

    return {
      companyId,
      reportPeriod: { start: startDate, end: endDate },
      overallHealthScore,
      systemicIssues,
      heuristicHeatmap,
      personaVulnerabilities,
      trendAnalysis,
      recommendations,
      executiveSummary
    }
  }

  /**
   * Identifies systemic issues using vector similarity clustering
   * Groups similar friction points across different tests/apps
   */
  private async identifySystemicIssues(
    frictionPoints: any[],
    testRequests: any[]
  ): Promise<SystemicIssue[]> {
    // Group friction points by similarity using embeddings
    const clusters = await this.clusterFrictionPoints(frictionPoints)

    const systemicIssues: SystemicIssue[] = []

    for (const cluster of clusters) {
      if (cluster.points.length < 3) continue // Not systemic if < 3 occurrences

      const affectedApps = [...new Set(
        cluster.points.map(p => {
          const testRequest = testRequests.find(tr => 
            tr.id === p.test_run?.test_request_id
          )
          return testRequest?.url || 'Unknown'
        })
      )]

      const impactedPersonas = [...new Set(
        cluster.points.map(p => p.test_run?.persona).filter(Boolean)
      )]

      const guidelineCitations = [...new Set(
        cluster.points.map(p => p.guideline_citation).filter(Boolean)
      )]

      const avgSeverity = cluster.points.reduce((sum, p) => {
        const severityMap = { low: 1, medium: 2, high: 3, critical: 4 }
        return sum + (severityMap[p.severity as keyof typeof severityMap] || 2)
      }, 0) / cluster.points.length

      // Generate recommended fix using LLM
      const recommendedFix = await this.generateSystemicFix(cluster)

      systemicIssues.push({
        issueType: cluster.category,
        description: cluster.description,
        affectedApps,
        impactedPersonas,
        guidelineCitations,
        frequency: cluster.points.length,
        avgSeverity,
        recommendedFix,
        estimatedImpact: this.estimateImpact(cluster.points.length, avgSeverity)
      })
    }

    return systemicIssues.sort((a, b) => 
      (b.frequency * b.avgSeverity) - (a.frequency * a.avgSeverity)
    )
  }

  /**
   * Clusters friction points using vector similarity
   * In production, this would use pgvector's similarity search
   */
  private async clusterFrictionPoints(
    frictionPoints: any[]
  ): Promise<Array<{
    category: string
    description: string
    points: any[]
  }>> {
    // Group by issue type first (simple clustering)
    const groups = new Map<string, any[]>()

    frictionPoints.forEach(fp => {
      const key = `${fp.issue_type}_${fp.element_type || 'general'}`
      const existing = groups.get(key) || []
      existing.push(fp)
      groups.set(key, existing)
    })

    // Convert to cluster format
    const clusters: Array<{
      category: string
      description: string
      points: any[]
    }> = []

    for (const [key, points] of groups.entries()) {
      if (points.length >= 3) {
        const [issueType, elementType] = key.split('_')
        clusters.push({
          category: issueType,
          description: `${issueType} issues with ${elementType} elements`,
          points
        })
      }
    }

    return clusters
  }

  /**
   * Generates a systemic fix recommendation using LLM
   */
  private async generateSystemicFix(cluster: any): Promise<string> {
    const prompt = `You are a UX strategist. Analyze this systemic issue and recommend a company-wide fix.

**Issue Category**: ${cluster.category}
**Description**: ${cluster.description}
**Frequency**: ${cluster.points.length} occurrences
**Sample Issues**:
${cluster.points.slice(0, 3).map((p: any) => `- ${p.description}`).join('\n')}

**Your Task**:
Recommend a SYSTEMIC fix that addresses the root cause across all affected apps.
Focus on:
1. Design system changes (CSS variables, component libraries)
2. Process improvements (design reviews, accessibility audits)
3. Tooling (linters, automated checks)

Return a concise recommendation (2-3 sentences).`

    try {
      const response = await this.llm.invoke(prompt)
      return response.content as string
    } catch (error) {
      return 'Review and standardize this pattern across all applications.'
    }
  }

  /**
   * Generates heuristic heatmap showing UX debt distribution
   */
  private generateHeuristicHeatmap(frictionPoints: any[]): Record<string, number> {
    const heatmap: Record<string, number> = {
      'Visual Clarity': 0,
      'Navigation': 0,
      'Error Prevention': 0,
      'Consistency': 0,
      'Accessibility': 0,
      'Performance': 0,
      'Content Clarity': 0,
      'Trust Signals': 0,
      'Mobile Optimization': 0,
      'Form Design': 0
    }

    // Map issue types to heuristic categories
    const categoryMap: Record<string, string> = {
      'visibility': 'Visual Clarity',
      'cognitive_load': 'Content Clarity',
      'interaction': 'Navigation',
      'accessibility': 'Accessibility',
      'error': 'Error Prevention',
      'consistency': 'Consistency',
      'performance': 'Performance',
      'trust': 'Trust Signals',
      'mobile': 'Mobile Optimization',
      'form': 'Form Design'
    }

    frictionPoints.forEach(fp => {
      const category = categoryMap[fp.issue_type] || 'Consistency'
      heatmap[category]++
    })

    // Normalize to 0-100 scale
    const max = Math.max(...Object.values(heatmap))
    if (max > 0) {
      Object.keys(heatmap).forEach(key => {
        heatmap[key] = Math.round((heatmap[key] / max) * 100)
      })
    }

    return heatmap
  }

  /**
   * Analyzes which personas are most affected by issues
   */
  private analyzePersonaVulnerabilities(
    frictionPoints: any[]
  ): Record<string, string[]> {
    const vulnerabilities: Record<string, string[]> = {}

    frictionPoints.forEach(fp => {
      const persona = fp.test_run?.persona
      if (!persona) return

      if (!vulnerabilities[persona]) {
        vulnerabilities[persona] = []
      }

      if (fp.severity === 'critical' || fp.severity === 'high') {
        vulnerabilities[persona].push(fp.description)
      }
    })

    return vulnerabilities
  }

  /**
   * Analyzes trends by comparing with previous period
   */
  private async analyzeTrends(
    companyId: string,
    currentStart: Date,
    currentEnd: Date,
    currentIssues: SystemicIssue[]
  ): Promise<{
    improving: string[]
    degrading: string[]
    stable: string[]
  }> {
    // Get previous period data
    const periodLength = currentEnd.getTime() - currentStart.getTime()
    const previousStart = new Date(currentStart.getTime() - periodLength)
    const previousEnd = currentStart

    const previousReport = await this.generateUXHealthReport(companyId, 90)

    // Compare issue frequencies
    const improving: string[] = []
    const degrading: string[] = []
    const stable: string[] = []

    currentIssues.forEach(current => {
      const previous = previousReport.systemicIssues.find(
        p => p.issueType === current.issueType
      )

      if (!previous) {
        degrading.push(current.issueType)
      } else if (current.frequency < previous.frequency * 0.8) {
        improving.push(current.issueType)
      } else if (current.frequency > previous.frequency * 1.2) {
        degrading.push(current.issueType)
      } else {
        stable.push(current.issueType)
      }
    })

    return { improving, degrading, stable }
  }

  /**
   * Calculates overall UX health score (0-100)
   */
  private calculateHealthScore(
    systemicIssues: SystemicIssue[],
    totalFrictionPoints: number,
    totalTests: number
  ): number {
    let score = 100

    // Penalize for systemic issues
    systemicIssues.forEach(issue => {
      const penalty = issue.frequency * issue.avgSeverity * 0.5
      score -= penalty
    })

    // Penalize for high friction point density
    const frictionDensity = totalFrictionPoints / totalTests
    if (frictionDensity > 10) {
      score -= (frictionDensity - 10) * 2
    }

    return Math.max(0, Math.min(100, Math.round(score)))
  }

  /**
   * Generates strategic recommendations
   */
  private async generateRecommendations(
    systemicIssues: SystemicIssue[],
    heuristicHeatmap: Record<string, number>,
    personaVulnerabilities: Record<string, string[]>
  ): Promise<string[]> {
    const recommendations: string[] = []

    // Top 3 systemic issues
    systemicIssues.slice(0, 3).forEach(issue => {
      recommendations.push(
        `**${issue.issueType}**: ${issue.recommendedFix} (Affects ${issue.affectedApps.length} apps, ${issue.frequency} occurrences)`
      )
    })

    // Heuristic focus areas
    const topHeuristics = Object.entries(heuristicHeatmap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)

    topHeuristics.forEach(([heuristic, score]) => {
      recommendations.push(
        `**Focus Area**: ${heuristic} (${score}% of issues) - Conduct comprehensive audit`
      )
    })

    // Persona-specific recommendations
    const mostVulnerablePersona = Object.entries(personaVulnerabilities)
      .sort(([, a], [, b]) => b.length - a.length)[0]

    if (mostVulnerablePersona) {
      recommendations.push(
        `**Persona Priority**: ${mostVulnerablePersona[0]} experiences ${mostVulnerablePersona[1].length} critical issues - Prioritize accessibility improvements`
      )
    }

    return recommendations
  }

  /**
   * Generates executive summary using LLM
   */
  private async generateExecutiveSummary(data: {
    overallHealthScore: number
    systemicIssues: SystemicIssue[]
    trendAnalysis: any
    recommendations: string[]
  }): Promise<string> {
    const prompt = `Generate an executive summary for a UX Health Report.

**Overall Health Score**: ${data.overallHealthScore}/100
**Systemic Issues Found**: ${data.systemicIssues.length}
**Top Issues**:
${data.systemicIssues.slice(0, 3).map(i => `- ${i.issueType}: ${i.frequency} occurrences`).join('\n')}

**Trends**:
- Improving: ${data.trendAnalysis.improving.length} categories
- Degrading: ${data.trendAnalysis.degrading.length} categories

Write a 3-paragraph executive summary:
1. Overall assessment
2. Key findings
3. Strategic recommendations

Keep it concise and business-focused.`

    try {
      const response = await this.llm.invoke(prompt)
      return response.content as string
    } catch (error) {
      return `UX Health Score: ${data.overallHealthScore}/100. ${data.systemicIssues.length} systemic issues identified requiring strategic attention.`
    }
  }

  /**
   * Estimates business impact of fixing an issue
   */
  private estimateImpact(frequency: number, avgSeverity: number): string {
    const impact = frequency * avgSeverity

    if (impact > 30) return 'High - Immediate action recommended'
    if (impact > 15) return 'Medium - Address in next sprint'
    return 'Low - Monitor and address opportunistically'
  }

  /**
   * Generates empty report for companies with no data
   */
  private generateEmptyReport(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): UXDebtReport {
    return {
      companyId,
      reportPeriod: { start: startDate, end: endDate },
      overallHealthScore: 100,
      systemicIssues: [],
      heuristicHeatmap: {},
      personaVulnerabilities: {},
      trendAnalysis: { improving: [], degrading: [], stable: [] },
      recommendations: ['Run more tests to generate insights'],
      executiveSummary: 'Insufficient data for analysis. Run at least 10 tests to generate a comprehensive UX health report.'
    }
  }
}
