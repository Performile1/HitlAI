'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { generateTestReport, TestReport } from '@/lib/services/testReportGenerator';
import { Download, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, Users, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function TestReportPage() {
  const params = useParams();
  const [report, setReport] = useState<TestReport | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    loadReport();
  }, [params.id]);

  async function loadReport() {
    try {
      const testReport = await generateTestReport(params.id as string, supabase);
      setReport(testReport);
    } catch (error) {
      console.error('Failed to load report:', error);
    } finally {
      setLoading(false);
    }
  }

  const downloadReport = async () => {
    if (!report) return;

    const { generateReportHTML } = await import('@/lib/services/testReportGenerator');
    const html = generateReportHTML(report);
    
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-report-${report.testRunId}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600 text-xl">Loading report...</div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-600 text-xl">Report not found</div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-amber-600';
    return 'text-rose-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 border-emerald-200';
    if (score >= 60) return 'bg-amber-50 border-amber-200';
    return 'bg-rose-50 border-rose-200';
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{report.testTitle}</h1>
              <p className="text-slate-600 mt-2">{report.testUrl}</p>
              <div className="flex gap-4 mt-3 text-sm text-slate-500">
                <span>📅 {report.testDate.toLocaleDateString()}</span>
                <span>⏱️ {Math.floor(report.duration / 60)}m {report.duration % 60}s</span>
                <span>🔍 {report.insights.length} insights</span>
              </div>
            </div>
            <Button onClick={downloadReport} className="bg-indigo-600 hover:bg-indigo-700">
              <Download className="w-4 h-4 mr-2" />
              Download Report
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Executive Summary */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Executive Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Overall Score */}
            <div className={`p-6 rounded-lg border-2 ${getScoreBgColor(report.summary.overallScore)}`}>
              <div className="text-sm font-semibold text-slate-600 mb-2">Overall Score</div>
              <div className={`text-5xl font-bold ${getScoreColor(report.summary.overallScore)}`}>
                {report.summary.overallScore}
                <span className="text-2xl">/100</span>
              </div>
              <div className="mt-2 text-sm text-slate-600">
                {report.summary.overallScore >= 80 ? '✅ Excellent' : 
                 report.summary.overallScore >= 60 ? '⚠️ Needs Improvement' : 
                 '🚨 Critical Issues'}
              </div>
            </div>

            {/* Total Issues */}
            <div className="p-6 rounded-lg border-2 bg-blue-50 border-blue-200">
              <div className="text-sm font-semibold text-slate-600 mb-2">Total Issues</div>
              <div className="text-5xl font-bold text-blue-600">{report.summary.totalIssues}</div>
              <div className="mt-2 text-sm text-slate-600">
                Across {report.categoryBreakdown.filter(c => c.totalIssues > 0).length} categories
              </div>
            </div>

            {/* Critical Issues */}
            <div className="p-6 rounded-lg border-2 bg-rose-50 border-rose-200">
              <div className="text-sm font-semibold text-slate-600 mb-2">Critical Issues</div>
              <div className="text-5xl font-bold text-rose-600">{report.summary.criticalIssues}</div>
              <div className="mt-2 text-sm text-slate-600">
                Require immediate attention
              </div>
            </div>
          </div>

          {/* Top Concerns & Strengths */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Top Concerns
              </h3>
              <ul className="space-y-2">
                {report.summary.topConcerns.map((concern, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700">
                    <span className="text-amber-600 mt-1">•</span>
                    <span>{concern}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                Strengths
              </h3>
              <ul className="space-y-2">
                {report.summary.strengths.map((strength, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-slate-700">
                    <span className="text-emerald-600 mt-1">✓</span>
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Human vs AI Comparison */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Human vs AI Tester Comparison
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Human Testers */}
            <div className="p-6 rounded-lg bg-blue-50 border-2 border-blue-200">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-blue-900">Human Testers</span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-slate-600">Total Issues</div>
                  <div className="text-2xl font-bold text-blue-600">
                    {report.testerComparison.humanTesters.totalIssues}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Unique Issues</div>
                  <div className="text-xl font-semibold text-blue-700">
                    {report.testerComparison.humanTesters.uniqueIssues}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Critical Found</div>
                  <div className="text-xl font-semibold text-rose-600">
                    {report.testerComparison.humanTesters.criticalIssuesFound}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Testers */}
            <div className="p-6 rounded-lg bg-purple-50 border-2 border-purple-200">
              <div className="flex items-center gap-2 mb-4">
                <Bot className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-purple-900">AI Testers</span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-slate-600">Total Issues</div>
                  <div className="text-2xl font-bold text-purple-600">
                    {report.testerComparison.aiTesters.totalIssues}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Unique Issues</div>
                  <div className="text-xl font-semibold text-purple-700">
                    {report.testerComparison.aiTesters.uniqueIssues}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Critical Found</div>
                  <div className="text-xl font-semibold text-rose-600">
                    {report.testerComparison.aiTesters.criticalIssuesFound}
                  </div>
                </div>
              </div>
            </div>

            {/* Overlap */}
            <div className="p-6 rounded-lg bg-slate-50 border-2 border-slate-200">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-slate-600" />
                <span className="font-semibold text-slate-900">Overlap Analysis</span>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-slate-600">Common Issues</div>
                  <div className="text-2xl font-bold text-slate-700">
                    {report.testerComparison.overlap.commonIssues}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">Human Only</div>
                  <div className="text-xl font-semibold text-blue-600">
                    {report.testerComparison.overlap.humanOnlyIssues}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-600">AI Only</div>
                  <div className="text-xl font-semibold text-purple-600">
                    {report.testerComparison.overlap.aiOnlyIssues}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coverage Comparison Chart */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Category Coverage</h3>
            <div className="space-y-4">
              {report.categoryBreakdown.filter(c => c.totalIssues > 0).map(category => (
                <div key={category.category}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-medium text-slate-700">{category.category}</span>
                    <span className="text-slate-500">
                      👤 {category.humanFound} | 🤖 {category.aiFound}
                    </span>
                  </div>
                  <div className="flex gap-1 h-8">
                    <div 
                      className="bg-blue-500 rounded-l flex items-center justify-center text-white text-xs font-semibold"
                      style={{ width: `${(category.humanFound / category.totalIssues) * 100}%` }}
                    >
                      {category.humanFound > 0 && `${Math.round((category.humanFound / category.totalIssues) * 100)}%`}
                    </div>
                    <div 
                      className="bg-purple-500 rounded-r flex items-center justify-center text-white text-xs font-semibold"
                      style={{ width: `${(category.aiFound / category.totalIssues) * 100}%` }}
                    >
                      {category.aiFound > 0 && `${Math.round((category.aiFound / category.totalIssues) * 100)}%`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Issues by Category */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Issues by Category</h2>
          
          <div className="space-y-6">
            {report.categoryBreakdown.map(category => (
              <div key={category.category} className="border-l-4 border-indigo-600 pl-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">{category.category}</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {category.totalIssues} issues ({category.percentageOfTotal.toFixed(1)}% of total)
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-indigo-600">{category.totalIssues}</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-slate-200 rounded-full h-3 mb-3">
                  <div 
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full transition-all"
                    style={{ width: `${category.percentageOfTotal}%` }}
                  />
                </div>

                {/* Severity Breakdown */}
                <div className="flex gap-3 flex-wrap">
                  {category.criticalIssues > 0 && (
                    <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-semibold">
                      {category.criticalIssues} Critical
                    </span>
                  )}
                  {category.highIssues > 0 && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                      {category.highIssues} High
                    </span>
                  )}
                  {category.mediumIssues > 0 && (
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold">
                      {category.mediumIssues} Medium
                    </span>
                  )}
                  {category.lowIssues > 0 && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {category.lowIssues} Low
                    </span>
                  )}
                </div>

                {/* Tester Split */}
                <div className="mt-3 flex gap-4 text-sm">
                  <span className="text-blue-600 font-medium">👤 Human: {category.humanFound}</span>
                  <span className="text-purple-600 font-medium">🤖 AI: {category.aiFound}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Prioritized Recommendations</h2>

          {/* Immediate */}
          {report.recommendations.immediate.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-rose-700 mb-3 flex items-center gap-2">
                🔴 Immediate Action Required
              </h3>
              <ol className="space-y-2 list-decimal list-inside">
                {report.recommendations.immediate.map((rec, idx) => (
                  <li key={idx} className="text-slate-700 pl-2">{rec}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Short-term */}
          {report.recommendations.shortTerm.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-amber-700 mb-3 flex items-center gap-2">
                🟡 Short-term Improvements
              </h3>
              <ol className="space-y-2 list-decimal list-inside">
                {report.recommendations.shortTerm.map((rec, idx) => (
                  <li key={idx} className="text-slate-700 pl-2">{rec}</li>
                ))}
              </ol>
            </div>
          )}

          {/* Long-term */}
          {report.recommendations.longTerm.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                🟢 Long-term Enhancements
              </h3>
              <ol className="space-y-2 list-decimal list-inside">
                {report.recommendations.longTerm.map((rec, idx) => (
                  <li key={idx} className="text-slate-700 pl-2">{rec}</li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Detailed Findings */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Detailed Findings</h2>
          
          <div className="space-y-4">
            {report.insights
              .sort((a, b) => {
                const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                return severityOrder[a.severity] - severityOrder[b.severity];
              })
              .map(insight => (
                <div 
                  key={insight.id} 
                  className="border-l-4 border-indigo-600 bg-slate-50 p-6 rounded-r-lg"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-slate-900 mb-2">{insight.title}</h4>
                      <div className="flex gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          insight.severity === 'critical' ? 'bg-rose-100 text-rose-700' :
                          insight.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                          insight.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {insight.severity.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          insight.testerType === 'human' 
                            ? 'bg-blue-100 text-blue-700' 
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {insight.testerType === 'human' ? '👤' : '🤖'} {insight.testerName}
                        </span>
                        <span className="px-3 py-1 bg-slate-200 text-slate-700 rounded-full text-xs font-semibold">
                          {insight.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mb-2">
                    <strong>Location:</strong> {insight.location}
                  </p>

                  <p className="text-slate-700 mb-4">{insight.description}</p>

                  <div className="bg-indigo-50 border-l-4 border-indigo-600 p-4 rounded">
                    <p className="text-sm font-semibold text-indigo-900 mb-1">💡 Recommendation</p>
                    <p className="text-sm text-indigo-800">{insight.recommendation}</p>
                  </div>

                  {insight.screenshotUrl && (
                    <div className="mt-4">
                      <a 
                        href={insight.screenshotUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                      >
                        View Screenshot →
                      </a>
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
