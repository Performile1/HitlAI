# HitlAI Setup Checklist

Follow these steps in order. Check off each item as you complete it.

## Step 1: Install Python (if needed)

- [ ] Download Python 3.10+ from https://www.python.org/downloads/
- [ ] During installation, **CHECK** "Add Python to PATH"
- [ ] Verify: Open PowerShell and run `python --version`

## Step 2: Install Dependencies

Open PowerShell in `c:\Users\A\Documents\Develop\HitlAI` and run:

```powershell
python -m pip install -r requirements.txt
```

- [ ] All packages installed without errors

## Step 3: Install Playwright Browsers

```powershell
python -m playwright install chromium
```

- [ ] Chromium browser installed successfully

## Step 4: Configure API Keys

### Get Your API Keys

1. **OpenAI** (Required)
   - [ ] Go to https://platform.openai.com/api-keys
   - [ ] Create new key
   - [ ] Copy key (starts with `sk-proj-...`)

2. **Anthropic** (Required)
   - [ ] Go to https://console.anthropic.com/
   - [ ] Create API key
   - [ ] Copy key (starts with `sk-ant-...`)

3. **Pinecone** (Required)
   - [ ] Go to https://app.pinecone.io/
   - [ ] Sign up/login
   - [ ] Create API key
   - [ ] Copy key

4. **Optional Keys** (for enhanced features)
   - [ ] DeepSeek: https://platform.deepseek.com/
   - [ ] ScrapeGraph: https://scrapegraphai.com/

### Edit .env File

- [ ] Open `c:\Users\A\Documents\Develop\HitlAI\.env` in Notepad or VS Code
- [ ] Replace these lines with your actual keys:

```env
OPENAI_API_KEY=sk-proj-YOUR_ACTUAL_KEY_HERE
ANTHROPIC_API_KEY=sk-ant-YOUR_ACTUAL_KEY_HERE
PINECONE_API_KEY=YOUR_ACTUAL_KEY_HERE
```

- [ ] Save the file

## Step 5: Verify Installation

```powershell
python verify_setup.py
```

- [ ] All checks pass ✅

## Step 6: Run Your First Test

```powershell
python examples/basic_test.py
```

- [ ] Test runs without errors
- [ ] Check `reports/` folder for output
- [ ] Check `screenshots/` folder for captures

## Troubleshooting

### Python Not Found
```powershell
# Try these alternatives:
py --version
py -3.10 --version

# Use whichever works for the commands above
```

### Permission Errors
```powershell
# Run PowerShell as Administrator, or:
python -m pip install --user -r requirements.txt
```

### Playwright Fails
```powershell
# Install system dependencies first:
python -m playwright install-deps
python -m playwright install chromium
```

### Import Errors
```powershell
# Make sure you're in the project directory:
cd c:\Users\A\Documents\Develop\HitlAI

# Verify packages:
python -c "import langgraph, crewai, playwright; print('OK')"
```

## What You Get

After setup, you'll have:

- **Autonomous Testing**: AI agents test your sites
- **4 Personas**: senior_casual, young_power_user, accessibility_focused, middle_age_moderate
- **HITL Support**: Human intervention when needed
- **Memory System**: Learns from every test
- **Reports**: Markdown reports with friction points
- **Screenshots**: Visual evidence of issues

## Next Steps

Once setup is complete:

1. **Customize Personas**: Edit `.windsurf/persona_registry.json`
2. **Run Multi-Persona Tests**: `python examples/multi_persona_test.py`
3. **Query Memory**: `python examples/memory_query.py`
4. **Read Docs**: Check `README.md` and `ARCHITECTURE.md`

## Quick Reference

### Test a Website
```python
from main_orchestrator import HitlAIOrchestrator

orchestrator = HitlAIOrchestrator()
result = orchestrator.run_test(
    url="https://your-site.com",
    mission="Navigate to contact page and submit form",
    persona="senior_casual",
    platform="web"
)
print(result['report'])
```

### Check Memory
```python
from memory.vector_store import VectorMemoryStore

memory = VectorMemoryStore()
lessons = memory.retrieve_similar_lessons(
    query="button not clickable",
    platform="mobile"
)
```

---

**Need Help?** 
- Check `INSTALL_WINDOWS.md` for detailed instructions
- Review `logs/` folder for error details
- Ensure `.env` has valid API keys
