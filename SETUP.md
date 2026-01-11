# HitlAI Setup Guide

Complete installation and configuration guide for the HitlAI Cognitive Testing Agent.

## Prerequisites

- Python 3.10 or higher
- pip package manager
- Git (optional)
- PostgreSQL (optional, for persistent state)
- Redis (optional, for caching)

## Step-by-Step Installation

### 1. Environment Setup

Create and activate a virtual environment:

```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Core Dependencies

```bash
# Install all required packages
pip install -r requirements.txt

# Verify installation
python -c "import langgraph, crewai, playwright; print('Core packages installed')"
```

### 3. Initialize Browser Automation

```bash
# Install Playwright browsers
playwright install

# Install Chromium only (lighter)
playwright install chromium

# Verify Playwright
playwright --version
```

### 4. Initialize Crawl4AI

```bash
# Run Crawl4AI setup
crawl4ai-setup

# This will download necessary models and dependencies
```

### 5. Configure API Keys

Copy the template and add your keys:

```bash
cp .env.template .env
```

Edit `.env` with your credentials:

#### Required Keys

```env
# OpenAI (for Mission Planning)
OPENAI_API_KEY=sk-proj-...

# Anthropic (for Vision Audits)
ANTHROPIC_API_KEY=sk-ant-...

# Pinecone (for Memory)
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=gcp-starter
PINECONE_INDEX_NAME=hitlai-memory
```

#### Optional Keys

```env
# DeepSeek (for advanced code generation)
DEEPSEEK_API_KEY=...

# X.AI (for real-time verification)
XAI_API_KEY=...

# ScrapeGraph (for enhanced schema mapping)
SCRAPEGRAPH_API_KEY=...

# Crawl4AI (if using cloud version)
CRAWL4AI_API_KEY=...
```

### 6. Database Setup (Optional)

If you want persistent state storage:

#### PostgreSQL

```bash
# Install PostgreSQL
# Windows: Download from postgresql.org
# macOS: brew install postgresql
# Linux: sudo apt-get install postgresql

# Create database
createdb agent_state

# Update .env
DATABASE_URL=postgresql://username:password@localhost:5432/agent_state
```

#### Redis

```bash
# Install Redis
# Windows: Download from redis.io or use WSL
# macOS: brew install redis
# Linux: sudo apt-get install redis-server

# Start Redis
redis-server

# Update .env
REDIS_URL=redis://localhost:6379/0
```

### 7. Initialize Pinecone Index

```python
# Run this once to create your Pinecone index
from memory.vector_store import VectorMemoryStore

memory = VectorMemoryStore()
print("Pinecone index initialized!")
```

### 8. Verify Installation

Run the test script:

```bash
python main_orchestrator.py
```

You should see:
- Persona loaded
- Agents initialized
- Test execution (may fail without valid URL, but setup is verified)

## Configuration Options

### Agent Behavior

Edit `.env` to customize:

```env
# Maximum retry attempts before HITL
MAX_RETRY_ATTEMPTS=3

# Failures before human intervention
HITL_INTERRUPT_THRESHOLD=3

# Default persona
DEFAULT_PERSONA=senior_casual
```

### LLM Models

Modify `config/llm_config.py` to change models:

```python
# Use GPT-4 Turbo for planning
"model": "gpt-4-turbo-preview"

# Use Claude Opus for vision
"model": "claude-3-opus-20240229"

# Adjust temperature for creativity
"temperature": 0.7  # Higher = more creative
```

### Logging

Configure logging in `main_orchestrator.py`:

```python
logger.add(
    "logs/hitlai_{time}.log",
    rotation="500 MB",      # Rotate at 500MB
    retention="10 days",    # Keep for 10 days
    level="DEBUG"           # Log level
)
```

## Troubleshooting

### Playwright Installation Issues

```bash
# If playwright install fails, try:
python -m playwright install chromium

# On Linux, install dependencies:
playwright install-deps
```

### Crawl4AI Setup Errors

```bash
# If crawl4ai-setup fails:
pip install --upgrade crawl4ai

# Manual setup:
python -c "from crawl4ai import AsyncWebCrawler; print('OK')"
```

### Pinecone Connection Issues

```bash
# Verify Pinecone credentials
python -c "from pinecone import Pinecone; pc = Pinecone(api_key='YOUR_KEY'); print(pc.list_indexes())"
```

### Import Errors

```bash
# Ensure all __init__.py files exist
touch agents/__init__.py config/__init__.py graph/__init__.py integrations/__init__.py memory/__init__.py utils/__init__.py

# Or reinstall in development mode
pip install -e .
```

### API Rate Limits

If you hit rate limits:

1. Add delays in `config/llm_config.py`:
```python
"request_timeout": 60,
"max_retries": 3
```

2. Use caching:
```python
from langchain.cache import InMemoryCache
langchain.llm_cache = InMemoryCache()
```

## Testing Your Setup

### Quick Test

```python
from main_orchestrator import HitlAIOrchestrator

orchestrator = HitlAIOrchestrator()

result = orchestrator.run_test(
    url="https://example.com",
    mission="Click the 'More information' link",
    persona="senior_casual",
    platform="web"
)

print(f"Success: {result['success']}")
print(f"Sentiment: {result['sentiment_score']}")
```

### Memory Test

```python
from memory.vector_store import VectorMemoryStore

memory = VectorMemoryStore()

# Store a lesson
lesson_id = memory.store_lesson(
    lesson_text="Button was hidden in mobile menu",
    url="https://example.com",
    platform="mobile",
    friction_type="visibility",
    resolution="Use hamburger menu selector"
)

# Retrieve it
lessons = memory.retrieve_similar_lessons(
    query="button not visible",
    platform="mobile"
)

print(f"Found {len(lessons)} similar lessons")
```

### Agent Test

```python
from agents.vision_specialist import VisionSpecialist
from config.state_schema import PersonaConfig

specialist = VisionSpecialist()
print(f"Vision Specialist initialized: {specialist.agent.role}")
```

## Next Steps

1. **Customize Personas** - Edit `.windsurf/persona_registry.json`
2. **Add Test Cases** - Create test scripts in `tests/`
3. **Configure CI/CD** - Set up automated testing
4. **Monitor Memory** - Check Pinecone dashboard for stored lessons
5. **Review Reports** - Check `reports/` for generated test reports

## Production Deployment

For production use:

1. Use environment-specific `.env` files
2. Set up proper logging and monitoring
3. Configure database backups
4. Use API key rotation
5. Implement rate limiting
6. Set up alerting for HITL interrupts

## Support

If you encounter issues:

1. Check logs in `logs/`
2. Review screenshots in `screenshots/`
3. Verify API keys in `.env`
4. Ensure all dependencies are installed
5. Check Pinecone index status

---

**Setup Complete!** You're ready to run autonomous cognitive testing.
