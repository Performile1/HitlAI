/**
 * Test Report Generator
 * Creates comprehensive, easy-to-understand reports for companies
 */

export interface TestInsight {
  id: string;
  category: 'usability' | 'accessibility' | 'performance' | 'design' | 'content' | 'functionality';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  location: string;
  recommendation: string;
  testerType: 'human' | 'ai';
  testerName: string;
  timestamp: Date;
  screenshotUrl?: string;
  elementSelector?: string;
}

export interface CategoryStats {
  category: string;
  totalIssues: number;
  criticalIssues: number;
  highIssues: number;
  mediumIssues: number;
  lowIssues: number;
  humanFound: number;
  aiFound: number;
  percentageOfTotal: number;
  averageSeverity: number;
}

export interface TesterComparison {
  humanTesters: {
    totalIssues: number;
    uniqueIssues: number;
    averageIssuesPerTest: number;
    criticalIssuesFound: number;
    categoryCoverage: Record<string, number>;
  };
  aiTesters: {
    totalIssues: number;
    uniqueIssues: number;
    averageIssuesPerTest: number;
    criticalIssuesFound: number;
    categoryCoverage: Record<string, number>;
  };
  overlap: {
    commonIssues: number;
    humanOnlyIssues: number;
    aiOnlyIssues: number;
  };
}

export interface TestReport {
  testRunId: string;
  testTitle: string;
  testUrl: string;
  testDate: Date;
  duration: number;
  
  // Executive Summary
  summary: {
    totalIssues: number;
    criticalIssues: number;
    overallScore: number; // 0-100
    topConcerns: string[];
    strengths: string[];
  };
  
  // Insights by Category
  categoryBreakdown: CategoryStats[];
  
  // Tester Comparison
  testerComparison: TesterComparison;
  
  // All Insights
  insights: TestInsight[];
  
  // Recommendations
  recommendations: {
    immediate: string[];
    shortTerm: string[];
    longTerm: string[];
  };
}

/**
 * Generate comprehensive test report
 */
export async function generateTestReport(
  testRunId: string,
  supabaseClient: any
): Promise<TestReport> {
  // Fetch test run data
  const { data: testRun } = await supabaseClient
    .from('test_runs')
    .select(`
      *,
      test_requests (
        url,
        title,
        description,
        created_at
      )
    `)
    .eq('id', testRunId)
    .single();

  // Fetch all annotations (insights)
  const { data: annotations } = await supabaseClient
    .from('tester_annotations')
    .select(`
      *,
      human_testers (
        first_name,
        last_name
      )
    `)
    .eq('test_run_id', testRunId);

  // Fetch AI-generated insights
  const { data: aiInsights } = await supabaseClient
    .from('human_insights')
    .select('*')
    .eq('test_run_id', testRunId);

  // Transform data into insights
  const insights: TestInsight[] = [];

  // Add human tester insights
  if (annotations) {
    annotations.forEach((ann: any) => {
      insights.push({
        id: ann.id,
        category: categorizeIssue(ann.text),
        severity: ann.severity || 'medium',
        title: extractTitle(ann.text),
        description: ann.text,
        location: ann.position?.selector || 'General',
        recommendation: generateRecommendation(ann.text),
        testerType: 'human',
        testerName: `${ann.human_testers?.first_name} ${ann.human_testers?.last_name}`,
        timestamp: new Date(ann.created_at),
        screenshotUrl: ann.screenshot_url,
        elementSelector: ann.position?.selector
      });
    });
  }

  // Add AI insights
  if (aiInsights) {
    aiInsights.forEach((insight: any) => {
      insights.push({
        id: insight.id,
        category: categorizeIssue(insight.content),
        severity: mapSeverityScore(insight.severity_score),
        title: extractTitle(insight.content),
        description: insight.content,
        location: insight.ui_element_path || 'General',
        recommendation: generateRecommendation(insight.content),
        testerType: 'ai',
        testerName: 'AI Tester',
        timestamp: new Date(insight.created_at),
        elementSelector: insight.ui_element_path
      });
    });
  }

  // Calculate category breakdown
  const categoryBreakdown = calculateCategoryStats(insights);

  // Calculate tester comparison
  const testerComparison = calculateTesterComparison(insights);

  // Generate summary
  const summary = generateSummary(insights, categoryBreakdown);

  // Generate recommendations
  const recommendations = generateRecommendations(insights, categoryBreakdown);

  return {
    testRunId,
    testTitle: testRun?.test_requests?.title || 'Test',
    testUrl: testRun?.test_requests?.url || '',
    testDate: new Date(testRun?.created_at),
    duration: calculateDuration(testRun),
    summary,
    categoryBreakdown,
    testerComparison,
    insights,
    recommendations
  };
}

/**
 * Categorize issue based on content
 */
function categorizeIssue(text: string): TestInsight['category'] {
  const lower = text.toLowerCase();
  
  if (lower.includes('contrast') || lower.includes('accessibility') || lower.includes('wcag') || lower.includes('screen reader')) {
    return 'accessibility';
  }
  if (lower.includes('slow') || lower.includes('performance') || lower.includes('load') || lower.includes('speed')) {
    return 'performance';
  }
  if (lower.includes('design') || lower.includes('color') || lower.includes('layout') || lower.includes('spacing')) {
    return 'design';
  }
  if (lower.includes('text') || lower.includes('content') || lower.includes('copy') || lower.includes('typo')) {
    return 'content';
  }
  if (lower.includes('button') || lower.includes('click') || lower.includes('navigation') || lower.includes('confusing')) {
    return 'usability';
  }
  
  return 'functionality';
}

/**
 * Extract title from description
 */
function extractTitle(text: string): string {
  const firstSentence = text.split('.')[0];
  return firstSentence.length > 60 
    ? firstSentence.substring(0, 60) + '...'
    : firstSentence;
}

/**
 * Generate recommendation based on issue
 */
function generateRecommendation(text: string): string {
  const lower = text.toLowerCase();
  
  if (lower.includes('contrast')) {
    return 'Increase color contrast to meet WCAG AA standards (4.5:1 ratio)';
  }
  if (lower.includes('button') && lower.includes('small')) {
    return 'Increase button size to minimum 44x44px for better touch targets';
  }
  if (lower.includes('slow') || lower.includes('load')) {
    return 'Optimize page load time and add loading indicators';
  }
  if (lower.includes('confusing')) {
    return 'Simplify user flow and add clearer instructions';
  }
  
  return 'Review and address this issue to improve user experience';
}

/**
 * Map severity score (1-5) to severity level
 */
function mapSeverityScore(score: number): TestInsight['severity'] {
  if (score >= 4) return 'critical';
  if (score >= 3) return 'high';
  if (score >= 2) return 'medium';
  return 'low';
}

/**
 * Calculate statistics by category
 */
function calculateCategoryStats(insights: TestInsight[]): CategoryStats[] {
  const categories = ['usability', 'accessibility', 'performance', 'design', 'content', 'functionality'];
  const totalIssues = insights.length;
  
  return categories.map(category => {
    const categoryInsights = insights.filter(i => i.category === category);
    
    return {
      category: category.charAt(0).toUpperCase() + category.slice(1),
      totalIssues: categoryInsights.length,
      criticalIssues: categoryInsights.filter(i => i.severity === 'critical').length,
      highIssues: categoryInsights.filter(i => i.severity === 'high').length,
      mediumIssues: categoryInsights.filter(i => i.severity === 'medium').length,
      lowIssues: categoryInsights.filter(i => i.severity === 'low').length,
      humanFound: categoryInsights.filter(i => i.testerType === 'human').length,
      aiFound: categoryInsights.filter(i => i.testerType === 'ai').length,
      percentageOfTotal: totalIssues > 0 ? (categoryInsights.length / totalIssues) * 100 : 0,
      averageSeverity: calculateAverageSeverity(categoryInsights)
    };
  }).sort((a, b) => b.totalIssues - a.totalIssues);
}

/**
 * Calculate average severity
 */
function calculateAverageSeverity(insights: TestInsight[]): number {
  if (insights.length === 0) return 0;
  
  const severityMap = { low: 1, medium: 2, high: 3, critical: 4 };
  const total = insights.reduce((sum, i) => sum + severityMap[i.severity], 0);
  
  return total / insights.length;
}

/**
 * Calculate tester comparison statistics
 */
function calculateTesterComparison(insights: TestInsight[]): TesterComparison {
  const humanInsights = insights.filter(i => i.testerType === 'human');
  const aiInsights = insights.filter(i => i.testerType === 'ai');
  
  // Calculate category coverage
  const humanCoverage: Record<string, number> = {};
  const aiCoverage: Record<string, number> = {};
  
  humanInsights.forEach(i => {
    humanCoverage[i.category] = (humanCoverage[i.category] || 0) + 1;
  });
  
  aiInsights.forEach(i => {
    aiCoverage[i.category] = (aiCoverage[i.category] || 0) + 1;
  });
  
  // Find overlapping issues (similar descriptions)
  const commonIssues = findCommonIssues(humanInsights, aiInsights);
  
  return {
    humanTesters: {
      totalIssues: humanInsights.length,
      uniqueIssues: humanInsights.length - commonIssues,
      averageIssuesPerTest: humanInsights.length,
      criticalIssuesFound: humanInsights.filter(i => i.severity === 'critical').length,
      categoryCoverage: humanCoverage
    },
    aiTesters: {
      totalIssues: aiInsights.length,
      uniqueIssues: aiInsights.length - commonIssues,
      averageIssuesPerTest: aiInsights.length,
      criticalIssuesFound: aiInsights.filter(i => i.severity === 'critical').length,
      categoryCoverage: aiCoverage
    },
    overlap: {
      commonIssues,
      humanOnlyIssues: humanInsights.length - commonIssues,
      aiOnlyIssues: aiInsights.length - commonIssues
    }
  };
}

/**
 * Find common issues between human and AI testers
 */
function findCommonIssues(humanInsights: TestInsight[], aiInsights: TestInsight[]): number {
  let commonCount = 0;
  
  humanInsights.forEach(human => {
    const hasMatch = aiInsights.some(ai => 
      ai.category === human.category &&
      ai.location === human.location &&
      similarText(ai.description, human.description)
    );
    
    if (hasMatch) commonCount++;
  });
  
  return commonCount;
}

/**
 * Check if two texts are similar
 */
function similarText(text1: string, text2: string): boolean {
  const words1 = text1.toLowerCase().split(/\s+/);
  const words2 = text2.toLowerCase().split(/\s+/);
  
  const commonWords = words1.filter(w => words2.includes(w));
  const similarity = commonWords.length / Math.max(words1.length, words2.length);
  
  return similarity > 0.5;
}

/**
 * Generate executive summary
 */
function generateSummary(insights: TestInsight[], categoryBreakdown: CategoryStats[]) {
  const criticalIssues = insights.filter(i => i.severity === 'critical').length;
  const highIssues = insights.filter(i => i.severity === 'high').length;
  
  // Calculate overall score (0-100)
  const maxPossibleIssues = 50; // Assume 50 issues is the worst case
  const severityWeight = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
  };
  
  const weightedIssues = insights.reduce((sum, i) => sum + severityWeight[i.severity], 0);
  const maxWeightedScore = maxPossibleIssues * 4;
  const overallScore = Math.max(0, Math.round(100 - (weightedIssues / maxWeightedScore) * 100));
  
  // Top concerns (categories with most issues)
  const topConcerns = categoryBreakdown
    .filter(c => c.totalIssues > 0)
    .slice(0, 3)
    .map(c => `${c.category} (${c.totalIssues} issues)`);
  
  // Strengths (categories with no or few issues)
  const strengths = categoryBreakdown
    .filter(c => c.totalIssues <= 2)
    .map(c => c.category);
  
  return {
    totalIssues: insights.length,
    criticalIssues,
    overallScore,
    topConcerns,
    strengths: strengths.length > 0 ? strengths : ['No major strengths identified']
  };
}

/**
 * Generate prioritized recommendations
 */
function generateRecommendations(insights: TestInsight[], categoryBreakdown: CategoryStats[]) {
  const critical = insights.filter(i => i.severity === 'critical');
  const high = insights.filter(i => i.severity === 'high');
  
  return {
    immediate: critical.slice(0, 5).map(i => i.recommendation),
    shortTerm: high.slice(0, 5).map(i => i.recommendation),
    longTerm: categoryBreakdown
      .filter(c => c.totalIssues > 0)
      .slice(0, 3)
      .map(c => `Improve overall ${c.category.toLowerCase()} (${c.totalIssues} issues found)`)
  };
}

/**
 * Calculate test duration
 */
function calculateDuration(testRun: any): number {
  if (!testRun?.completed_at || !testRun?.created_at) return 0;
  
  const start = new Date(testRun.created_at).getTime();
  const end = new Date(testRun.completed_at).getTime();
  
  return Math.round((end - start) / 1000); // seconds
}

/**
 * Export report as PDF-ready HTML
 */
export function generateReportHTML(report: TestReport): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Test Report - ${report.testTitle}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 1200px; margin: 0 auto; padding: 40px; color: #1e293b; }
    h1 { color: #0f172a; border-bottom: 3px solid #3b82f6; padding-bottom: 10px; }
    h2 { color: #334155; margin-top: 40px; }
    .summary { background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .score { font-size: 48px; font-weight: bold; color: ${report.summary.overallScore >= 80 ? '#10b981' : report.summary.overallScore >= 60 ? '#f59e0b' : '#ef4444'}; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin: 20px 0; }
    .stat-card { background: white; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; }
    .stat-label { color: #64748b; font-size: 14px; text-transform: uppercase; }
    .stat-value { font-size: 32px; font-weight: bold; color: #0f172a; }
    .category-bar { height: 30px; background: #e2e8f0; border-radius: 4px; margin: 10px 0; position: relative; }
    .category-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #8b5cf6); border-radius: 4px; }
    .severity-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: bold; margin: 2px; }
    .critical { background: #fee2e2; color: #991b1b; }
    .high { background: #fed7aa; color: #9a3412; }
    .medium { background: #fef3c7; color: #92400e; }
    .low { background: #e0e7ff; color: #3730a3; }
    .insight-card { background: white; border-left: 4px solid #3b82f6; padding: 15px; margin: 10px 0; border-radius: 4px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .comparison-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .comparison-table th, .comparison-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
    .comparison-table th { background: #f8fafc; font-weight: 600; }
    .tester-badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
    .human-badge { background: #dbeafe; color: #1e40af; }
    .ai-badge { background: #e9d5ff; color: #6b21a8; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>Test Report: ${report.testTitle}</h1>
  
  <div class="summary">
    <p><strong>Test URL:</strong> ${report.testUrl}</p>
    <p><strong>Test Date:</strong> ${report.testDate.toLocaleDateString()}</p>
    <p><strong>Duration:</strong> ${Math.floor(report.duration / 60)}m ${report.duration % 60}s</p>
  </div>

  <h2>Executive Summary</h2>
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">Overall Score</div>
      <div class="score">${report.summary.overallScore}/100</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Total Issues</div>
      <div class="stat-value">${report.summary.totalIssues}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Critical Issues</div>
      <div class="stat-value" style="color: #ef4444;">${report.summary.criticalIssues}</div>
    </div>
  </div>

  <h3>Top Concerns</h3>
  <ul>
    ${report.summary.topConcerns.map(c => `<li>${c}</li>`).join('')}
  </ul>

  <h3>Strengths</h3>
  <ul>
    ${report.summary.strengths.map(s => `<li>${s}</li>`).join('')}
  </ul>

  <h2>Issues by Category</h2>
  ${report.categoryBreakdown.map(cat => `
    <div style="margin: 30px 0;">
      <h3>${cat.category} - ${cat.totalIssues} issues (${cat.percentageOfTotal.toFixed(1)}%)</h3>
      <div class="category-bar">
        <div class="category-fill" style="width: ${cat.percentageOfTotal}%;"></div>
      </div>
      <p>
        <span class="severity-badge critical">${cat.criticalIssues} Critical</span>
        <span class="severity-badge high">${cat.highIssues} High</span>
        <span class="severity-badge medium">${cat.mediumIssues} Medium</span>
        <span class="severity-badge low">${cat.lowIssues} Low</span>
      </p>
      <p>
        <span class="tester-badge human-badge">Human: ${cat.humanFound}</span>
        <span class="tester-badge ai-badge">AI: ${cat.aiFound}</span>
      </p>
    </div>
  `).join('')}

  <h2>Human vs AI Tester Comparison</h2>
  <table class="comparison-table">
    <thead>
      <tr>
        <th>Metric</th>
        <th>Human Testers</th>
        <th>AI Testers</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Total Issues Found</td>
        <td>${report.testerComparison.humanTesters.totalIssues}</td>
        <td>${report.testerComparison.aiTesters.totalIssues}</td>
      </tr>
      <tr>
        <td>Unique Issues</td>
        <td>${report.testerComparison.humanTesters.uniqueIssues}</td>
        <td>${report.testerComparison.aiTesters.uniqueIssues}</td>
      </tr>
      <tr>
        <td>Critical Issues</td>
        <td>${report.testerComparison.humanTesters.criticalIssuesFound}</td>
        <td>${report.testerComparison.aiTesters.criticalIssuesFound}</td>
      </tr>
      <tr>
        <td>Common Issues</td>
        <td colspan="2" style="text-align: center;">${report.testerComparison.overlap.commonIssues}</td>
      </tr>
    </tbody>
  </table>

  <h2>Prioritized Recommendations</h2>
  
  <h3>🔴 Immediate Action Required</h3>
  <ol>
    ${report.recommendations.immediate.map(r => `<li>${r}</li>`).join('')}
  </ol>

  <h3>🟡 Short-term Improvements</h3>
  <ol>
    ${report.recommendations.shortTerm.map(r => `<li>${r}</li>`).join('')}
  </ol>

  <h3>🟢 Long-term Enhancements</h3>
  <ol>
    ${report.recommendations.longTerm.map(r => `<li>${r}</li>`).join('')}
  </ol>

  <h2>Detailed Findings</h2>
  ${report.insights.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  }).map(insight => `
    <div class="insight-card">
      <div style="display: flex; justify-content: space-between; align-items: start;">
        <div>
          <h4 style="margin: 0 0 10px 0;">${insight.title}</h4>
          <span class="severity-badge ${insight.severity}">${insight.severity.toUpperCase()}</span>
          <span class="tester-badge ${insight.testerType === 'human' ? 'human-badge' : 'ai-badge'}">
            ${insight.testerType === 'human' ? '👤 ' : '🤖 '}${insight.testerName}
          </span>
        </div>
        <div style="text-align: right; color: #64748b; font-size: 14px;">
          ${insight.category}
        </div>
      </div>
      <p style="margin: 10px 0;"><strong>Location:</strong> ${insight.location}</p>
      <p style="margin: 10px 0;">${insight.description}</p>
      <p style="margin: 10px 0; padding: 10px; background: #f8fafc; border-radius: 4px;">
        <strong>💡 Recommendation:</strong> ${insight.recommendation}
      </p>
      ${insight.screenshotUrl ? `<p><a href="${insight.screenshotUrl}" target="_blank">View Screenshot →</a></p>` : ''}
    </div>
  `).join('')}

  <footer style="margin-top: 60px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #64748b; text-align: center;">
    <p>Generated by HitlAI on ${new Date().toLocaleString()}</p>
  </footer>
</body>
</html>
  `;
}
