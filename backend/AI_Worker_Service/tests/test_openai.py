"""Quick test script for OpenAI integration."""

import asyncio
import sys
sys.path.insert(0, ".")

from app.infrastructure.llm.openai_client import OpenAIClient
from app.core.config import get_settings


async def test_openai():
    settings = get_settings()
    print(f"OpenAI configured: {settings.has_openai_key}")
    print(f"OpenAI model: {settings.openai_model}")
    print(f"OpenAI base URL: {settings.openai_api_base}")
    
    if not settings.has_openai_key:
        print("ERROR: No OpenAI API key configured!")
        return False
    
    try:
        client = OpenAIClient()
        
        test_prompt = """Generate 2 multiple-choice questions about Python programming basics.
Return ONLY valid JSON in this format:
{"questions": [{"question_content": "...", "options": {"A":"...","B":"...","C":"...","D":"..."}, "correct_answer": "A", "difficulty": "easy", "topic": "Python Basics", "explanation": "..."}]}

Context: Python is a high-level programming language known for its simplicity. It supports multiple programming paradigms including procedural, object-oriented, and functional programming."""
        
        print("\nCalling OpenAI...")
        result, q_count = await client.generate_questions(
            prompt=test_prompt,
            request_id="test-001"
        )
        
        print(f"\nSuccess! Generated {q_count} questions")
        print(f"Response: {result}")
        
        await client.close()
        return True
        
    except Exception as e:
        print(f"ERROR: {e}")
        return False


async def test_llm_router():
    """Test the unified LLM router."""
    from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
    from sqlalchemy.orm import sessionmaker
    
    settings = get_settings()
    print(f"\n{'='*50}")
    print("Testing LLM Model Router")
    print(f"{'='*50}")
    print(f"OpenAI available: {settings.has_openai_key}")
    print(f"Gemini available: {bool(settings.gemini_api_key)}")
    
    # Create a simple async session for testing
    engine = create_async_engine(settings.database_url)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        from app.application.services.llm_model_router import LLMModelRouter
        
        router = LLMModelRouter(db=session, request_id="test-router-001")
        
        test_prompt = """Generate 2 multiple-choice questions about Vietnam history.
Return ONLY valid JSON in this format:
{"questions": [{"question_content": "...", "options": {"A":"...","B":"...","C":"...","D":"..."}, "correct_answer": "A", "difficulty": "easy", "topic": "History", "explanation": "..."}]}

Context: Vietnam is a country in Southeast Asia with a rich history spanning thousands of years."""
        
        print("\nCalling LLM Router (OpenAI -> Gemini -> Local)...")
        
        try:
            result, provider, model = await router.generate_with_fallback(
                prompt=test_prompt,
                context="Vietnam history content",
                topic="Vietnam History",
                quantity=2,
                difficulty="easy"
            )
            
            print(f"\nSuccess!")
            print(f"Provider: {provider}")
            print(f"Model: {model}")
            print(f"Questions generated: {len(result.get('questions', []))}")
            print(f"First question: {result.get('questions', [{}])[0].get('question_content', 'N/A')[:100]}...")
            
            await router.close()
            return True
            
        except Exception as e:
            print(f"ERROR: {e}")
            import traceback
            traceback.print_exc()
            return False


if __name__ == "__main__":
    print("="*50)
    print("OpenAI Integration Test")
    print("="*50)
    
    # Test 1: Direct OpenAI call
    print("\n[Test 1] Direct OpenAI Client")
    print("-"*40)
    success1 = asyncio.run(test_openai())
    
    # Test 2: LLM Router
    print("\n" + "="*50)
    print("[Test 2] LLM Model Router")
    print("-"*40)
    
    # Skip router test if no async DB available
    asyncio.run(test_llm_router())
