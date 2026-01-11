import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { OpenAI } from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { query, platform, topK = 5 } = await request.json()

    if (!query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query
    })

    const embedding = embeddingResponse.data[0].embedding

    const { data: lessons, error } = await supabase.rpc('match_memory_lessons', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: topK,
      filter_platform: platform || null
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ lessons })

  } catch (error) {
    console.error('Memory query error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { lessonText, url, platform, frictionType, resolution, metadata } = await request.json()

    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: lessonText
    })

    const embedding = embeddingResponse.data[0].embedding

    const { data: lesson, error } = await supabase
      .from('memory_lessons')
      .insert({
        lesson_text: lessonText,
        url,
        platform,
        friction_type: frictionType,
        resolution,
        embedding,
        metadata: metadata || {},
        user_id: user.id
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ lesson })

  } catch (error) {
    console.error('Memory store error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
