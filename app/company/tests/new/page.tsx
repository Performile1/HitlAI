'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft, Brain, Plus, Trash2 } from 'lucide-react'
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
    aiHumanRatio: 100,
    selectedPersonas: [] as string[],
    testDimensions: ['happy_path', 'negative_testing', 'accessibility'] as string[],
    requiredTesters: 3,
    totalTests: 5,
    testFixtures: {
      loginCredentials: [{ email: '', password: '', description: '' }],
      testCards: [{ number: '', expiry: '', cvc: '', name: '' }],
      coupons: [{ code: '', description: '' }],
      testData: [{ field: '', value: '', description: '' }]
    },
    testPaths: {
      happyPath: '',
      negativePaths: ['']
    }
  })

  const [aiSuggestions, setAiSuggestions] = useState<{
    happyPath?: string
    negativePaths?: string[]
    fixtures?: any
  } | null>(null)
  const [loadingSuggestions, setLoadingSuggestions] = useState(false)

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
          test_fixtures: formData.testFixtures,
          test_paths: formData.testPaths,
          status: 'pending'
        })
        .select()
        .single()

      if (error) throw error

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

  const generateAISuggestions = async () => {
    if (!formData.mission || !formData.url) {
      alert('Please fill in the test objective and URL first')
      return
    }

    setLoadingSuggestions(true)
    try {
      const response = await fetch('/api/ai/suggest-test-paths', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mission: formData.mission,
          url: formData.url,
          title: formData.title
        })
      })

      const suggestions = await response.json()
      setAiSuggestions(suggestions)
      
      if (suggestions.happyPath) {
        setFormData(prev => ({
          ...prev,
          testPaths: {
            happyPath: suggestions.happyPath,
            negativePaths: suggestions.negativePaths || prev.testPaths.negativePaths
          }
        }))
      }
    } catch (error) {
      console.error('Failed to generate suggestions:', error)
      alert('Failed to generate AI suggestions')
    } finally {
      setLoadingSuggestions(false)
    }
  }

  const addLoginCredential = () => {
    setFormData(prev => ({
      ...prev,
      testFixtures: {
        ...prev.testFixtures,
        loginCredentials: [...prev.testFixtures.loginCredentials, { email: '', password: '', description: '' }]
      }
    }))
  }

  const addTestCard = () => {
    setFormData(prev => ({
      ...prev,
      testFixtures: {
        ...prev.testFixtures,
        testCards: [...prev.testFixtures.testCards, { number: '', expiry: '', cvc: '', name: '' }]
      }
    }))
  }

  const addCoupon = () => {
    setFormData(prev => ({
      ...prev,
      testFixtures: {
        ...prev.testFixtures,
        coupons: [...prev.testFixtures.coupons, { code: '', description: '' }]
      }
    }))
  }

  const addTestData = () => {
    setFormData(prev => ({
      ...prev,
      testFixtures: {
        ...prev.testFixtures,
        testData: [...prev.testFixtures.testData, { field: '', value: '', description: '' }]
      }
    }))
  }

  const addNegativePath = () => {
    setFormData(prev => ({
      ...prev,
      testPaths: {
        ...prev.testPaths,
        negativePaths: [...prev.testPaths.negativePaths, '']
      }
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
              <div className="mt-2">
                <Button
                  type="button"
                  onClick={generateAISuggestions}
                  disabled={loadingSuggestions || !formData.mission || !formData.url}
                  variant="outline"
                  className="text-sm"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  {loadingSuggestions ? 'Generating...' : 'AI Suggest Test Paths'}
                </Button>
              </div>
            </div>

            {/* Test Paths Section */}
            <div className="border-2 border-indigo-200 rounded-lg p-6 bg-indigo-50/50">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                <span className="text-indigo-600 mr-2">🎯</span>
                Test Paths
              </h3>

              {/* Happy Path */}
              <div className="mb-4">
                <Label htmlFor="happyPath">Happy Path (Expected Flow)</Label>
                <Textarea
                  id="happyPath"
                  value={formData.testPaths.happyPath}
                  onChange={(e) => setFormData({
                    ...formData,
                    testPaths: { ...formData.testPaths, happyPath: e.target.value }
                  })}
                  placeholder="E.g., User logs in → Adds item to cart → Proceeds to checkout → Enters payment info → Completes purchase"
                  rows={2}
                  className="bg-white"
                />
              </div>

              {/* Negative Paths */}
              <div>
                <Label>Negative Paths (Edge Cases & Error Scenarios)</Label>
                {formData.testPaths.negativePaths.map((path, index) => (
                  <div key={index} className="mt-2 flex gap-2">
                    <Input
                      value={path}
                      onChange={(e) => {
                        const newPaths = [...formData.testPaths.negativePaths]
                        newPaths[index] = e.target.value
                        setFormData({
                          ...formData,
                          testPaths: { ...formData.testPaths, negativePaths: newPaths }
                        })
                      }}
                      placeholder={`E.g., Try invalid credit card, empty form submission, expired coupon`}
                      className="bg-white"
                    />
                    {formData.testPaths.negativePaths.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newPaths = formData.testPaths.negativePaths.filter((_, i) => i !== index)
                          setFormData({
                            ...formData,
                            testPaths: { ...formData.testPaths, negativePaths: newPaths }
                          })
                        }}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addNegativePath}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  + Add Negative Path
                </Button>
              </div>
            </div>

            {/* Test Fixtures Section */}
            <div className="border-2 border-emerald-200 rounded-lg p-6 bg-emerald-50/50">
              <h3 className="font-semibold text-slate-900 mb-4 flex items-center">
                <span className="text-emerald-600 mr-2">🔧</span>
                Test Fixtures (Test Data for Testers)
              </h3>
              <p className="text-sm text-slate-600 mb-4">
                Provide test data that testers (both AI and human) can use to complete the test
              </p>

              {/* Login Credentials */}
              <div className="mb-6">
                <Label className="text-sm font-semibold">Login Credentials</Label>
                {formData.testFixtures.loginCredentials.map((cred, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 mt-2">
                    <Input
                      placeholder="Email"
                      value={cred.email}
                      onChange={(e) => {
                        const newCreds = [...formData.testFixtures.loginCredentials]
                        newCreds[index].email = e.target.value
                        setFormData({
                          ...formData,
                          testFixtures: { ...formData.testFixtures, loginCredentials: newCreds }
                        })
                      }}
                      className="bg-white text-sm"
                    />
                    <Input
                      placeholder="Password"
                      type="text"
                      value={cred.password}
                      onChange={(e) => {
                        const newCreds = [...formData.testFixtures.loginCredentials]
                        newCreds[index].password = e.target.value
                        setFormData({
                          ...formData,
                          testFixtures: { ...formData.testFixtures, loginCredentials: newCreds }
                        })
                      }}
                      className="bg-white text-sm"
                    />
                    <Input
                      placeholder="Description (e.g., Valid user)"
                      value={cred.description}
                      onChange={(e) => {
                        const newCreds = [...formData.testFixtures.loginCredentials]
                        newCreds[index].description = e.target.value
                        setFormData({
                          ...formData,
                          testFixtures: { ...formData.testFixtures, loginCredentials: newCreds }
                        })
                      }}
                      className="bg-white text-sm"
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addLoginCredential}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  + Add Login
                </Button>
              </div>

              {/* Test Credit Cards */}
              <div className="mb-6">
                <Label className="text-sm font-semibold">Test Credit Cards</Label>
                {formData.testFixtures.testCards.map((card, index) => (
                  <div key={index} className="grid grid-cols-4 gap-2 mt-2">
                    <Input
                      placeholder="Card Number"
                      value={card.number}
                      onChange={(e) => {
                        const newCards = [...formData.testFixtures.testCards]
                        newCards[index].number = e.target.value
                        setFormData({
                          ...formData,
                          testFixtures: { ...formData.testFixtures, testCards: newCards }
                        })
                      }}
                      className="bg-white text-sm"
                    />
                    <Input
                      placeholder="MM/YY"
                      value={card.expiry}
                      onChange={(e) => {
                        const newCards = [...formData.testFixtures.testCards]
                        newCards[index].expiry = e.target.value
                        setFormData({
                          ...formData,
                          testFixtures: { ...formData.testFixtures, testCards: newCards }
                        })
                      }}
                      className="bg-white text-sm"
                    />
                    <Input
                      placeholder="CVC"
                      value={card.cvc}
                      onChange={(e) => {
                        const newCards = [...formData.testFixtures.testCards]
                        newCards[index].cvc = e.target.value
                        setFormData({
                          ...formData,
                          testFixtures: { ...formData.testFixtures, testCards: newCards }
                        })
                      }}
                      className="bg-white text-sm"
                    />
                    <Input
                      placeholder="Name on card"
                      value={card.name}
                      onChange={(e) => {
                        const newCards = [...formData.testFixtures.testCards]
                        newCards[index].name = e.target.value
                        setFormData({
                          ...formData,
                          testFixtures: { ...formData.testFixtures, testCards: newCards }
                        })
                      }}
                      className="bg-white text-sm"
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addTestCard}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  + Add Card
                </Button>
              </div>

              {/* Coupons */}
              <div className="mb-6">
                <Label className="text-sm font-semibold">Coupon Codes</Label>
                {formData.testFixtures.coupons.map((coupon, index) => (
                  <div key={index} className="grid grid-cols-2 gap-2 mt-2">
                    <Input
                      placeholder="Coupon Code"
                      value={coupon.code}
                      onChange={(e) => {
                        const newCoupons = [...formData.testFixtures.coupons]
                        newCoupons[index].code = e.target.value
                        setFormData({
                          ...formData,
                          testFixtures: { ...formData.testFixtures, coupons: newCoupons }
                        })
                      }}
                      className="bg-white text-sm"
                    />
                    <Input
                      placeholder="Description (e.g., 10% off)"
                      value={coupon.description}
                      onChange={(e) => {
                        const newCoupons = [...formData.testFixtures.coupons]
                        newCoupons[index].description = e.target.value
                        setFormData({
                          ...formData,
                          testFixtures: { ...formData.testFixtures, coupons: newCoupons }
                        })
                      }}
                      className="bg-white text-sm"
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addCoupon}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  + Add Coupon
                </Button>
              </div>

              {/* Other Test Data */}
              <div>
                <Label className="text-sm font-semibold">Other Test Data</Label>
                {formData.testFixtures.testData.map((data, index) => (
                  <div key={index} className="grid grid-cols-3 gap-2 mt-2">
                    <Input
                      placeholder="Field Name"
                      value={data.field}
                      onChange={(e) => {
                        const newData = [...formData.testFixtures.testData]
                        newData[index].field = e.target.value
                        setFormData({
                          ...formData,
                          testFixtures: { ...formData.testFixtures, testData: newData }
                        })
                      }}
                      className="bg-white text-sm"
                    />
                    <Input
                      placeholder="Value"
                      value={data.value}
                      onChange={(e) => {
                        const newData = [...formData.testFixtures.testData]
                        newData[index].value = e.target.value
                        setFormData({
                          ...formData,
                          testFixtures: { ...formData.testFixtures, testData: newData }
                        })
                      }}
                      className="bg-white text-sm"
                    />
                    <Input
                      placeholder="Description"
                      value={data.description}
                      onChange={(e) => {
                        const newData = [...formData.testFixtures.testData]
                        newData[index].description = e.target.value
                        setFormData({
                          ...formData,
                          testFixtures: { ...formData.testFixtures, testData: newData }
                        })
                      }}
                      className="bg-white text-sm"
                    />
                  </div>
                ))}
                <Button
                  type="button"
                  onClick={addTestData}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  + Add Test Data
                </Button>
              </div>
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
                  
                  <div className="flex justify-between mt-2 text-xs font-medium">
                    <span className="text-green-700">👤 100% Human</span>
                    <span className="text-purple-700">⚖️ Hybrid</span>
                    <span className="text-blue-700">🤖 100% AI</span>
                  </div>
                </div>

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
                    if (!formData.mission) return true
                    const mission = formData.mission.toLowerCase()
                    const literacy = persona.tech_literacy.toLowerCase()
                    
                    if (mission.includes('accessibility') || mission.includes('wcag')) return true
                    if (mission.includes('checkout') || mission.includes('purchase') || mission.includes('cart')) return literacy !== 'low'
                    if (mission.includes('senior') || mission.includes('elderly') || mission.includes('60+')) return literacy !== 'high' && persona.age >= 55
                    if (mission.includes('developer') || mission.includes('technical') || mission.includes('api')) return literacy === 'high'
                    if (mission.includes('mobile') || mission.includes('app')) return literacy !== 'low'
                    
                    return true
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
