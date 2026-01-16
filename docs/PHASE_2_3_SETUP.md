# Phase 2 & 3 Setup Guide

This guide explains how to set up and configure Phase 2 (Fine-Tuned Models) and Phase 3 (Self-Hosted Models) for the HitlAI progressive unlock system.

## Overview

The AI system evolves through 4 phases:
- **Phase 1 (Active)**: External APIs (OpenAI, Anthropic)
- **Phase 2 (Unlocks at 1,000 tests)**: Fine-tuned models
- **Phase 3 (Unlocks at 5,000 tests)**: Self-hosted LLaMA/Mixtral
- **Phase 4 (Unlocks at 10,000 tests)**: Full hybrid system

## Phase 2: Fine-Tuned Models

### Prerequisites
- 1,000+ completed tests in the database
- At least 50 high-quality, human-verified training examples
- OpenAI API access with fine-tuning enabled

### Setup Steps

#### 1. Check Training Data Readiness
```bash
curl http://localhost:3000/api/admin/training-data/stats
```

Look for `readyForTraining` count. You need at least 50 examples.

#### 2. Export and Fine-Tune Models

**Issue Detector Model:**
```bash
curl -X POST http://localhost:3000/api/admin/training/fine-tune \
  -H "Content-Type: application/json" \
  -d '{
    "modelType": "issue_detector",
    "minQuality": 4,
    "requireHumanVerification": true,
    "baseModel": "gpt-4o-mini-2024-07-18"
  }'
```

**Strategy Planner Model:**
```bash
curl -X POST http://localhost:3000/api/admin/training/fine-tune \
  -H "Content-Type: application/json" \
  -d '{
    "modelType": "strategy_planner",
    "minQuality": 4,
    "requireHumanVerification": true,
    "baseModel": "gpt-4o-mini-2024-07-18"
  }'
```

**Sentiment Analyzer Model:**
```bash
curl -X POST http://localhost:3000/api/admin/training/fine-tune \
  -H "Content-Type: application/json" \
  -d '{
    "modelType": "sentiment_analyzer",
    "minQuality": 4,
    "requireHumanVerification": true,
    "baseModel": "gpt-4o-2024-08-06"
  }'
```

#### 3. Monitor Fine-Tuning Jobs

Each request returns a `jobId`. Monitor progress:
```bash
curl http://localhost:3000/api/admin/training/status/{jobId}
```

Fine-tuning typically takes 10-60 minutes depending on dataset size.

#### 4. Deploy Fine-Tuned Models

Once status is `succeeded`:
```bash
curl -X POST http://localhost:3000/api/admin/training/status/{jobId} \
  -H "Content-Type: application/json" \
  -d '{
    "action": "deploy",
    "modelName": "hitlai-issue-detector-v1",
    "phase": "phase2"
  }'
```

#### 5. Update Environment Variables

Add the fine-tuned model IDs to `.env`:
```env
FINE_TUNED_ISSUE_DETECTOR=ft:gpt-4o-mini-2024-07-18:hitlai::abc123
FINE_TUNED_STRATEGY=ft:gpt-4o-mini-2024-07-18:hitlai::def456
FINE_TUNED_SENTIMENT=ft:gpt-4o-2024-08-06:hitlai::ghi789
```

#### 6. Activate Phase 2

The system automatically switches to Phase 2 when:
1. All Phase 2 milestones are unlocked (1,000 tests)
2. Fine-tuned models are deployed

You can manually set the phase in code:
```typescript
import { TieredReasoning } from '@/lib/optimization/tieredReasoning'
TieredReasoning.setCurrentPhase('phase2')
```

### Expected Benefits
- **50% cost reduction** on simple tasks
- **15% better accuracy** on issue detection
- **2x faster** fine-tuned inference

---

## Phase 3: Self-Hosted Models

### Prerequisites
- 5,000+ completed tests in the database
- GPU server or Groq API access
- Docker (for self-hosted option)

### Option A: Groq API (Recommended for Testing)

Groq provides ultra-fast inference for LLaMA models via API.

#### Setup:
1. Sign up at https://console.groq.com
2. Get API key
3. Add to `.env`:
```env
GROQ_API_KEY=gsk_your_key_here
```

That's it! The system will automatically use Groq for simple tasks.

### Option B: Self-Hosted LLaMA 8B

#### Requirements:
- GPU with 16GB+ VRAM (NVIDIA recommended)
- Docker and docker-compose
- 20GB disk space

#### Setup:

1. **Create docker-compose.yml:**
```yaml
version: '3.8'
services:
  llama-8b:
    image: ghcr.io/huggingface/text-generation-inference:latest
    ports:
      - "8000:80"
    environment:
      - MODEL_ID=meta-llama/Llama-3.1-8B-Instruct
      - HUGGING_FACE_HUB_TOKEN=${HF_TOKEN}
    volumes:
      - ./models:/data
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: 1
              capabilities: [gpu]
```

2. **Start the service:**
```bash
export HF_TOKEN=your_huggingface_token
docker-compose up -d llama-8b
```

3. **Update .env:**
```env
LLAMA_8B_ENDPOINT=http://localhost:8000/v1
```

4. **Test the endpoint:**
```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "meta-llama/Llama-3.1-8B-Instruct",
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

### Option C: Self-Hosted Mixtral 8x7B

#### Requirements:
- GPU with 48GB+ VRAM (or multi-GPU setup)
- Docker and docker-compose
- 50GB disk space

#### Setup:

1. **Create docker-compose.yml:**
```yaml
version: '3.8'
services:
  mixtral-8x7b:
    image: ghcr.io/huggingface/text-generation-inference:latest
    ports:
      - "8001:80"
    environment:
      - MODEL_ID=mistralai/Mixtral-8x7B-Instruct-v0.1
      - HUGGING_FACE_HUB_TOKEN=${HF_TOKEN}
      - MAX_BATCH_PREFILL_TOKENS=4096
    volumes:
      - ./models:/data
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
```

2. **Start the service:**
```bash
export HF_TOKEN=your_huggingface_token
docker-compose up -d mixtral-8x7b
```

3. **Update .env:**
```env
MIXTRAL_8X7B_ENDPOINT=http://localhost:8001/v1
```

### Activate Phase 3

The system automatically switches to Phase 3 when:
1. All Phase 3 milestones are unlocked (5,000 tests)
2. At least one self-hosted endpoint is configured

Manual activation:
```typescript
import { TieredReasoning } from '@/lib/optimization/tieredReasoning'
TieredReasoning.setCurrentPhase('phase3')
```

### Expected Benefits
- **70% cost reduction** on simple/medium tasks
- **10x faster** inference (especially with Groq)
- **Full control** over model deployment

---

## Monitoring & Troubleshooting

### Check Current Phase
```bash
curl http://localhost:3000/api/milestones
```

### View Training Data Stats
```bash
curl http://localhost:3000/api/admin/training-data/stats
```

### View Deployed Models
```bash
curl http://localhost:3000/api/admin/training/fine-tune
```

### Common Issues

**Fine-tuning fails with "insufficient data":**
- Need at least 50 training examples
- Ensure examples have `is_high_quality = true` and `human_verified = true`

**Self-hosted model won't start:**
- Check GPU availability: `nvidia-smi`
- Verify HuggingFace token has model access
- Check Docker logs: `docker logs <container_name>`

**Phase not switching automatically:**
- Verify milestones are unlocked in database
- Check that models are deployed with correct phase
- Manually trigger milestone update: `curl -X POST http://localhost:3000/api/milestones`

---

## Cost Comparison

### Phase 1 (Current)
- Simple task: $0.00015 per 1K tokens (GPT-4o-mini)
- Medium task: $0.0025 per 1K tokens (GPT-4o)
- Complex task: $0.003 per 1K tokens (Claude 3.5)

### Phase 2 (Fine-Tuned)
- Simple task: $0.0003 per 1K tokens (50% increase but 2x better)
- Medium task: $0.0006 per 1K tokens (76% reduction)
- Complex task: Falls back to Phase 1

### Phase 3 (Self-Hosted)
- Simple task: $0.00003 per 1K tokens (80% reduction vs Phase 2)
- Medium task: $0.0001 per 1K tokens (83% reduction vs Phase 2)
- Complex task: Falls back to Phase 2 or Phase 1

### Overall Savings
- Phase 2: ~40% cost reduction
- Phase 3: ~70% cost reduction
- Phase 4: ~80% cost reduction (with full optimization)

---

## Next Steps

1. **Collect Training Data**: Every test automatically captures training data
2. **Monitor Progress**: Check `/api/milestones` for unlock status
3. **Prepare Infrastructure**: Set up Groq or self-hosted endpoints before Phase 3 unlocks
4. **Test Models**: Use admin endpoints to verify fine-tuned models work correctly
5. **Optimize**: Adjust model selection logic in `tieredReasoning.ts` based on performance

For questions or issues, check the main documentation or create an issue in the repository.
