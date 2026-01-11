# After Python Installation

Python 3.12 is being installed via winget. Once complete, follow these steps:

## 1. Verify Python Installation

Close and reopen PowerShell, then run:

```powershell
python --version
```

You should see: `Python 3.12.10` (or similar)

## 2. Install HitlAI Dependencies

```powershell
cd c:\Users\A\Documents\Develop\HitlAI
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

This will install:
- langgraph (state machine)
- crewai (agents)
- playwright (browser automation)
- crawl4ai (page scanning)
- openai, anthropic (LLM providers)
- pinecone-client (vector memory)
- And all other dependencies

## 3. Install Playwright Browsers

```powershell
python -m playwright install chromium
```

## 4. Configure Your API Keys

Edit `.env` file and add your keys:

```env
OPENAI_API_KEY=sk-proj-your-actual-key
ANTHROPIC_API_KEY=sk-ant-your-actual-key
PINECONE_API_KEY=your-actual-key
```

Get keys from:
- OpenAI: https://platform.openai.com/api-keys
- Anthropic: https://console.anthropic.com/
- Pinecone: https://app.pinecone.io/

## 5. Verify Setup

```powershell
python verify_setup.py
```

## 6. Run Your First Test

```powershell
python examples/basic_test.py
```

## Troubleshooting

### If Python command not found after install:
1. Close ALL PowerShell windows
2. Open a NEW PowerShell window
3. Try `python --version` again

### If still not found:
```powershell
# Try the py launcher
py --version
py -m pip install -r requirements.txt
```

### Alternative: Add to PATH manually
1. Search "Environment Variables" in Windows
2. Edit "Path" in System Variables
3. Add: `C:\Users\A\AppData\Local\Programs\Python\Python312`
4. Add: `C:\Users\A\AppData\Local\Programs\Python\Python312\Scripts`
5. Restart PowerShell

---

**Next**: Once Python is verified, run the commands above in order.
