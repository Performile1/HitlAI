import { SupabaseClient } from '@supabase/supabase-js'
import { OpenAI } from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export class MemoryManager {
  private supabase: SupabaseClient

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
  }

  async retrieveLessons(query: string, platform?: string, topK: number = 5) {
    try {
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: query
      })

      const embedding = embeddingResponse.data[0].embedding

      const { data: lessons, error } = await this.supabase.rpc('match_memory_lessons', {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: topK,
        filter_platform: platform || null
      })

      if (error) {
        console.error('Memory retrieval error:', error)
        return []
      }

      return lessons || []
    } catch (error) {
      console.error('Memory retrieval failed:', error)
      return []
    }
  }

  async storeLesson(
    lessonText: string,
    url: string,
    platform: string,
    frictionType: string,
    resolution: string,
    metadata: any = {}
  ) {
    try {
      const embeddingResponse = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: lessonText
      })

      const embedding = embeddingResponse.data[0].embedding

      const { data, error } = await this.supabase
        .from('memory_lessons')
        .insert({
          lesson_text: lessonText,
          url,
          platform,
          friction_type: frictionType,
          resolution,
          embedding,
          metadata
        })
        .select()
        .single()

      if (error) {
        console.error('Memory storage error:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Memory storage failed:', error)
      return null
    }
  }

  async checkCrossPlatformFriction(url: string, elementDescription: string, currentPlatform: string) {
    const otherPlatform = currentPlatform === 'web' ? 'mobile' : 'web'
    
    const lessons = await this.retrieveLessons(
      `friction on ${url} with ${elementDescription}`,
      otherPlatform,
      3
    )

    if (lessons.length > 0 && lessons[0].similarity > 0.85) {
      return lessons[0]
    }

    return null
  }
}
