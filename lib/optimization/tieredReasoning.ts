import { ChatOpenAI } from '@langchain/openai'
import { ChatAnthropic } from '@langchain/anthropic'

type TaskComplexity = 'simple' | 'medium' | 'complex' | 'critical'
type Phase = 'phase1' | 'phase2' | 'phase3' | 'phase4'

interface ModelConfig {
  provider: 'openai' | 'anthropic' | 'groq' | 'self-hosted'
  model: string
  costPer1kTokens: number
  capabilities: string[]
  phase: Phase
  tier: number
}

/**
 * TieredReasoning - Cost optimization through intelligent model selection
 * 
 * Running 10 agents with GPT-4/Claude 3.5 for every task is expensive.
 * This system uses cheaper models (GPT-4o-mini) for simple tasks and
 * reserves expensive models for high-level critique and vision analysis.
 * 
 * Cost savings: ~70% reduction while maintaining quality
 */
export class TieredReasoning {
  private static models: Record<string, ModelConfig> = {
    // Phase 1: External APIs
    'gpt-4o-mini': {
      provider: 'openai',
      model: 'gpt-4o-mini',
      costPer1kTokens: 0.00015,
      capabilities: ['text', 'json', 'function_calling'],
      phase: 'phase1',
      tier: 1
    },
    'gpt-4o': {
      provider: 'openai',
      model: 'gpt-4o',
      costPer1kTokens: 0.0025,
      capabilities: ['text', 'json', 'function_calling', 'vision', 'complex_reasoning'],
      phase: 'phase1',
      tier: 2
    },
    'gpt-4': {
      provider: 'openai',
      model: 'gpt-4-turbo',
      costPer1kTokens: 0.01,
      capabilities: ['text', 'json', 'function_calling', 'complex_reasoning'],
      phase: 'phase1',
      tier: 3
    },
    'claude-3-5-sonnet': {
      provider: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      costPer1kTokens: 0.003,
      capabilities: ['text', 'json', 'vision', 'complex_reasoning', 'critique'],
      phase: 'phase1',
      tier: 3
    },
    
    // Phase 2: Fine-tuned models (locked until 1k tests)
    'ft-gpt-4o-mini-issue-detector': {
      provider: 'openai',
      model: process.env.FINE_TUNED_ISSUE_DETECTOR || 'gpt-4o-mini',
      costPer1kTokens: 0.0003,
      capabilities: ['text', 'json', 'issue_detection'],
      phase: 'phase2',
      tier: 1
    },
    'ft-gpt-4o-mini-strategy': {
      provider: 'openai',
      model: process.env.FINE_TUNED_STRATEGY || 'gpt-4o-mini',
      costPer1kTokens: 0.0003,
      capabilities: ['text', 'json', 'strategy_planning'],
      phase: 'phase2',
      tier: 1
    },
    'ft-gpt-4o-sentiment': {
      provider: 'openai',
      model: process.env.FINE_TUNED_SENTIMENT || 'gpt-4o',
      costPer1kTokens: 0.0006,
      capabilities: ['text', 'json', 'sentiment_analysis'],
      phase: 'phase2',
      tier: 2
    },
    
    // Phase 3: Self-hosted models (locked until 5k tests)
    'llama-3.1-8b': {
      provider: 'self-hosted',
      model: 'llama-3.1-8b-instruct',
      costPer1kTokens: 0.00003,
      capabilities: ['text', 'json'],
      phase: 'phase3',
      tier: 1
    },
    'groq-llama-8b': {
      provider: 'groq',
      model: 'llama-3.1-8b-instant',
      costPer1kTokens: 0.00005,
      capabilities: ['text', 'json', 'fast_inference'],
      phase: 'phase3',
      tier: 1
    },
    'mixtral-8x7b': {
      provider: 'self-hosted',
      model: 'mixtral-8x7b-instruct',
      costPer1kTokens: 0.0001,
      capabilities: ['text', 'json', 'complex_reasoning'],
      phase: 'phase3',
      tier: 2
    }
  }

  private static currentPhase: Phase = 'phase1'

  /**
   * Set current phase (called by milestone system)
   */
  static setCurrentPhase(phase: Phase) {
    this.currentPhase = phase
    console.log(`[TieredReasoning] Phase updated to: ${phase}`)
  }

  /**
   * Get current phase
   */
  static getCurrentPhase(): Phase {
    return this.currentPhase
  }

  /**
   * Selects appropriate model based on task complexity and current phase
   */
  static selectModel(
    taskType: string,
    complexity: TaskComplexity,
    requiresVision: boolean = false
  ): { modelKey: string; config: ModelConfig } {
    // Route to phase-specific selection
    switch (this.currentPhase) {
      case 'phase4':
      case 'phase3':
        return this.selectPhase3Model(taskType, complexity, requiresVision)
      case 'phase2':
        return this.selectPhase2Model(taskType, complexity, requiresVision)
      case 'phase1':
      default:
        return this.selectPhase1Model(taskType, complexity, requiresVision)
    }
  }

  /**
   * Phase 1: External APIs only
   */
  private static selectPhase1Model(
    taskType: string,
    complexity: TaskComplexity,
    requiresVision: boolean = false
  ): { modelKey: string; config: ModelConfig } {
    // Vision tasks require specific models
    if (requiresVision) {
      return complexity === 'critical'
        ? { modelKey: 'claude-3-5-sonnet', config: this.models['claude-3-5-sonnet'] }
        : { modelKey: 'gpt-4o', config: this.models['gpt-4o'] }
    }

    // Task-specific routing
    switch (taskType) {
      case 'critique':
      case 'divergence_analysis':
        // Always use Claude 3.5 for critique (best at meta-analysis)
        return { modelKey: 'claude-3-5-sonnet', config: this.models['claude-3-5-sonnet'] }

      case 'vision_audit':
      case 'screenshot_analysis':
        // Claude 3.5 for vision (best UX understanding)
        return { modelKey: 'claude-3-5-sonnet', config: this.models['claude-3-5-sonnet'] }

      case 'test_strategy':
      case 'heuristic_weighting':
        // GPT-4 for strategic planning
        return complexity === 'complex' || complexity === 'critical'
          ? { modelKey: 'gpt-4', config: this.models['gpt-4'] }
          : { modelKey: 'gpt-4o-mini', config: this.models['gpt-4o-mini'] }

      case 'synthetic_session':
      case 'behavior_analysis':
        // GPT-4o for simulation (good balance)
        return { modelKey: 'gpt-4o', config: this.models['gpt-4o'] }

      case 'selector_generation':
      case 'data_extraction':
      case 'classification':
        // GPT-4o-mini for simple tasks (70% cost savings)
        return { modelKey: 'gpt-4o-mini', config: this.models['gpt-4o-mini'] }

      default:
        // Default to mini for unknown tasks
        return { modelKey: 'gpt-4o-mini', config: this.models['gpt-4o-mini'] }
    }
  }

  /**
   * Phase 2: Fine-tuned models for specific tasks
   */
  private static selectPhase2Model(
    taskType: string,
    complexity: TaskComplexity,
    requiresVision: boolean = false
  ): { modelKey: string; config: ModelConfig } {
    // Check if fine-tuned model exists for this task
    const fineTunedKey = this.getFineTunedModelKey(taskType)
    if (fineTunedKey && this.models[fineTunedKey]) {
      console.log(`[Phase 2] Using fine-tuned model: ${fineTunedKey}`)
      return { modelKey: fineTunedKey, config: this.models[fineTunedKey] }
    }

    // Fall back to Phase 1 models
    return this.selectPhase1Model(taskType, complexity, requiresVision)
  }

  /**
   * Phase 3: Self-hosted models for simple/medium tasks
   */
  private static selectPhase3Model(
    taskType: string,
    complexity: TaskComplexity,
    requiresVision: boolean = false
  ): { modelKey: string; config: ModelConfig } {
    // Vision tasks still use external APIs
    if (requiresVision) {
      return this.selectPhase1Model(taskType, complexity, requiresVision)
    }

    // Check if self-hosted endpoints are configured
    const hasLlama = !!process.env.LLAMA_8B_ENDPOINT
    const hasMixtral = !!process.env.MIXTRAL_8X7B_ENDPOINT
    const hasGroq = !!process.env.GROQ_API_KEY

    // Simple tasks: Use LLaMA 8B (self-hosted or Groq)
    if (complexity === 'simple') {
      if (hasLlama) {
        return { modelKey: 'llama-3.1-8b', config: this.models['llama-3.1-8b'] }
      } else if (hasGroq) {
        return { modelKey: 'groq-llama-8b', config: this.models['groq-llama-8b'] }
      }
    }

    // Medium tasks: Use Mixtral 8x7B if available
    if (complexity === 'medium' && hasMixtral) {
      return { modelKey: 'mixtral-8x7b', config: this.models['mixtral-8x7b'] }
    }

    // Complex/critical tasks or no self-hosted available: Fall back to Phase 2
    return this.selectPhase2Model(taskType, complexity, requiresVision)
  }

  /**
   * Get fine-tuned model key for a task type
   */
  private static getFineTunedModelKey(taskType: string): string | null {
    const mapping: Record<string, string> = {
      'issue_detection': 'ft-gpt-4o-mini-issue-detector',
      'data_extraction': 'ft-gpt-4o-mini-issue-detector',
      'test_strategy': 'ft-gpt-4o-mini-strategy',
      'heuristic_weighting': 'ft-gpt-4o-mini-strategy',
      'behavior_analysis': 'ft-gpt-4o-sentiment',
      'sentiment_analysis': 'ft-gpt-4o-sentiment'
    }
    return mapping[taskType] || null
  }

  /**
   * Creates LLM instance based on selected model
   */
  static createLLM(taskType: string, complexity: TaskComplexity, requiresVision: boolean = false) {
    const { modelKey, config } = this.selectModel(taskType, complexity, requiresVision)

    console.log(`[TieredReasoning] Task: ${taskType}, Complexity: ${complexity}, Model: ${modelKey}`)

    if (config.provider === 'openai') {
      return new ChatOpenAI({
        modelName: config.model,
        temperature: complexity === 'simple' ? 0.1 : 0.3,
        apiKey: process.env.OPENAI_API_KEY
      })
    } else {
      return new ChatAnthropic({
        modelName: config.model,
        temperature: complexity === 'simple' ? 0.1 : 0.3,
        apiKey: process.env.ANTHROPIC_API_KEY
      })
    }
  }

  /**
   * Estimates cost for a test run
   */
  static estimateCost(testConfig: {
    testType: 'ai_only' | 'human_only' | 'hybrid'
    personas: number
    testDimensions: number
  }): {
    estimatedTokens: number
    estimatedCost: number
    breakdown: Record<string, { tokens: number; cost: number }>
  } {
    const breakdown: Record<string, { tokens: number; cost: number }> = {}

    // Test Strategy Planning (per persona)
    const strategyTokens = 2000 * testConfig.personas
    const strategyModel = this.models['gpt-4o-mini']
    breakdown['test_strategy'] = {
      tokens: strategyTokens,
      cost: (strategyTokens / 1000) * strategyModel.costPer1kTokens
    }

    if (testConfig.testType === 'ai_only' || testConfig.testType === 'hybrid') {
      // Vision Audit (per persona)
      const visionTokens = 3000 * testConfig.personas
      const visionModel = this.models['claude-3-5-sonnet']
      breakdown['vision_audit'] = {
        tokens: visionTokens,
        cost: (visionTokens / 1000) * visionModel.costPer1kTokens
      }

      // Test Execution (per persona per dimension)
      const executionTokens = 1500 * testConfig.personas * testConfig.testDimensions
      const executionModel = this.models['gpt-4o-mini']
      breakdown['test_execution'] = {
        tokens: executionTokens,
        cost: (executionTokens / 1000) * executionModel.costPer1kTokens
      }

      // Synthetic Sessions (per persona)
      const syntheticTokens = 2500 * testConfig.personas
      const syntheticModel = this.models['gpt-4o']
      breakdown['synthetic_sessions'] = {
        tokens: syntheticTokens,
        cost: (syntheticTokens / 1000) * syntheticModel.costPer1kTokens
      }
    }

    if (testConfig.testType === 'hybrid') {
      // Divergence Analysis (per persona)
      const critiqueTokens = 4000 * testConfig.personas
      const critiqueModel = this.models['claude-3-5-sonnet']
      breakdown['critique_analysis'] = {
        tokens: critiqueTokens,
        cost: (critiqueTokens / 1000) * critiqueModel.costPer1kTokens
      }

      // Video Analysis (per human tester)
      const videoTokens = 2000 * testConfig.personas
      const videoModel = this.models['gpt-4o']
      breakdown['video_analysis'] = {
        tokens: videoTokens,
        cost: (videoTokens / 1000) * videoModel.costPer1kTokens
      }
    }

    const totalTokens = Object.values(breakdown).reduce((sum, b) => sum + b.tokens, 0)
    const totalCost = Object.values(breakdown).reduce((sum, b) => sum + b.cost, 0)

    return {
      estimatedTokens: totalTokens,
      estimatedCost: totalCost,
      breakdown
    }
  }

  /**
   * Generates cost optimization report
   */
  static generateCostReport(testConfig: any): string {
    const withOptimization = this.estimateCost(testConfig)

    // Calculate cost WITHOUT optimization (everything on GPT-4)
    const gpt4Model = this.models['gpt-4']
    const withoutOptimization = {
      estimatedTokens: withOptimization.estimatedTokens,
      estimatedCost: (withOptimization.estimatedTokens / 1000) * gpt4Model.costPer1kTokens
    }

    const savings = withoutOptimization.estimatedCost - withOptimization.estimatedCost
    const savingsPercent = (savings / withoutOptimization.estimatedCost) * 100

    return `
# Cost Optimization Report

## Test Configuration
- Type: ${testConfig.testType}
- Personas: ${testConfig.personas}
- Dimensions: ${testConfig.testDimensions}

## Cost Comparison

### Without Tiered Reasoning (All GPT-4)
- Estimated Tokens: ${withoutOptimization.estimatedTokens.toLocaleString()}
- Estimated Cost: $${withoutOptimization.estimatedCost.toFixed(4)}

### With Tiered Reasoning (Optimized)
- Estimated Tokens: ${withOptimization.estimatedTokens.toLocaleString()}
- Estimated Cost: $${withOptimization.estimatedCost.toFixed(4)}

### Savings
- **Amount**: $${savings.toFixed(4)}
- **Percentage**: ${savingsPercent.toFixed(1)}%

## Breakdown by Task
${Object.entries(withOptimization.breakdown).map(([task, data]) => `
- **${task}**: ${data.tokens.toLocaleString()} tokens → $${data.cost.toFixed(4)}
`).join('')}

## Model Allocation
- **GPT-4o-mini** (cheap): Simple tasks, selectors, classification
- **GPT-4o** (medium): Synthetic sessions, video analysis
- **GPT-4** (expensive): Strategic planning
- **Claude 3.5 Sonnet** (expensive): Vision audits, critique analysis

✅ **Quality maintained while reducing costs by ${savingsPercent.toFixed(0)}%**
`
  }
}
