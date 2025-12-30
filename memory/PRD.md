# GodBot EchelonCore - Product Requirements Document

## Project Overview
**Name:** GodBot Prototype v1.0  
**Codename:** EchelonCore  
**Type:** Modular AI Agent Framework  
**Tech Stack:** React + FastAPI + MongoDB  

## Original Problem Statement
Build a self-expanding LLM-based automation core capable of multi-agent orchestration, persona layering, and quantum-inspired decision flow with Trinity Fusion multi-model synthesis.

## User Personas
1. **Developers** - Building AI-powered applications, need code assistance
2. **AI Enthusiasts** - Exploring multi-agent systems and persona-based AI
3. **Power Users** - Leveraging full Trinity Fusion for complex tasks

## Core Requirements (Static)
- [x] Command Core ("Godmind") - Central logic + task distribution
- [x] Persona Engine - Custom personality overlays
- [x] Modular Memory Stack - Session-based memory with MongoDB
- [x] Terminal-style chat interface with cyberpunk aesthetic
- [x] Multi-tier system (Free, Pro, Dev+, God Mode)

---

## What's Been Implemented

### December 30, 2025 - Alpha MVP

**Backend (FastAPI):**
- ✅ Trinity Fusion Router architecture for multi-LLM synthesis
- ✅ 4 Default personas: GODMIND, LUMINA, SENTINEL, MAGGIE
- ✅ Session management with MongoDB persistence
- ✅ Memory stack endpoints
- ✅ Tier-based model access (free/pro/dev/god)
- ✅ Intelligent fallback responses when LLMs unavailable
- ✅ RESTful API with 9+ endpoints

**Frontend (React):**
- ✅ Cyberpunk/Synthwave neon dark theme
- ✅ Terminal-style chat interface
- ✅ Persona selector dropdown
- ✅ Tier selector (Free/Pro/Dev+/God Mode)
- ✅ Trinity Fusion status panel in sidebar
- ✅ Session management (create, view, delete)
- ✅ Mobile responsive design
- ✅ Glassmorphism and neon glow effects

**Design:**
- ✅ JetBrains Mono + Unbounded fonts
- ✅ Primary: Magenta (#d946ef)
- ✅ Secondary: Cyan (#06b6d4)
- ✅ Accent: Green (#22c55e)
- ✅ Dark background (#030014)

---

## Prioritized Backlog

### P0 - Critical (Next Sprint)
- [ ] Configure LLM API keys (OpenAI, Cohere, DeepSeek) for full Trinity Fusion
- [ ] Implement actual multi-model parallel calls and fusion logic
- [ ] Add streaming responses for better UX

### P1 - Important
- [ ] Custom persona creation UI
- [ ] Memory visualization panel
- [ ] Export/import sessions
- [ ] Quantum Task Flow board view

### P2 - Nice to Have
- [ ] Plugin system for external model integration
- [ ] User authentication (JWT/OAuth)
- [ ] Rate limiting and usage analytics
- [ ] BuilderBot companion for code generation
- [ ] Voice input/output support

---

## Technical Notes

### API Endpoints
- `GET /api/status` - System status with fusion mode
- `GET /api/trinity` - Trinity stack status
- `GET /api/personas` - List all personas
- `POST /api/chat` - Send message through Trinity Fusion
- `GET/POST/DELETE /api/sessions` - Session management
- `GET/POST /api/memory/{session_id}` - Memory stack

### Environment Variables Needed
```
EMERGENT_LLM_KEY=<provided>
OPENAI_API_KEY=<for MythoMax substitute>
COHERE_API_KEY=<for Command R+>
DEEPSEEK_API_KEY=<for DeepSeek>
```

### Trinity Fusion Weights
- Command R+ 1.5: 40% (logic & task chaining)
- DeepSeek: 35% (code, data, API)
- MythoMax 13B: 25% (emotional, creative)

---

## Next Tasks
1. Obtain and configure API keys for Cohere, DeepSeek, OpenAI
2. Test full Trinity Fusion with all 3 models active
3. Implement streaming responses
4. Add custom persona creation form
5. Build Quantum Task Flow visualization
