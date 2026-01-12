import { NextRequest, NextResponse } from 'next/server'
import { TestScenarioBuilder } from '@/lib/agents/testScenarioBuilder'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const appType = searchParams.get('appType') || 'web'

    const builder = new TestScenarioBuilder()
    const questions = await builder.generateGuidedQuestions(appType)

    return NextResponse.json({ questions })

  } catch (error) {
    console.error('Error generating questions:', error)
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    )
  }
}
