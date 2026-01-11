/**
 * PersonaImageGenerator - Generates realistic avatar images for personas
 * 
 * Uses DALL-E 3 to create photorealistic persona avatars based on:
 * - Age, gender, ethnicity
 * - Tech literacy (affects clothing, environment)
 * - Accessibility needs (glasses, hearing aids, etc.)
 */

import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

interface Persona {
  id: string
  name: string
  age: number
  tech_literacy: string
  eyesight: string
  cognitive_load: string
  gender?: string
  ethnicity?: string
  occupation?: string
}

export class PersonaImageGenerator {
  private openai: OpenAI
  private supabase: ReturnType<typeof createClient>

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })

    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
  }

  /**
   * Generate avatar image for persona
   */
  async generatePersonaImage(persona: Persona): Promise<string> {
    // 1. Build detailed prompt
    const prompt = this.buildPrompt(persona)

    console.log(`Generating image for ${persona.name}...`)
    console.log(`Prompt: ${prompt}`)

    // 2. Generate image with DALL-E 3
    const response = await this.openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      size: '1024x1024',
      quality: 'standard',
      n: 1,
      style: 'natural' // More photorealistic
    })

    const imageUrl = response.data?.[0]?.url
    if (!imageUrl) {
      throw new Error('Failed to generate image')
    }

    // 3. Download and upload to Supabase Storage
    const storedUrl = await this.uploadToStorage(imageUrl, persona.id)

    // 4. Store in database
    await this.supabase
      .from('persona_images')
      .upsert({
        persona_id: persona.id,
        image_url: storedUrl,
        generation_prompt: prompt,
        generator: 'dall-e-3',
        style: 'realistic'
      } as any)

    // 5. Update persona record
    // @ts-expect-error - Supabase type inference issue with update operation
    await this.supabase.from('personas').update({ image_url: storedUrl }).eq('id', persona.id)

    return storedUrl
  }

  /**
   * Build detailed DALL-E prompt from persona characteristics
   */
  private buildPrompt(persona: Persona): string {
    const parts: string[] = []

    // Base description
    parts.push('Professional headshot portrait photograph')

    // Age and gender
    const gender = persona.gender || 'person'
    parts.push(`${persona.age}-year-old ${gender}`)

    // Ethnicity (if specified)
    if (persona.ethnicity) {
      parts.push(`of ${persona.ethnicity} descent`)
    }

    // Occupation/context (inferred from tech literacy)
    const occupation = this.inferOccupation(persona)
    if (occupation) {
      parts.push(occupation)
    }

    // Accessibility characteristics
    const accessibilityFeatures = this.getAccessibilityFeatures(persona)
    if (accessibilityFeatures.length > 0) {
      parts.push(accessibilityFeatures.join(', '))
    }

    // Environment/setting
    const setting = this.getSetting(persona)
    parts.push(setting)

    // Style directives
    parts.push('natural lighting, soft focus background')
    parts.push('friendly and approachable expression')
    parts.push('high quality, professional photography')
    parts.push('neutral background')

    return parts.join(', ')
  }

  /**
   * Infer occupation from tech literacy and age
   */
  private inferOccupation(persona: Persona): string {
    if (persona.occupation) {
      return persona.occupation
    }

    // Infer from tech literacy and age
    if (persona.age >= 65) {
      if (persona.tech_literacy === 'high') {
        return 'retired professional'
      }
      return 'senior citizen'
    }

    if (persona.age >= 45) {
      if (persona.tech_literacy === 'high') {
        return 'business professional'
      }
      return 'middle-aged adult'
    }

    if (persona.age >= 25) {
      if (persona.tech_literacy === 'high') {
        return 'tech professional'
      }
      return 'young professional'
    }

    if (persona.tech_literacy === 'high') {
      return 'tech-savvy young adult'
    }

    return 'young adult'
  }

  /**
   * Get accessibility features to include in image
   */
  private getAccessibilityFeatures(persona: Persona): string[] {
    const features: string[] = []

    // Eyesight issues
    if (persona.eyesight === 'low_contrast_sensitive' || 
        persona.eyesight === 'presbyopia' ||
        persona.eyesight === 'poor') {
      features.push('wearing reading glasses')
    }

    // Age-related features
    if (persona.age >= 65) {
      features.push('gray hair')
      features.push('warm smile with gentle wrinkles')
    } else if (persona.age >= 45) {
      features.push('mature appearance')
    }

    // Tech literacy visual cues
    if (persona.tech_literacy === 'low') {
      features.push('casual comfortable clothing')
    } else if (persona.tech_literacy === 'high') {
      features.push('modern professional attire')
    }

    return features
  }

  /**
   * Get setting/environment for photo
   */
  private getSetting(persona: Persona): string {
    if (persona.tech_literacy === 'high') {
      return 'modern office or home office setting'
    }

    if (persona.age >= 65) {
      return 'comfortable home environment'
    }

    return 'neutral indoor setting'
  }

  /**
   * Download image from DALL-E and upload to Supabase Storage
   */
  private async uploadToStorage(imageUrl: string, personaId: string): Promise<string> {
    // Download image
    const response = await fetch(imageUrl)
    const blob = await response.blob()
    const arrayBuffer = await blob.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Upload to Supabase Storage
    const fileName = `${personaId}-${Date.now()}.png`
    const { data, error } = await this.supabase.storage
      .from('persona-avatars')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: true
      })

    if (error) {
      throw new Error(`Failed to upload image: ${error.message}`)
    }

    // Get public URL
    const { data: urlData } = this.supabase.storage
      .from('persona-avatars')
      .getPublicUrl(fileName)

    return urlData.publicUrl
  }

  /**
   * Generate images for all personas without images
   */
  async generateMissingImages(): Promise<void> {
    const { data: personas } = await this.supabase
      .from('personas')
      .select('*')
      .is('image_url', null)

    if (!personas || personas.length === 0) {
      console.log('No personas missing images')
      return
    }

    console.log(`Generating images for ${personas.length} personas...`)

    for (const persona of personas) {
      try {
        await this.generatePersonaImage(persona)
        console.log(`✅ Generated image for ${persona.name}`)
        
        // Rate limit: wait 1 second between requests
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        console.error(`❌ Failed to generate image for ${persona.name}:`, error)
      }
    }
  }

  /**
   * Regenerate image for a specific persona
   */
  async regeneratePersonaImage(personaId: string): Promise<string> {
    const { data: persona } = await this.supabase
      .from('personas')
      .select('*')
      .eq('id', personaId)
      .single()

    if (!persona) {
      throw new Error('Persona not found')
    }

    return await this.generatePersonaImage(persona)
  }
}
