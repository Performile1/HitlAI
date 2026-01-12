import { NextRequest, NextResponse } from 'next/server'
import { TestScenarioBuilder } from '@/lib/agents/testScenarioBuilder'

export async function POST(request: NextRequest) {
  try {
    const { appType, appDescription, businessObjective } = await request.json()

    if (!appType || !appDescription || !businessObjective) {
      return NextResponse.json(
        { error: 'Missing required fields: appType, appDescription, businessObjective' },
        { status: 400 }
      )
    }

    const builder = new TestScenarioBuilder()
    const scenarios = await builder.buildTestScenarios(
      appType,
      appDescription,
      businessObjective
    )

    const validation = builder.validateScenarioCompleteness(scenarios)

    return NextResponse.json({
      scenarios,
      validation,
      message: validation.isComplete 
        ? 'Comprehensive test scenarios generated successfully'
        : 'Test scenarios generated with recommendations for improvement'
    })

  } catch (error) {
    console.error('Error generating test scenarios:', error)
    return NextResponse.json(
      { error: 'Failed to generate test scenarios' },
      { status: 500 }
    )
  }
}
