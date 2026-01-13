'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, Zap, Brain } from 'lucide-react'

export default function TesterEarningsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900 bg-clip-text text-transparent mb-2">
            Earnings Dashboard
          </h1>
          <p className="text-slate-600">Track your active and passive income</p>
        </div>

        {/* Total Earnings Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-emerald-900">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                Total Earnings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                $1,778
              </div>
              <p className="text-sm text-slate-600 mt-2">All-time earnings</p>
            </CardContent>
          </Card>

          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-900">
                <Zap className="w-5 h-5 text-blue-600" />
                Active Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                $1,778
              </div>
              <p className="text-sm text-slate-600 mt-2">From 127 tests completed</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-900">
                <Brain className="w-5 h-5 text-purple-600" />
                Passive Income
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                $0
              </div>
              <p className="text-sm text-slate-600 mt-2">From AI training revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Breakdown */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              Earnings Breakdown
            </CardTitle>
            <CardDescription>Detailed view of your income sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-white rounded-lg border border-emerald-100">
                <div className="text-sm text-slate-600 mb-1">Tests Completed</div>
                <div className="text-2xl font-bold text-emerald-600">127</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                <div className="text-sm text-slate-600 mb-1">Avg Per Test</div>
                <div className="text-2xl font-bold text-blue-600">$14.00</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-white rounded-lg border border-purple-100">
                <div className="text-sm text-slate-600 mb-1">AI Personas Trained</div>
                <div className="text-2xl font-bold text-purple-600">0</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-50 to-white rounded-lg border border-orange-100">
                <div className="text-sm text-slate-600 mb-1">Current Tier</div>
                <div className="text-lg font-bold text-orange-600">Expert</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Training Revenue Potential */}
        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-900">
              <Brain className="w-5 h-5 text-purple-600" />
              AI Training Revenue Potential
            </CardTitle>
            <CardDescription>Start earning passive income by training AI personas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border border-purple-100">
                <h4 className="font-semibold text-purple-900 mb-2">How It Works</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>✓ Complete tests to train AI personas</li>
                  <li>✓ Earn revenue share when your trained AI runs tests</li>
                  <li>✓ 10% of each AI test goes to trainers</li>
                  <li>✓ Passive income that grows over time</li>
                </ul>
              </div>
              <div className="p-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">Example Earnings</h4>
                <p className="text-sm text-purple-800">
                  Train an AI with 60 tests (60% contribution) → AI runs 1,000 tests/month → 
                  Earn <span className="font-bold">$300/month passive income</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
