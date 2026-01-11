import os
from typing import Dict, Any
from dotenv import load_dotenv

load_dotenv()


class LLMConfig:
    
    @staticmethod
    def get_openai_config() -> Dict[str, Any]:
        return {
            "model": "gpt-4-turbo-preview",
            "api_key": os.getenv("OPENAI_API_KEY"),
            "temperature": 0.7,
            "max_tokens": 4096
        }
    
    @staticmethod
    def get_anthropic_config() -> Dict[str, Any]:
        return {
            "model": "claude-3-5-sonnet-20240620",
            "api_key": os.getenv("ANTHROPIC_API_KEY"),
            "temperature": 0.5,
            "max_tokens": 4096
        }
    
    @staticmethod
    def get_deepseek_config() -> Dict[str, Any]:
        return {
            "model": "deepseek-chat",
            "api_key": os.getenv("DEEPSEEK_API_KEY"),
            "base_url": "https://api.deepseek.com/v1",
            "temperature": 0.3,
            "max_tokens": 8192
        }
    
    @staticmethod
    def get_xai_config() -> Dict[str, Any]:
        return {
            "model": "grok-beta",
            "api_key": os.getenv("XAI_API_KEY"),
            "base_url": "https://api.x.ai/v1",
            "temperature": 0.4,
            "max_tokens": 4096
        }
    
    @staticmethod
    def get_mission_planner_config() -> Dict[str, Any]:
        return LLMConfig.get_openai_config()
    
    @staticmethod
    def get_vision_specialist_config() -> Dict[str, Any]:
        return LLMConfig.get_anthropic_config()
    
    @staticmethod
    def get_technical_executor_config() -> Dict[str, Any]:
        return LLMConfig.get_deepseek_config()
    
    @staticmethod
    def get_verifier_config() -> Dict[str, Any]:
        return LLMConfig.get_xai_config()
