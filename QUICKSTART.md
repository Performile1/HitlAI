# HitlAI Quick Start

Get up and running in 5 minutes.

## 1. Install (2 minutes)

```bash
# Clone/navigate to project
cd HitlAI

# Install dependencies
pip install -r requirements.txt

# Initialize browsers
playwright install chromium
```

## 2. Configure (2 minutes)

```bash
# Copy environment template
cp .env.template .env
```

Edit `.env` with your API keys (minimum required):

```env
OPENAI_API_KEY=sk-proj-your-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here
PINECONE_API_KEY=your-pinecone-key-here
```

## 3. Run (1 minute)

```python
from main_orchestrator import HitlAIOrchestrator

orchestrator = HitlAIOrchestrator()

result = orchestrator.run_test(
    url="https://example.com",
    mission="Click the 'More information' link",
    persona="senior_casual",
    platform="web"
)

print(result['report'])
```

## That's It! 🎉

Your first cognitive test is complete. Check:
- `reports/` for the full report
- `screenshots/` for visual evidence
- `logs/` for detailed execution logs

## Next Steps

### Try Different Personas

```python
result = orchestrator.run_test(
    url="https://your-site.com",
    mission="Complete the signup form",
    persona="accessibility_focused",  # Screen reader user
    platform="web"
)
```

### Test Complex Flows

```python
result = orchestrator.run_test(
    url="https://your-site.com/checkout",
    mission="Add item to cart and complete checkout",
    persona="senior_casual",
    platform="web"
)
```

### Query Memory

```python
from memory.vector_store import VectorMemoryStore

memory = VectorMemoryStore()
lessons = memory.retrieve_similar_lessons(
    query="button not visible",
    platform="mobile"
)
```

## Common Issues

### "Missing API Key"
- Ensure `.env` file exists and has valid keys
- Check key format matches provider requirements

### "Playwright not installed"
```bash
playwright install chromium
```

### "Pinecone connection failed"
- Verify API key in `.env`
- Check Pinecone dashboard for index status

## Learn More

- **Full Setup**: See `SETUP.md`
- **Architecture**: See `ARCHITECTURE.md`
- **Examples**: Check `examples/` directory

---

**Ready to test!** Start with simple missions and gradually increase complexity.
