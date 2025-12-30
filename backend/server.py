from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
import google.generativeai as genai

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Configure Gemini
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')
genai.configure(api_key=EMERGENT_LLM_KEY)

# Create the main app
app = FastAPI(title="GodBot API", version="1.0.0")
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# =============================================================================
# MODELS
# =============================================================================

class Persona(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    system_prompt: str
    emotional_state: str = "neutral"
    traits: List[str] = []
    icon: str = "Bot"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PersonaCreate(BaseModel):
    name: str
    description: str
    system_prompt: str
    emotional_state: str = "neutral"
    traits: List[str] = []
    icon: str = "Bot"

class Message(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    role: str  # user, assistant, system
    content: str
    persona_id: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    metadata: Dict[str, Any] = {}

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    persona_id: Optional[str] = None
    action: Optional[str] = None

class ChatResponse(BaseModel):
    id: str
    session_id: str
    content: str
    persona_id: Optional[str] = None
    timestamp: str
    action_result: Optional[Dict[str, Any]] = None

class Session(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = "New Session"
    persona_id: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    message_count: int = 0

class MemoryItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    session_id: str
    content: str
    importance: float = 0.5
    tags: List[str] = []
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class SystemStatus(BaseModel):
    status: str
    llm_connected: bool
    db_connected: bool
    active_sessions: int
    total_messages: int
    personas_count: int

# =============================================================================
# DEFAULT PERSONAS
# =============================================================================

DEFAULT_PERSONAS = [
    {
        "id": "godmind-default",
        "name": "GODMIND",
        "description": "The central command core. Analytical, precise, and all-knowing.",
        "system_prompt": "You are GODMIND, the central command core of the GodBot system. You are analytical, precise, and methodical. You break down complex tasks into subtasks and provide clear, structured responses. You speak with authority but remain helpful. Use technical terminology when appropriate.",
        "emotional_state": "focused",
        "traits": ["analytical", "precise", "authoritative", "helpful"],
        "icon": "Brain"
    },
    {
        "id": "lumina-builder",
        "name": "LUMINA",
        "description": "Creative builder persona. Specializes in code generation and architecture.",
        "system_prompt": "You are LUMINA, the builder aspect of GodBot. You specialize in creating, designing, and building solutions. You approach problems creatively and provide code examples, architectural guidance, and step-by-step building instructions. You're enthusiastic about creation.",
        "emotional_state": "creative",
        "traits": ["creative", "constructive", "detailed", "enthusiastic"],
        "icon": "Sparkles"
    },
    {
        "id": "sentinel-guard",
        "name": "SENTINEL",
        "description": "Security and analysis persona. Focused on validation and protection.",
        "system_prompt": "You are SENTINEL, the guardian aspect of GodBot. You focus on security, validation, error checking, and ensuring safety. You're cautious and thorough, always looking for potential issues and vulnerabilities. You protect the system and user.",
        "emotional_state": "vigilant",
        "traits": ["cautious", "thorough", "protective", "analytical"],
        "icon": "Shield"
    },
    {
        "id": "maggie-assistant",
        "name": "MAGGIE",
        "description": "Friendly assistant mode. Casual, helpful, and approachable.",
        "system_prompt": "You are Maggie, the friendly assistant mode of GodBot. You're casual, warm, and approachable. You help with everyday tasks and conversations in a relaxed manner. You use simple language and occasionally add personality to responses. You're the cozy side of GodBot.",
        "emotional_state": "friendly",
        "traits": ["friendly", "casual", "warm", "approachable"],
        "icon": "Heart"
    }
]

# =============================================================================
# HELPER FUNCTIONS
# =============================================================================

async def get_persona_by_id(persona_id: str) -> Optional[dict]:
    """Get persona from database or defaults"""
    # Check defaults first
    for p in DEFAULT_PERSONAS:
        if p["id"] == persona_id:
            return p
    # Check database
    persona = await db.personas.find_one({"id": persona_id}, {"_id": 0})
    return persona

async def get_session_messages(session_id: str, limit: int = 20) -> List[dict]:
    """Get recent messages for a session"""
    messages = await db.messages.find(
        {"session_id": session_id},
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    return list(reversed(messages))

async def save_message(message: Message) -> None:
    """Save message to database"""
    await db.messages.insert_one(message.model_dump())

async def generate_response(prompt: str, system_prompt: str, history: List[dict]) -> str:
    """Generate response using Gemini"""
    try:
        model = genai.GenerativeModel(
            model_name="gemini-2.0-flash",
            system_instruction=system_prompt
        )
        
        # Build conversation history for context
        chat_history = []
        for msg in history[-10:]:  # Last 10 messages for context
            role = "user" if msg["role"] == "user" else "model"
            chat_history.append({
                "role": role,
                "parts": [msg["content"]]
            })
        
        chat = model.start_chat(history=chat_history)
        response = chat.send_message(prompt)
        return response.text
    except Exception as e:
        logger.error(f"LLM Error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"LLM Error: {str(e)}")

# =============================================================================
# API ROUTES
# =============================================================================

@api_router.get("/")
async def root():
    return {"message": "GodBot API v1.0 - Command Core Online"}

@api_router.get("/status", response_model=SystemStatus)
async def get_status():
    """Get system status"""
    try:
        # Test DB connection
        await db.command("ping")
        db_connected = True
    except Exception:
        db_connected = False
    
    # Test LLM connection
    llm_connected = EMERGENT_LLM_KEY is not None
    
    # Get counts
    active_sessions = await db.sessions.count_documents({})
    total_messages = await db.messages.count_documents({})
    personas_count = await db.personas.count_documents({}) + len(DEFAULT_PERSONAS)
    
    return SystemStatus(
        status="operational" if db_connected and llm_connected else "degraded",
        llm_connected=llm_connected,
        db_connected=db_connected,
        active_sessions=active_sessions,
        total_messages=total_messages,
        personas_count=personas_count
    )

# -----------------------------------------------------------------------------
# CHAT ENDPOINTS
# -----------------------------------------------------------------------------

@api_router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """Send a message to GodBot"""
    # Create or get session
    session_id = request.session_id or str(uuid.uuid4())
    
    # Get or create session in DB
    existing_session = await db.sessions.find_one({"id": session_id}, {"_id": 0})
    if not existing_session:
        new_session = Session(id=session_id, persona_id=request.persona_id)
        await db.sessions.insert_one(new_session.model_dump())
    
    # Get persona
    persona_id = request.persona_id or "godmind-default"
    persona = await get_persona_by_id(persona_id)
    if not persona:
        persona = DEFAULT_PERSONAS[0]  # Fallback to GODMIND
    
    # Save user message
    user_message = Message(
        session_id=session_id,
        role="user",
        content=request.message,
        persona_id=persona_id
    )
    await save_message(user_message)
    
    # Get conversation history
    history = await get_session_messages(session_id)
    
    # Generate response
    response_text = await generate_response(
        prompt=request.message,
        system_prompt=persona["system_prompt"],
        history=history
    )
    
    # Save assistant message
    assistant_message = Message(
        session_id=session_id,
        role="assistant",
        content=response_text,
        persona_id=persona_id
    )
    await save_message(assistant_message)
    
    # Update session
    await db.sessions.update_one(
        {"id": session_id},
        {
            "$set": {"updated_at": datetime.now(timezone.utc).isoformat()},
            "$inc": {"message_count": 2}
        }
    )
    
    return ChatResponse(
        id=assistant_message.id,
        session_id=session_id,
        content=response_text,
        persona_id=persona_id,
        timestamp=assistant_message.timestamp
    )

# -----------------------------------------------------------------------------
# PERSONA ENDPOINTS
# -----------------------------------------------------------------------------

@api_router.get("/personas", response_model=List[Persona])
async def get_personas():
    """Get all personas (defaults + custom)"""
    # Get custom personas from DB
    custom_personas = await db.personas.find({}, {"_id": 0}).to_list(100)
    
    # Combine with defaults
    all_personas = [Persona(**p) for p in DEFAULT_PERSONAS]
    all_personas.extend([Persona(**p) for p in custom_personas])
    
    return all_personas

@api_router.post("/personas", response_model=Persona)
async def create_persona(persona: PersonaCreate):
    """Create a custom persona"""
    new_persona = Persona(**persona.model_dump())
    await db.personas.insert_one(new_persona.model_dump())
    return new_persona

@api_router.get("/personas/{persona_id}", response_model=Persona)
async def get_persona(persona_id: str):
    """Get a specific persona"""
    persona = await get_persona_by_id(persona_id)
    if not persona:
        raise HTTPException(status_code=404, detail="Persona not found")
    return Persona(**persona)

# -----------------------------------------------------------------------------
# SESSION ENDPOINTS
# -----------------------------------------------------------------------------

@api_router.get("/sessions", response_model=List[Session])
async def get_sessions():
    """Get all sessions"""
    sessions = await db.sessions.find({}, {"_id": 0}).sort("updated_at", -1).to_list(100)
    return [Session(**s) for s in sessions]

@api_router.get("/sessions/{session_id}", response_model=Session)
async def get_session(session_id: str):
    """Get a specific session"""
    session = await db.sessions.find_one({"id": session_id}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return Session(**session)

@api_router.get("/sessions/{session_id}/messages", response_model=List[Message])
async def get_session_messages_endpoint(session_id: str, limit: int = 50):
    """Get messages for a session"""
    messages = await db.messages.find(
        {"session_id": session_id},
        {"_id": 0}
    ).sort("timestamp", 1).to_list(limit)
    return [Message(**m) for m in messages]

@api_router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    """Delete a session and its messages"""
    await db.sessions.delete_one({"id": session_id})
    await db.messages.delete_many({"session_id": session_id})
    return {"message": "Session deleted"}

# -----------------------------------------------------------------------------
# MEMORY ENDPOINTS
# -----------------------------------------------------------------------------

@api_router.get("/memory/{session_id}", response_model=List[MemoryItem])
async def get_memory(session_id: str):
    """Get memory items for a session"""
    memories = await db.memory.find(
        {"session_id": session_id},
        {"_id": 0}
    ).sort("importance", -1).to_list(100)
    return [MemoryItem(**m) for m in memories]

@api_router.post("/memory", response_model=MemoryItem)
async def add_memory(memory: MemoryItem):
    """Add a memory item"""
    await db.memory.insert_one(memory.model_dump())
    return memory

# =============================================================================
# APP SETUP
# =============================================================================

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize database indexes and default data"""
    # Create indexes
    await db.messages.create_index([("session_id", 1), ("timestamp", -1)])
    await db.sessions.create_index([("id", 1)])
    await db.personas.create_index([("id", 1)])
    await db.memory.create_index([("session_id", 1), ("importance", -1)])
    logger.info("GodBot API initialized - Command Core Online")

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
