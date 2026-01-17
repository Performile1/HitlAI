'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Settings, DollarSign, Users, Brain, TrendingUp, AlertCircle } from 'lucide-react'

interface PlatformSettings {
  id: string
  default_ai_percentage: number
  default_human_percentage: number
  allow_custom_ratio: boolean
  min_human_tests_per_batch: number
  human_test_price: number
  ai_test_price: number
  platform_fee_percent: number
  hitlai_funded_enabled: boolean
  hitlai_monthly_budget: number
  cash_payment_enabled: boolean
  equity_payment_enabled: boolean
  hybrid_payment_enabled: boolean
  equity_shares_per_test: number
  auto_retrain_threshold: number
  confidence_threshold: number
  human_tester_flag_threshold: number
  human_tester_disable_threshold: number
  ai_tester_flag_threshold: number
  ai_tester_disable_threshold: number
  min_ratings_before_action: number
}

interface BudgetStatus {
  monthly_budget: number
  current_spend: number
  remaining_budget: number
  spend_percent: number
  reset_date: string
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings | null>(null)
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (!response.ok) throw new Error('Failed to fetch settings')
      
      const data = await response.json()
      setSettings(data.settings)
      setBudgetStatus(data.budgetStatus)
    } catch (error) {
      console.error('Error fetching settings:', error)
      setMessage('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!settings) return

    setSaving(true)
    setMessage('')

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save settings')
      }

      setMessage('Settings saved successfully!')
      setTimeout(() => setMessage(''), 3000)
    } catch (error: any) {
      console.error('Error saving settings:', error)
      setMessage(error.message || 'Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const handleAiPercentageChange = (value: number[]) => {
    if (!settings) return
    setSettings({
      ...settings,
      default_ai_percentage: value[0],
      default_human_percentage: 100 - value[0]
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Settings className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-slate-600">Loading settings...</p>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-600">Failed to load settings</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Platform Settings</h1>
          <p className="text-slate-600">Configure AI/Human ratios, pricing, and HitlAI-funded tests</p>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message}
          </div>
        )}

        <div className="grid gap-6">
          {/* AI/Human Ratio Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-600" />
                AI/Human Ratio Settings
              </CardTitle>
              <CardDescription>Configure default testing mix and requirements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="mb-4 block">
                  Default AI Percentage: {settings.default_ai_percentage}% AI / {settings.default_human_percentage}% Human
                </Label>
                <Slider
                  value={[settings.default_ai_percentage]}
                  onValueChange={handleAiPercentageChange}
                  min={0}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-slate-500 mt-2">
                  <span>0% AI</span>
                  <span>50%</span>
                  <span>100% AI</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Allow Custom Ratio</Label>
                  <p className="text-sm text-slate-500">Let companies customize their AI/human mix</p>
                </div>
                <Switch
                  checked={settings.allow_custom_ratio}
                  onCheckedChange={(checked) => setSettings({ ...settings, allow_custom_ratio: checked })}
                />
              </div>

              <div>
                <Label htmlFor="min_human_tests">Minimum Human Tests per Batch</Label>
                <p className="text-sm text-slate-500 mb-2">Required for AI learning</p>
                <Input
                  id="min_human_tests"
                  type="number"
                  value={settings.min_human_tests_per_batch}
                  onChange={(e) => setSettings({ ...settings, min_human_tests_per_batch: parseInt(e.target.value) })}
                  min={1}
                  max={100}
                />
              </div>
            </CardContent>
          </Card>

          {/* Pricing Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                Pricing Settings
              </CardTitle>
              <CardDescription>Configure test pricing and platform fees</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="human_price">Human Test Price ($)</Label>
                  <Input
                    id="human_price"
                    type="number"
                    step="0.01"
                    value={settings.human_test_price}
                    onChange={(e) => setSettings({ ...settings, human_test_price: parseFloat(e.target.value) })}
                  />
                </div>
                <div>
                  <Label htmlFor="ai_price">AI Test Price ($)</Label>
                  <Input
                    id="ai_price"
                    type="number"
                    step="0.01"
                    value={settings.ai_test_price}
                    onChange={(e) => setSettings({ ...settings, ai_test_price: parseFloat(e.target.value) })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="platform_fee">Platform Fee (%)</Label>
                <p className="text-sm text-slate-500 mb-2">Percentage taken from human test payments</p>
                <Input
                  id="platform_fee"
                  type="number"
                  value={settings.platform_fee_percent}
                  onChange={(e) => setSettings({ ...settings, platform_fee_percent: parseInt(e.target.value) })}
                  min={0}
                  max={100}
                />
              </div>
            </CardContent>
          </Card>

          {/* HitlAI-Funded Tests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                HitlAI-Funded Tests
              </CardTitle>
              <CardDescription>Configure platform-funded testing for AI training</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable HitlAI-Funded Tests</Label>
                  <p className="text-sm text-slate-500">Allow platform to fund tests for AI training</p>
                </div>
                <Switch
                  checked={settings.hitlai_funded_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, hitlai_funded_enabled: checked })}
                />
              </div>

              {settings.hitlai_funded_enabled && (
                <>
                  <div>
                    <Label htmlFor="monthly_budget">Monthly Budget ($)</Label>
                    <Input
                      id="monthly_budget"
                      type="number"
                      step="100"
                      value={settings.hitlai_monthly_budget}
                      onChange={(e) => setSettings({ ...settings, hitlai_monthly_budget: parseFloat(e.target.value) })}
                    />
                  </div>

                  {budgetStatus && (
                    <div className="bg-slate-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Current Budget Status</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Monthly Budget:</span>
                          <span className="font-medium">${budgetStatus.monthly_budget.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Current Spend:</span>
                          <span className="font-medium">${budgetStatus.current_spend.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Remaining:</span>
                          <span className="font-medium text-green-600">${budgetStatus.remaining_budget.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${budgetStatus.spend_percent}%` }}
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {budgetStatus.spend_percent.toFixed(1)}% of budget used
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <Label>Payment Options for Testers</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="cash_payment">Cash Payment</Label>
                        <Switch
                          id="cash_payment"
                          checked={settings.cash_payment_enabled}
                          onCheckedChange={(checked) => setSettings({ ...settings, cash_payment_enabled: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="equity_payment">Equity Payment</Label>
                        <Switch
                          id="equity_payment"
                          checked={settings.equity_payment_enabled}
                          onCheckedChange={(checked) => setSettings({ ...settings, equity_payment_enabled: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="hybrid_payment">Hybrid Payment</Label>
                        <Switch
                          id="hybrid_payment"
                          checked={settings.hybrid_payment_enabled}
                          onCheckedChange={(checked) => setSettings({ ...settings, hybrid_payment_enabled: checked })}
                        />
                      </div>
                    </div>

                    {settings.equity_payment_enabled && (
                      <div>
                        <Label htmlFor="equity_shares">Equity Shares per Test</Label>
                        <Input
                          id="equity_shares"
                          type="number"
                          value={settings.equity_shares_per_test}
                          onChange={(e) => setSettings({ ...settings, equity_shares_per_test: parseInt(e.target.value) })}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Rating Monitoring Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                Rating Monitoring & Auto-Disable
              </CardTitle>
              <CardDescription>Configure automatic flagging and disabling thresholds for low-rated testers</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900">Human Tester Thresholds</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="human_flag_threshold">Flag Threshold (out of 5.0)</Label>
                    <p className="text-sm text-slate-500 mb-2">Testers below this rating get flagged for review</p>
                    <Input
                      id="human_flag_threshold"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={settings.human_tester_flag_threshold || 3.5}
                      onChange={(e) => setSettings({ ...settings, human_tester_flag_threshold: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="human_disable_threshold">Auto-Disable Threshold (out of 5.0)</Label>
                    <p className="text-sm text-slate-500 mb-2">Testers below this rating get auto-disabled</p>
                    <Input
                      id="human_disable_threshold"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={settings.human_tester_disable_threshold || 2.5}
                      onChange={(e) => setSettings({ ...settings, human_tester_disable_threshold: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900">AI Tester Thresholds</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="ai_flag_threshold">Flag Threshold (0.00 - 1.00)</Label>
                    <p className="text-sm text-slate-500 mb-2">AI accuracy below this gets flagged for retraining</p>
                    <Input
                      id="ai_flag_threshold"
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={settings.ai_tester_flag_threshold || 0.75}
                      onChange={(e) => setSettings({ ...settings, ai_tester_flag_threshold: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="ai_disable_threshold">Auto-Disable Threshold (0.00 - 1.00)</Label>
                    <p className="text-sm text-slate-500 mb-2">AI accuracy below this gets auto-disabled</p>
                    <Input
                      id="ai_disable_threshold"
                      type="number"
                      step="0.01"
                      min="0"
                      max="1"
                      value={settings.ai_tester_disable_threshold || 0.60}
                      onChange={(e) => setSettings({ ...settings, ai_tester_disable_threshold: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="min_ratings">Minimum Ratings Before Action</Label>
                <p className="text-sm text-slate-500 mb-2">Minimum number of ratings/tests before flagging or disabling</p>
                <Input
                  id="min_ratings"
                  type="number"
                  min="1"
                  value={settings.min_ratings_before_action || 5}
                  onChange={(e) => setSettings({ ...settings, min_ratings_before_action: parseInt(e.target.value) })}
                />
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-orange-900">
                  <strong>Note:</strong> Flagged testers appear in the Flagged Testers dashboard. Auto-disabled testers are immediately marked unavailable and cannot accept new tests.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* AI Learning Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                AI Learning Settings
              </CardTitle>
              <CardDescription>Configure AI training and retraining parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="retrain_threshold">Auto-Retrain Threshold</Label>
                <p className="text-sm text-slate-500 mb-2">Retrain AI after N new human tests</p>
                <Input
                  id="retrain_threshold"
                  type="number"
                  value={settings.auto_retrain_threshold}
                  onChange={(e) => setSettings({ ...settings, auto_retrain_threshold: parseInt(e.target.value) })}
                />
              </div>

              <div>
                <Label htmlFor="confidence_threshold">Confidence Threshold</Label>
                <p className="text-sm text-slate-500 mb-2">Minimum confidence score (0.00 - 1.00)</p>
                <Input
                  id="confidence_threshold"
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  value={settings.confidence_threshold}
                  onChange={(e) => setSettings({ ...settings, confidence_threshold: parseFloat(e.target.value) })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={saving}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
