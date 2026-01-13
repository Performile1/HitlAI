import { NextRequest, NextResponse } from 'next/server';
import { analyzeScreenshotForIssues } from '@/lib/ai/issueDetector';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageUrl, context } = body;

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Image URL is required' },
        { status: 400 }
      );
    }

    const result = await analyzeScreenshotForIssues(imageUrl, context);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('AI issue detection error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze screenshot' },
      { status: 500 }
    );
  }
}
