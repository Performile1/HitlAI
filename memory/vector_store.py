import os
from typing import List, Dict, Optional
from pinecone import Pinecone, ServerlessSpec
from datetime import datetime
import hashlib
import json
from loguru import logger


class VectorMemoryStore:
    
    def __init__(self):
        self.api_key = os.getenv("PINECONE_API_KEY")
        self.environment = os.getenv("PINECONE_ENVIRONMENT", "gcp-starter")
        self.index_name = os.getenv("PINECONE_INDEX_NAME", "performile-memory")
        
        self.pc = Pinecone(api_key=self.api_key)
        self._initialize_index()
    
    def _initialize_index(self):
        existing_indexes = [index.name for index in self.pc.list_indexes()]
        
        if self.index_name not in existing_indexes:
            logger.info(f"Creating new Pinecone index: {self.index_name}")
            self.pc.create_index(
                name=self.index_name,
                dimension=1536,
                metric="cosine",
                spec=ServerlessSpec(
                    cloud="aws",
                    region="us-east-1"
                )
            )
        
        self.index = self.pc.Index(self.index_name)
        logger.info(f"Connected to Pinecone index: {self.index_name}")
    
    def generate_embedding(self, text: str) -> List[float]:
        from openai import OpenAI
        client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        return response.data[0].embedding
    
    def store_lesson(
        self,
        lesson_text: str,
        url: str,
        platform: str,
        friction_type: str,
        resolution: str,
        metadata: Optional[Dict] = None
    ) -> str:
        lesson_id = hashlib.md5(
            f"{url}_{platform}_{friction_type}_{datetime.utcnow().isoformat()}".encode()
        ).hexdigest()
        
        embedding = self.generate_embedding(lesson_text)
        
        vector_metadata = {
            "lesson_id": lesson_id,
            "url": url,
            "platform": platform,
            "friction_type": friction_type,
            "resolution": resolution,
            "timestamp": datetime.utcnow().isoformat(),
            "lesson_text": lesson_text[:1000]
        }
        
        if metadata:
            vector_metadata.update(metadata)
        
        self.index.upsert(
            vectors=[(lesson_id, embedding, vector_metadata)]
        )
        
        logger.info(f"Stored lesson in memory: {lesson_id}")
        return lesson_id
    
    def retrieve_similar_lessons(
        self,
        query: str,
        platform: Optional[str] = None,
        top_k: int = 5
    ) -> List[Dict]:
        query_embedding = self.generate_embedding(query)
        
        filter_dict = {}
        if platform:
            filter_dict["platform"] = platform
        
        results = self.index.query(
            vector=query_embedding,
            top_k=top_k,
            include_metadata=True,
            filter=filter_dict if filter_dict else None
        )
        
        lessons = []
        for match in results.matches:
            lessons.append({
                "id": match.id,
                "score": match.score,
                "metadata": match.metadata
            })
        
        logger.info(f"Retrieved {len(lessons)} similar lessons from memory")
        return lessons
    
    def check_cross_platform_friction(
        self,
        url: str,
        element_description: str,
        current_platform: str
    ) -> Optional[Dict]:
        other_platform = "web" if current_platform == "mobile" else "mobile"
        
        query = f"friction on {url} with {element_description}"
        lessons = self.retrieve_similar_lessons(query, platform=other_platform, top_k=3)
        
        if lessons and lessons[0]["score"] > 0.85:
            logger.warning(
                f"Found similar friction on {other_platform}: {lessons[0]['metadata'].get('friction_type')}"
            )
            return lessons[0]
        
        return None
    
    def get_all_lessons_for_url(self, url: str) -> List[Dict]:
        dummy_query = f"lessons for {url}"
        query_embedding = self.generate_embedding(dummy_query)
        
        results = self.index.query(
            vector=query_embedding,
            top_k=50,
            include_metadata=True,
            filter={"url": url}
        )
        
        return [
            {
                "id": match.id,
                "score": match.score,
                "metadata": match.metadata
            }
            for match in results.matches
        ]
