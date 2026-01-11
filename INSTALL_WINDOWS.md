# Windows Installation Guide

## Prerequisites

### 1. Install Python (if not already installed)

Download and install Python 3.10+ from [python.org](https://www.python.org/downloads/)

**IMPORTANT**: During installation, check "Add Python to PATH"

Verify installation:
```powershell
python --version
# or
py --version
```

### 2. Install Dependencies

Open PowerShell in the project directory and run:

```powershell
# Option 1: If 'python' works
python -m pip install -r requirements.txt

# Option 2: If 'py' launcher works
py -m pip install -r requirements.txt

# Option 3: If you have a specific Python version
py -3.10 -m pip install -r requirements.txt
```

### 3. Install Playwright Browsers

```powershell
# After pip install completes
python -m playwright install chromium

# If you get permission errors, run PowerShell as Administrator
```

### 4. Setup Crawl4AI

```powershell
# Run the setup command
python -c "from crawl4ai import AsyncWebCrawler; print('Crawl4AI ready')"

# If crawl4ai-setup command exists:
crawl4ai-setup
```

## Configuration

### 5. Create .env File

```powershell
# Copy the template
Copy-Item .env.template .env

# Or manually create .env file with your API keys
```

### 6. Add Your API Keys

Edit `.env` file with your credentials:

**Minimum Required:**
```env
OPENAI_API_KEY=sk-proj-your-key-here
ANTHROPIC_API_KEY=sk-ant-your-key-here
PINECONE_API_KEY=your-pinecone-key-here
PINECONE_ENVIRONMENT=gcp-starter
PINECONE_INDEX_NAME=HitlAI-memory
```

**Optional (for enhanced features):**
```env
DEEPSEEK_API_KEY=your-deepseek-key
XAI_API_KEY=your-xai-key
SCRAPEGRAPH_API_KEY=your-scrapegraph-key
CRAWL4AI_API_KEY=your-crawl4ai-key
```

### 7. Get API Keys

- **OpenAI**: https://platform.openai.com/api-keys
- **Anthropic**: https://console.anthropic.com/
- **Pinecone**: https://app.pinecone.io/
- **DeepSeek**: https://platform.deepseek.com/
- **ScrapeGraph**: https://scrapegraphai.com/

## Verification

### 8. Test Installation

```powershell
# Test Python imports
python -c "import langgraph, crewai, playwright; print('Core packages OK')"

# Test Playwright
python -m playwright --version

# Run a basic test
python examples/basic_test.py
```

## Troubleshooting

### Python Not Found
- Reinstall Python with "Add to PATH" checked
- Or manually add Python to PATH:
  - Search "Environment Variables" in Windows
  - Edit "Path" variable
  - Add: `C:\Users\YourName\AppData\Local\Programs\Python\Python310`

### Pip Install Fails
```powershell
# Upgrade pip first
python -m pip install --upgrade pip

# Then retry
python -m pip install -r requirements.txt
```

### Playwright Install Fails
```powershell
# Install system dependencies
python -m playwright install-deps

# Then install browsers
python -m playwright install chromium
```

### Permission Errors
- Run PowerShell as Administrator
- Or use `--user` flag:
```powershell
python -m pip install --user -r requirements.txt
```

### Module Import Errors
```powershell
# Ensure you're in the project directory
cd c:\Users\A\Documents\Develop\HitlAI

# Install in development mode
python -m pip install -e .
```

## Quick Start After Installation

1. **Configure .env** with your API keys
2. **Run basic test**:
```powershell
python examples/basic_test.py
```

3. **Check output**:
   - Reports in `reports/`
   - Screenshots in `screenshots/`
   - Logs in `logs/`

## Virtual Environment (Recommended)

```powershell
# Create virtual environment
python -m venv venv

# Activate it
.\venv\Scripts\Activate.ps1

# If you get execution policy error:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Then activate again
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

## Next Steps

Once installed:
- Read `QUICKSTART.md` for usage examples
- Check `examples/` directory for sample scripts
- Review `SETUP.md` for advanced configuration

---

**Need Help?** Check the logs in `logs/` for detailed error messages.
