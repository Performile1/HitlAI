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
    selectedPersonas: [] as string[],
    testDimensions: ['happy_path', 'negative_testing', 'accessibility'] as string[],
    requiredTesters: 0
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
          required_testers: formData.testType === 'ai_only' ? 0 : formData.requiredTesters,
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

            {/* Test Type */}
            <div>
              <Label>Test Type</Label>
              <div className="grid grid-cols-3 gap-4 mt-2">
                {(['ai_only', 'human_only', 'hybrid'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFormData({ ...formData, testType: type })}
                    className={`p-4 rounded-lg border-2 transition ${
                      formData.testType === type
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <p className="font-semibold text-slate-900 capitalize">
                      {type.replace('_', ' ')}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      {type === 'ai_only' && 'Fast, automated'}
                      {type === 'human_only' && 'Real user feedback'}
                      {type === 'hybrid' && 'Best of both'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Personas */}
            <div>
              <Label>Select Personas ({formData.selectedPersonas.length} selected)</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                {personas.map((persona) => (
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

            {/* Human Testers */}
            {formData.testType !== 'ai_only' && (
              <div>
                <Label htmlFor="requiredTesters">Number of Human Testers</Label>
                <Input
                  id="requiredTesters"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.requiredTesters}
                  onChange={(e) => setFormData({ ...formData, requiredTesters: parseInt(e.target.value) })}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Recommended: 3-5 testers for reliable results
                </p>
              </div>
            )}

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
