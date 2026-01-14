'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Brain } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Persona {
  id: string
  name: string
  age: number
  tech_literacy: string
  image_url?: string
}

export default function NewTestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [companyId, setCompanyId] = useState<string>('')
  const [personas, setPersonas] = useState<Persona[]>([])
  
  const [formData, setFormData] = useState({
    title: '',
    url: '',
    mission: '',
    testType: 'ai_only' as 'ai_only' | 'human_only' | 'hybrid',
    aiHumanRatio: 100, // 0 = 100% Human, 100 = 100% AI
    selectedPersonas: [] as string[],
    testDimensions: ['happy_path', 'negative_testing', 'accessibility'] as string[],
    requiredTesters: 3,
    totalTests: 5
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/company/login')
        return
      }

      const { data: membership } = await supabase
        .from('company_members')
        .select('company_id')
        .eq('user_id', user.id)
        .single()

      if (!membership) return
      setCompanyId(membership.company_id)

      // Load available personas
      const { data: personasData } = await supabase
        .from('personas')
        .select('*')
        .eq('is_public', true)
        .order('name')

      setPersonas(personasData || [])
      
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Create test request
      const { data: testRequest, error } = await supabase
        .from('test_requests')
        .insert({
          company_id: companyId,
          title: formData.title,
          url: formData.url,
          mission: formData.mission,
          test_type: formData.testType,
          personas: formData.selectedPersonas.map(id => ({ id })),
          test_dimensions: formData.testDimensions,
          required_testers: Math.round((100 - formData.aiHumanRatio) / 100 * formData.totalTests),
          required_ai_testers: Math.round(formData.aiHumanRatio / 100 * formData.totalTests),
          total_tests: formData.totalTests,
          ai_human_ratio: formData.aiHumanRatio,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

      // Trigger test execution via API
      await fetch('/api/test-requests/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testRequestId: testRequest.id })
      })

      router.push(`/company/tests/${testRequest.id}`)
      
    } catch (error: any) {
      alert('Failed to create test: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const togglePersona = (personaId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedPersonas: prev.selectedPersonas.includes(personaId)
        ? prev.selectedPersonas.filter(id => id !== personaId)
        : [...prev.selectedPersonas, personaId]
    }))
  }

  const toggleDimension = (dimension: string) => {
    setFormData(prev => ({
      ...prev,
      testDimensions: prev.testDimensions.includes(dimension)
        ? prev.testDimensions.filter(d => d !== dimension)
        : [...prev.testDimensions, dimension]
    }))
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/company/dashboard" className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-6">Create New Test</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div>
              <Label htmlFor="title">Test Title</Label>
              <Input
                id="title"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="E.g., Checkout flow accessibility test"
              />
            </div>

            <div>
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                type="url"
                required
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>

            <div>
              <Label htmlFor="mission">Test Objective</Label>
              <Textarea
                id="mission"
                required
                value={formData.mission}
                onChange={(e) => setFormData({ ...formData, mission: e.target.value })}
                placeholder="E.g., Navigate to checkout and complete purchase with test credit card"
                rows={3}
              />
            </div>

            {/* AI vs Human Slider */}
            <div className="space-y-4">
              <div>
                <Label>AI vs Human Tester Mix</Label>
                <p className="text-xs text-slate-500 mt-1">
                  Slide to choose your ideal balance between speed (AI) and human insight
                </p>
              </div>
              
              <div className="bg-gradient-to-r from-green-50 via-purple-50 to-blue-50 p-6 rounded-xl border-2 border-slate-200">
                {/* Slider */}
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={formData.aiHumanRatio}
                    onChange={(e) => {
                      const ratio = parseInt(e.target.value)
                      setFormData({ 
                        ...formData, 
                        aiHumanRatio: ratio,
                        testType: ratio === 100 ? 'ai_only' : ratio === 0 ? 'human_only' : 'hybrid'
                      })
                    }}
                    className="w-full h-3 bg-gradient-to-r from-green-400 via-purple-400 to-blue-400 rounded-lg appearance-none cursor-pointer slider"
                    style={{
                      background: `linear-gradient(to right, #10b981 0%, #10b981 ${100 - formData.aiHumanRatio}%, #3b82f6 ${100 - formData.aiHumanRatio}%, #3b82f6 100%)`
                    }}
                  />
                  
                  {/* Labels */}
                  <div className="flex justify-between mt-2 text-xs font-medium">
                    <span className="text-green-700">👤 100% Human</span>
                    <span className="text-purple-700">⚖️ Hybrid</span>
                    <span className="text-blue-700">🤖 100% AI</span>
                  </div>
                </div>

                {/* Current Selection Display */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-lg border border-green-200">
                    <div className="text-2xl font-black text-green-600">
                      {Math.round((100 - formData.aiHumanRatio) / 100 * formData.totalTests)}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">Human Testers</div>
                    <div className="text-xs text-slate-500">@$25 each = ${Math.round((100 - formData.aiHumanRatio) / 100 * formData.totalTests) * 25}</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg border border-blue-200">
                    <div className="text-2xl font-black text-blue-600">
                      {Math.round(formData.aiHumanRatio / 100 * formData.totalTests)}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">AI Testers</div>
                    <div className="text-xs text-slate-500">@$5 each = ${Math.round(formData.aiHumanRatio / 100 * formData.totalTests) * 5}</div>
                  </div>
                </div>

                {/* Total Cost */}
                <div className="mt-4 p-4 bg-slate-900 text-white rounded-lg text-center">
                  <div className="text-sm text-slate-400">Total Estimated Cost</div>
                  <div className="text-3xl font-black">
                    ${Math.round((100 - formData.aiHumanRatio) / 100 * formData.totalTests) * 25 + Math.round(formData.aiHumanRatio / 100 * formData.totalTests) * 5}
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {formData.totalTests} total tests • {Math.round(100 - formData.aiHumanRatio)}% human, {Math.round(formData.aiHumanRatio)}% AI
                  </div>
                </div>
              </div>

              {/* Total Tests Input */}
              <div>
                <Label htmlFor="totalTests">Total Number of Tests</Label>
                <Input
                  id="totalTests"
                  type="number"
                  min="1"
                  max="20"
                  value={formData.totalTests}
                  onChange={(e) => setFormData({ ...formData, totalTests: parseInt(e.target.value) || 1 })}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Recommended: 5-10 tests for comprehensive coverage
                </p>
              </div>
            </div>

            {/* Personas */}
            <div>
              <Label>Select Personas ({formData.selectedPersonas.length} selected)</Label>
              <p className="text-xs text-slate-500 mt-1 mb-3">
                {formData.mission ? (
                  <span className="text-blue-600">💡 Personas are filtered based on your test objective</span>
                ) : (
                  <span>Add a test objective above to see recommended personas</span>
                )}
              </p>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {personas
                  .filter(persona => {
                    // Filter personas based on test objective keywords
                    if (!formData.mission) return true
                    const mission = formData.mission.toLowerCase()
                    const literacy = persona.tech_literacy.toLowerCase()
                    
                    // Accessibility tests - include all literacy levels
                    if (mission.includes('accessibility') || mission.includes('wcag')) {
                      return true
                    }
                    
                    // E-commerce/checkout - prefer medium to high literacy
                    if (mission.includes('checkout') || mission.includes('purchase') || mission.includes('cart')) {
                      return literacy !== 'low'
                    }
                    
                    // Senior/elderly focused - prefer low to medium literacy
                    if (mission.includes('senior') || mission.includes('elderly') || mission.includes('60+')) {
                      return literacy !== 'high' && persona.age >= 55
                    }
                    
                    // Tech/developer focused - prefer high literacy
                    if (mission.includes('developer') || mission.includes('technical') || mission.includes('api')) {
                      return literacy === 'high'
                    }
                    
                    // Mobile/app - prefer medium to high
                    if (mission.includes('mobile') || mission.includes('app')) {
                      return literacy !== 'low'
                    }
                    
                    return true // Show all by default
                  })
                  .map((persona) => (
                    <button
                      key={persona.id}
                      type="button"
                      onClick={() => togglePersona(persona.id)}
                      className={`p-4 rounded-lg border-2 transition text-left ${
                        formData.selectedPersonas.includes(persona.id)
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <p className="font-semibold text-slate-900">{persona.name}</p>
                      <p className="text-xs text-slate-600">
                        Age {persona.age} • {persona.tech_literacy} tech literacy
                      </p>
                    </button>
                  ))}
              </div>
              {personas.filter(p => {
                if (!formData.mission) return true
                const mission = formData.mission.toLowerCase()
                const literacy = p.tech_literacy.toLowerCase()
                if (mission.includes('accessibility') || mission.includes('wcag')) return true
                if (mission.includes('checkout') || mission.includes('purchase') || mission.includes('cart')) return literacy !== 'low'
                if (mission.includes('senior') || mission.includes('elderly') || mission.includes('60+')) return literacy !== 'high' && p.age >= 55
                if (mission.includes('developer') || mission.includes('technical') || mission.includes('api')) return literacy === 'high'
                if (mission.includes('mobile') || mission.includes('app')) return literacy !== 'low'
                return true
              }).length === 0 && (
                <p className="text-sm text-amber-600 mt-2">⚠️ No personas match your objective. Try adjusting your test description.</p>
              )}
            </div>

            {/* Test Dimensions */}
            <div>
              <Label>Test Dimensions</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {[
                  { id: 'happy_path', label: 'Happy Path' },
                  { id: 'negative_testing', label: 'Negative Testing' },
                  { id: 'boundary_analysis', label: 'Boundary Analysis' },
                  { id: 'accessibility', label: 'Accessibility' },
                  { id: 'race_conditions', label: 'Race Conditions' },
                  { id: 'data_persistence', label: 'Data Persistence' }
                ].map((dim) => (
                  <label key={dim.id} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.testDimensions.includes(dim.id)}
                      onChange={() => toggleDimension(dim.id)}
                      className="rounded border-slate-300"
                    />
                    <span className="text-sm text-slate-700">{dim.label}</span>
                  </label>
                ))}
              </div>
            </div>


            <div className="flex justify-end space-x-4 pt-6 border-t">
              <Link href="/company/dashboard">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button 
                type="submit" 
                disabled={loading || formData.selectedPersonas.length === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading ? 'Creating...' : 'Create Test'}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
