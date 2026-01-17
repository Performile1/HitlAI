'use client'

export const dynamic = 'force-dynamic'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, Package, TrendingUp, DollarSign } from 'lucide-react'

export default function CompanyBillingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent mb-2">
            Billing & Credits
          </h1>
          <p className="text-slate-600">Manage your testing credits and subscription</p>
        </div>

        {/* Current Plan */}
        <Card className="mb-6 border-blue-200 bg-gradient-to-br from-blue-50 to-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              Current Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-white rounded-lg border border-blue-100">
                <div className="text-sm text-slate-600 mb-1">Plan Type</div>
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Pro</div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-blue-100">
                <div className="text-sm text-slate-600 mb-1">Monthly Quota</div>
                <div className="text-2xl font-bold text-slate-900">100 tests</div>
              </div>
              <div className="p-4 bg-white rounded-lg border border-blue-100">
                <div className="text-sm text-slate-600 mb-1">Tests Used</div>
                <div className="text-2xl font-bold text-slate-900">15 / 100</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Credit Packages */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Starter Pack</CardTitle>
              <CardDescription>Perfect for small teams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">$500</div>
              <ul className="space-y-2 mb-6 text-sm text-slate-600">
                <li>✓ 100 credits</li>
                <li>✓ 20% AI, 80% Human</li>
                <li>✓ Standard support</li>
              </ul>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">
                Purchase
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow border-blue-200">
            <CardHeader>
              <CardTitle>Growth Pack</CardTitle>
              <CardDescription>Most popular choice</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">$2,000</div>
              <ul className="space-y-2 mb-6 text-sm text-slate-600">
                <li>✓ 500 credits</li>
                <li>✓ 50% AI, 50% Human</li>
                <li>✓ Priority support</li>
              </ul>
              <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">
                Purchase
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle>Enterprise</CardTitle>
              <CardDescription>Custom solutions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">Custom</div>
              <ul className="space-y-2 mb-6 text-sm text-slate-600">
                <li>✓ Custom credits</li>
                <li>✓ Custom AI/Human ratio</li>
                <li>✓ Dedicated support</li>
              </ul>
              <Button variant="outline" className="w-full">
                Contact Sales
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Usage Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Usage Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-white rounded-lg border border-blue-100">
                <div className="text-sm text-slate-600 mb-1">AI Tests</div>
                <div className="text-2xl font-bold text-blue-600">5</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-emerald-50 to-white rounded-lg border border-emerald-100">
                <div className="text-sm text-slate-600 mb-1">Human Tests</div>
                <div className="text-2xl font-bold text-emerald-600">10</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-purple-50 to-white rounded-lg border border-purple-100">
                <div className="text-sm text-slate-600 mb-1">Total Spend</div>
                <div className="text-2xl font-bold text-purple-600">$275</div>
              </div>
              <div className="p-4 bg-gradient-to-br from-orange-50 to-white rounded-lg border border-orange-100">
                <div className="text-sm text-slate-600 mb-1">Avg Cost/Test</div>
                <div className="text-2xl font-bold text-orange-600">$18.33</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
