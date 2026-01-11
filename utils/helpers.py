import os
import json
from typing import Dict, Any, Optional
from datetime import datetime
from loguru import logger


def load_persona(persona_name: str) -> Optional[Dict]:
    persona_file = ".windsurf/persona_registry.json"
    
    if not os.path.exists(persona_file):
        logger.error(f"Persona registry not found: {persona_file}")
        return None
    
    with open(persona_file, 'r') as f:
        personas = json.load(f)
    
    return personas.get(persona_name)


def validate_config() -> bool:
    required_vars = [
        "OPENAI_API_KEY",
        "ANTHROPIC_API_KEY",
        "PINECONE_API_KEY"
    ]
    
    missing = [var for var in required_vars if not os.getenv(var)]
    
    if missing:
        logger.error(f"Missing required environment variables: {', '.join(missing)}")
        return False
    
    return True


def format_timestamp(dt: datetime = None) -> str:
    if dt is None:
        dt = datetime.now()
    return dt.strftime("%Y-%m-%d %H:%M:%S")


def sanitize_filename(filename: str) -> str:
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        filename = filename.replace(char, '_')
    return filename


def create_directory_structure():
    directories = [
        "logs",
        "reports",
        "screenshots",
        "cache"
    ]
    
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        logger.debug(f"Ensured directory exists: {directory}")


def merge_dicts(base: Dict, override: Dict) -> Dict:
    result = base.copy()
    result.update(override)
    return result


def extract_domain(url: str) -> str:
    from urllib.parse import urlparse
    parsed = urlparse(url)
    return parsed.netloc or parsed.path


def calculate_sentiment_score(friction_points: list) -> float:
    if not friction_points:
        return 1.0
    
    severity_weights = {
        "low": 0.1,
        "medium": 0.3,
        "high": 0.6,
        "critical": 1.0
    }
    
    total_weight = sum(severity_weights.get(fp.severity, 0.5) for fp in friction_points)
    max_possible = len(friction_points) * 1.0
    
    score = 1.0 - (total_weight / max_possible)
    
    return max(0.0, min(1.0, score))
