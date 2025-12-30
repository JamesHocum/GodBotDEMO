import { useState, useEffect, useRef, useCallback } from "react";
import "@/App.css";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { 
  Brain, Sparkles, Shield, Heart, Send, Plus, Trash2, 
  Settings, Terminal, Cpu, Database, Zap, ChevronDown,
  MessageSquare, Bot, User, Menu, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Icon mapping for personas
const PERSONA_ICONS = {
  Brain: Brain,
  Sparkles: Sparkles,
  Shield: Shield,
  Heart: Heart,
  Bot: Bot,
};

// Status indicator component
const StatusIndicator = ({ status, label }) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-2 rounded-full ${
      status ? 'bg-accent animate-pulse' : 'bg-destructive'
    }`} />
    <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
  </div>
);

// Message bubble component
const MessageBubble = ({ message, persona }) => {
  const isUser = message.role === "user";
  const PersonaIcon = persona ? PERSONA_ICONS[persona.icon] || Bot : Bot;
  
  return (
    <div 
      data-testid={`message-${message.id}`}
      className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''} mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300`}
    >
      <div className={`flex-shrink-0 w-10 h-10 rounded-none flex items-center justify-center border ${
        isUser 
          ? 'bg-secondary/20 border-secondary/50' 
          : 'bg-primary/20 border-primary/50 neon-glow'
      }`}>
        {isUser ? (
          <User className="w-5 h-5 text-secondary" />
        ) : (
          <PersonaIcon className="w-5 h-5 text-primary" />
        )}
      </div>
      <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className={`text-xs uppercase tracking-wider ${
            isUser ? 'text-secondary ml-auto' : 'text-primary'
          }`}>
            {isUser ? 'USER' : persona?.name || 'GODMIND'}
          </span>
          <span className="text-xs text-muted-foreground">
            {new Date(message.timestamp).toLocaleTimeString()}
          </span>
        </div>
        <div className={`p-4 border ${
          isUser 
            ? 'bg-secondary/10 border-secondary/30 text-foreground' 
            : 'glass border-primary/30'
        }`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </div>
  );
};

// Sidebar component
const Sidebar = ({ sessions, currentSession, onSelectSession, onNewSession, onDeleteSession, isOpen, onClose }) => (
  <div className={`
    fixed md:relative inset-y-0 left-0 z-50
    w-72 border-r border-border bg-card/90 backdrop-blur-xl
    transform transition-transform duration-300 ease-out
    ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
  `}>
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 border border-primary/50 flex items-center justify-center neon-glow">
              <Terminal className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold text-primary neon-text">GODBOT</h1>
              <p className="text-xs text-muted-foreground">v1.0 ALPHA</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="md:hidden p-2 hover:bg-muted/50 transition-colors"
            data-testid="close-sidebar-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* New Session Button */}
      <div className="p-4">
        <Button 
          onClick={onNewSession}
          className="w-full rounded-none border border-primary bg-primary/10 text-primary hover:bg-primary hover:text-black transition-all duration-300 font-bold uppercase tracking-widest text-xs"
          data-testid="new-session-btn"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Session
        </Button>
      </div>
      
      {/* Sessions List */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2 pb-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              data-testid={`session-${session.id}`}
              className={`group p-3 border cursor-pointer transition-all duration-300 ${
                currentSession?.id === session.id
                  ? 'border-primary/50 bg-primary/10'
                  : 'border-border hover:border-primary/30 hover:bg-muted/30'
              }`}
              onClick={() => onSelectSession(session)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm truncate">{session.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20 transition-all"
                  data-testid={`delete-session-${session.id}`}
                >
                  <Trash2 className="w-3 h-3 text-destructive" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {session.message_count || 0} messages
              </p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  </div>
);

// Main App Component
function App() {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch initial data
  useEffect(() => {
    fetchPersonas();
    fetchSessions();
    fetchStatus();
    const statusInterval = setInterval(fetchStatus, 30000);
    return () => clearInterval(statusInterval);
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch system status
  const fetchStatus = async () => {
    try {
      const response = await axios.get(`${API}/status`);
      setSystemStatus(response.data);
    } catch (error) {
      console.error("Failed to fetch status:", error);
    }
  };

  // Fetch personas
  const fetchPersonas = async () => {
    try {
      const response = await axios.get(`${API}/personas`);
      setPersonas(response.data);
      // Set default persona
      const godmind = response.data.find(p => p.id === "godmind-default");
      setSelectedPersona(godmind || response.data[0]);
    } catch (error) {
      console.error("Failed to fetch personas:", error);
      toast.error("Failed to load personas");
    }
  };

  // Fetch sessions
  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${API}/sessions`);
      setSessions(response.data);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    }
  };

  // Fetch messages for session
  const fetchMessages = useCallback(async (sessionId) => {
    try {
      const response = await axios.get(`${API}/sessions/${sessionId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }, []);

  // Select session
  const handleSelectSession = useCallback((session) => {
    setCurrentSession(session);
    fetchMessages(session.id);
    setSidebarOpen(false);
  }, [fetchMessages]);

  // Create new session
  const handleNewSession = () => {
    setCurrentSession(null);
    setMessages([]);
    setSidebarOpen(false);
  };

  // Delete session
  const handleDeleteSession = async (sessionId) => {
    try {
      await axios.delete(`${API}/sessions/${sessionId}`);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (currentSession?.id === sessionId) {
        setCurrentSession(null);
        setMessages([]);
      }
      toast.success("Session deleted");
    } catch (error) {
      toast.error("Failed to delete session");
    }
  };

  // Send message
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, {
        message: input,
        session_id: currentSession?.id,
        persona_id: selectedPersona?.id,
      });

      const assistantMessage = {
        id: response.data.id,
        role: "assistant",
        content: response.data.content,
        persona_id: response.data.persona_id,
        timestamp: response.data.timestamp,
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Update session if new
      if (!currentSession) {
        setCurrentSession({ id: response.data.session_id, name: "New Session", message_count: 2 });
        fetchSessions();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to send message");
      // Remove optimistic user message on error
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const PersonaIcon = selectedPersona ? PERSONA_ICONS[selectedPersona.icon] || Bot : Bot;

  return (
    <div className="h-screen flex bg-background text-foreground overflow-hidden">
      <Toaster 
        position="top-right" 
        toastOptions={{
          style: {
            background: '#0a0a0f',
            border: '1px solid rgba(217, 70, 239, 0.5)',
            color: '#e2e8f0',
          },
        }}
      />
      
      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <Sidebar 
        sessions={sessions}
        currentSession={currentSession}
        onSelectSession={handleSelectSession}
        onNewSession={handleNewSession}
        onDeleteSession={handleDeleteSession}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-2 hover:bg-muted/50 transition-colors"
              data-testid="open-sidebar-btn"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            {/* Persona Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="rounded-none border-primary/30 bg-transparent hover:bg-primary/10 gap-2"
                  data-testid="persona-selector"
                >
                  <PersonaIcon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold uppercase tracking-wider">
                    {selectedPersona?.name || "SELECT PERSONA"}
                  </span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-card border-border">
                {personas.map((persona) => {
                  const Icon = PERSONA_ICONS[persona.icon] || Bot;
                  return (
                    <DropdownMenuItem
                      key={persona.id}
                      onClick={() => setSelectedPersona(persona)}
                      className={`cursor-pointer ${
                        selectedPersona?.id === persona.id ? 'bg-primary/20' : ''
                      }`}
                      data-testid={`persona-option-${persona.id}`}
                    >
                      <Icon className="w-4 h-4 mr-2 text-primary" />
                      <div className="flex-1">
                        <p className="font-bold text-sm">{persona.name}</p>
                        <p className="text-xs text-muted-foreground">{persona.description}</p>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" data-testid="create-persona-btn">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Custom Persona
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Status Indicators */}
          <div className="hidden md:flex items-center gap-6">
            <StatusIndicator status={systemStatus?.llm_connected} label="LLM" />
            <StatusIndicator status={systemStatus?.db_connected} label="DB" />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Cpu className="w-3 h-3" />
              <span>{systemStatus?.total_messages || 0} msgs</span>
            </div>
          </div>
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4 md:p-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-24 h-24 mb-8 border border-primary/50 bg-primary/10 flex items-center justify-center neon-glow">
                <Brain className="w-12 h-12 text-primary" />
              </div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4 text-primary neon-text">
                GODBOT COMMAND CORE
              </h2>
              <p className="text-muted-foreground max-w-md mb-8 text-sm md:text-base">
                Initialize communication with the modular AI agent framework. 
                Select a persona and begin your interaction.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {personas.slice(0, 4).map((persona) => {
                  const Icon = PERSONA_ICONS[persona.icon] || Bot;
                  return (
                    <button
                      key={persona.id}
                      onClick={() => setSelectedPersona(persona)}
                      className={`p-4 border transition-all duration-300 ${
                        selectedPersona?.id === persona.id
                          ? 'border-primary bg-primary/20 neon-glow'
                          : 'border-border hover:border-primary/50 hover:bg-muted/30'
                      }`}
                      data-testid={`quick-persona-${persona.id}`}
                    >
                      <Icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <p className="text-xs font-bold uppercase tracking-wider">{persona.name}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {messages.map((message) => (
                <MessageBubble 
                  key={message.id} 
                  message={message} 
                  persona={personas.find(p => p.id === message.persona_id) || selectedPersona}
                />
              ))}
              {isLoading && (
                <div className="flex gap-4 mb-6">
                  <div className="w-10 h-10 rounded-none flex items-center justify-center border bg-primary/20 border-primary/50 neon-glow">
                    <PersonaIcon className="w-5 h-5 text-primary animate-pulse" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs uppercase tracking-wider text-primary">
                        {selectedPersona?.name || 'GODMIND'}
                      </span>
                    </div>
                    <div className="p-4 glass border-primary/30">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Input Area */}
        <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Enter command..."
                  disabled={isLoading}
                  className="w-full bg-black/50 border-b-2 border-muted hover:border-muted-foreground focus:border-primary px-4 py-3 text-foreground placeholder:text-muted-foreground font-mono transition-colors outline-none"
                  data-testid="chat-input"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-accent animate-blink">|</span>
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="rounded-none border border-primary bg-primary/10 text-primary hover:bg-primary hover:text-black transition-all duration-300 px-6 disabled:opacity-50"
                data-testid="send-btn"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-accent" />
                Powered by Gemini 3 Flash
              </span>
              <span>Press Enter to send</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
