'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

interface TestScenarioBuilderProps {
  onScenariosGenerated?: (scenarios: any) => void
}

export function TestScenarioBuilder({ onScenariosGenerated }: TestScenarioBuilderProps) {
  const [appType, setAppType] = useState('web')
  const [appDescription, setAppDescription] = useState('')
  const [businessObjective, setBusinessObjective] = useState('')
  const [loading, setLoading] = useState(false)
  const [scenarios, setScenarios] = useState<any>(null)
  const [validation, setValidation] = useState<any>(null)

  const handleGenerate = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-scenarios/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appType, appDescription, businessObjective })
      })

      const data = await response.json()
      setScenarios(data.scenarios)
      setValidation(data.validation)
      onScenariosGenerated?.(data.scenarios)
    } catch (error) {
      console.error('Failed to generate scenarios:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Test Scenario Builder</h2>
        <p className="text-muted-foreground">
          For apps that can't be uploaded (games, large software, enterprise apps)
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="appType">Application Type</Label>
          <select
            id="appType"
            value={appType}
            onChange={(e) => setAppType(e.target.value)}
            className="w-full p-2 border rounded-md"
          >
            <option value="web">Web Application</option>
            <option value="mobile">Mobile App</option>
            <option value="desktop">Desktop Software</option>
            <option value="game">Game</option>
            <option value="enterprise">Enterprise Software</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <Label htmlFor="appDescription">Application Description</Label>
          <Textarea
            id="appDescription"
            value={appDescription}
            onChange={(e) => setAppDescription(e.target.value)}
            placeholder="Describe your application: What does it do? Who uses it? Key features..."
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="businessObjective">Primary Business Objective</Label>
          <Input
            id="businessObjective"
            value={businessObjective}
            onChange={(e) => setBusinessObjective(e.target.value)}
            placeholder="e.g., Complete checkout process, Book appointment, Submit application"
          />
        </div>

        <Button 
          onClick={handleGenerate} 
          disabled={loading || !appDescription || !businessObjective}
          className="w-full"
        >
          {loading ? 'Generating Test Scenarios...' : 'Generate Comprehensive Test Plan'}
        </Button>
      </div>

      {validation && !validation.isComplete && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-semibold text-yellow-800 mb-2">Recommendations</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
            {validation.recommendations.map((rec: string, idx: number) => (
              <li key={idx}>{rec}</li>
            ))}
          </ul>
        </div>
      )}

      {scenarios && (
        <div className="space-y-6 border-t pt-6">
          <div>
            <h3 className="text-xl font-bold mb-3">Happy Paths ({scenarios.happyPaths.length})</h3>
            <div className="space-y-3">
              {scenarios.happyPaths.map((hp: any) => (
                <div key={hp.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-semibold text-green-900">{hp.name}</h4>
                  <p className="text-sm text-green-700 mt-1">{hp.description}</p>
                  <div className="mt-2">
                    <p className="text-xs font-medium text-green-800">Steps:</p>
                    <ol className="list-decimal list-inside text-sm text-green-700">
                      {hp.steps.map((step: string, idx: number) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  <p className="text-xs text-green-600 mt-2">
                    ✓ Success: {hp.successCriteria}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-3">Sad Paths ({scenarios.sadPaths.length})</h3>
            <div className="space-y-3">
              {scenarios.sadPaths.map((sp: any) => (
                <div key={sp.id} className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-red-900">{sp.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      sp.priority === 'critical' ? 'bg-red-600 text-white' :
                      sp.priority === 'high' ? 'bg-red-500 text-white' :
                      sp.priority === 'medium' ? 'bg-orange-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {sp.priority}
                    </span>
                  </div>
                  <p className="text-sm text-red-700 mt-1">{sp.description}</p>
                  <div className="mt-2 space-y-1 text-xs text-red-600">
                    <p><strong>Trigger:</strong> {sp.triggerCondition}</p>
                    <p><strong>Expected:</strong> {sp.expectedSystemBehavior}</p>
                    <p><strong>Recovery:</strong> {sp.recoveryPath}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-3">Edge Cases ({scenarios.edgeCases.length})</h3>
            <div className="space-y-3">
              {scenarios.edgeCases.map((ec: any) => (
                <div key={ec.id} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <h4 className="font-semibold text-orange-900">{ec.name}</h4>
                  <p className="text-sm text-orange-700 mt-1">{ec.description}</p>
                  <div className="mt-2 space-y-1 text-xs text-orange-600">
                    <p><strong>Type:</strong> {ec.boundaryType}</p>
                    <p><strong>Test Value:</strong> {ec.testValue}</p>
                    <p><strong>Expected:</strong> {ec.expectedBehavior}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-3">Environmental Tests ({scenarios.environmentalTests.length})</h3>
            <div className="space-y-3">
              {scenarios.environmentalTests.map((env: any) => (
                <div key={env.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900">{env.name}</h4>
                  <p className="text-sm text-blue-700 mt-1">{env.description}</p>
                  <div className="mt-2">
                    <p className="text-xs font-medium text-blue-800">Simulation Steps:</p>
                    <ol className="list-decimal list-inside text-xs text-blue-700">
                      {env.simulationSteps.map((step: string, idx: number) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  <p className="text-xs text-blue-600 mt-2">
                    <strong>Expected:</strong> {env.expectedSystemBehavior}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-3">Non-Functional Tests ({scenarios.nonFunctionalTests.length})</h3>
            <div className="space-y-3">
              {scenarios.nonFunctionalTests.map((nft: any) => (
                <div key={nft.id} className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-purple-900">{nft.name}</h4>
                    <span className="text-xs px-2 py-1 rounded bg-purple-600 text-white">
                      {nft.testType}
                    </span>
                  </div>
                  <p className="text-sm text-purple-700 mt-1">{nft.description}</p>
                  <div className="mt-2 space-y-1 text-xs text-purple-600">
                    <p><strong>Metrics:</strong> {nft.metrics.join(', ')}</p>
                    <p><strong>Pass Criteria:</strong> {nft.passCriteria}</p>
                    <p><strong>Tools:</strong> {nft.toolsRequired.join(', ')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold mb-3">Chaos Tests ({scenarios.chaosTests.length})</h3>
            <div className="space-y-3">
              {scenarios.chaosTests.map((chaos: any) => (
                <div key={chaos.id} className="bg-gray-50 border border-gray-300 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900">{chaos.name}</h4>
                  <p className="text-sm text-gray-700 mt-1">{chaos.description}</p>
                  <div className="mt-2 space-y-1 text-xs text-gray-600">
                    <p><strong>Type:</strong> {chaos.chaosType}</p>
                    <p><strong>Strategy:</strong> {chaos.executionStrategy}</p>
                    <p><strong>Break Conditions:</strong> {chaos.breakConditions.join(', ')}</p>
                    <p><strong>Expected Resilience:</strong> {chaos.expectedResilience}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Estimated Complexity</h3>
            <p className="text-sm text-gray-700">
              This test plan is rated as <strong className="uppercase">{scenarios.estimatedComplexity}</strong> complexity.
            </p>
            <p className="text-xs text-gray-600 mt-2">
              Total scenarios: {
                scenarios.happyPaths.length +
                scenarios.sadPaths.length +
                scenarios.edgeCases.length +
                scenarios.environmentalTests.length +
                scenarios.nonFunctionalTests.length +
                scenarios.chaosTests.length
              }
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
