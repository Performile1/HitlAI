"""
Verification script to check if Performile is properly configured.
Run this after installing dependencies and configuring .env
"""

import sys
import os
from pathlib import Path

def check_python_version():
    """Check Python version."""
    version = sys.version_info
    print(f"✓ Python {version.major}.{version.minor}.{version.micro}")
    if version.major < 3 or (version.major == 3 and version.minor < 10):
        print("  ⚠️  Warning: Python 3.10+ recommended")
        return False
    return True

def check_dependencies():
    """Check if required packages are installed."""
    required = [
        'langgraph',
        'crewai',
        'playwright',
        'crawl4ai',
        'openai',
        'anthropic',
        'pinecone',
        'dotenv'
    ]
    
    missing = []
    for package in required:
        try:
            if package == 'dotenv':
                __import__('dotenv')
            else:
                __import__(package)
            print(f"✓ {package}")
        except ImportError:
            print(f"✗ {package} - NOT INSTALLED")
            missing.append(package)
    
    return len(missing) == 0

def check_env_file():
    """Check if .env file exists and has required keys."""
    env_path = Path('.env')
    
    if not env_path.exists():
        print("✗ .env file NOT FOUND")
        print("  Run: Copy-Item .env.template .env")
        return False
    
    print("✓ .env file exists")
    
    with open(env_path, 'r') as f:
        content = f.read()
    
    required_keys = [
        'OPENAI_API_KEY',
        'ANTHROPIC_API_KEY',
        'PINECONE_API_KEY'
    ]
    
    configured = []
    unconfigured = []
    
    for key in required_keys:
        if key in content:
            value = [line.split('=')[1].strip() for line in content.split('\n') if line.startswith(key)]
            if value and value[0] and 'your_' not in value[0].lower():
                configured.append(key)
                print(f"  ✓ {key} configured")
            else:
                unconfigured.append(key)
                print(f"  ✗ {key} needs configuration")
        else:
            unconfigured.append(key)
            print(f"  ✗ {key} missing")
    
    return len(unconfigured) == 0

def check_playwright():
    """Check if Playwright browsers are installed."""
    try:
        from playwright.sync_api import sync_playwright
        print("✓ Playwright installed")
        
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True)
                browser.close()
            print("  ✓ Chromium browser available")
            return True
        except Exception as e:
            print(f"  ✗ Chromium browser not installed")
            print(f"    Run: python -m playwright install chromium")
            return False
    except ImportError:
        print("✗ Playwright not installed")
        return False

def check_directories():
    """Check if required directories exist."""
    dirs = ['logs', 'reports', 'screenshots', '.windsurf']
    
    for dir_name in dirs:
        dir_path = Path(dir_name)
        if dir_path.exists():
            print(f"✓ {dir_name}/ directory exists")
        else:
            print(f"  Creating {dir_name}/ directory...")
            dir_path.mkdir(exist_ok=True)
    
    return True

def main():
    print("="*80)
    print("PERFORMILE SETUP VERIFICATION")
    print("="*80)
    
    print("\n1. Python Version")
    print("-" * 80)
    python_ok = check_python_version()
    
    print("\n2. Dependencies")
    print("-" * 80)
    deps_ok = check_dependencies()
    
    print("\n3. Environment Configuration")
    print("-" * 80)
    env_ok = check_env_file()
    
    print("\n4. Playwright")
    print("-" * 80)
    playwright_ok = check_playwright()
    
    print("\n5. Directories")
    print("-" * 80)
    dirs_ok = check_directories()
    
    print("\n" + "="*80)
    print("SUMMARY")
    print("="*80)
    
    all_ok = python_ok and deps_ok and env_ok and playwright_ok and dirs_ok
    
    if all_ok:
        print("✅ All checks passed! You're ready to run Performile.")
        print("\nNext steps:")
        print("  python examples/basic_test.py")
        print("  python main_orchestrator.py")
    else:
        print("⚠️  Some checks failed. Please fix the issues above.")
        print("\nQuick fixes:")
        if not deps_ok:
            print("  python -m pip install -r requirements.txt")
        if not env_ok:
            print("  Edit .env file with your API keys")
        if not playwright_ok:
            print("  python -m playwright install chromium")
    
    print("="*80)

if __name__ == "__main__":
    main()
