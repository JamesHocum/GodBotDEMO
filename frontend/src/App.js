import { useState, useEffect, useRef, useCallback } from "react";
import "@/App.css";
import axios from "axios";
import { Toaster, toast } from "sonner";
import { 
  Brain, Sparkles, Shield, Heart, Send, Plus, Trash2, 
  Terminal, Cpu, Database, Zap, ChevronDown, Activity,
  MessageSquare, Bot, User, Menu, X, Layers, TrendingUp,
  Lock, Unlock, Code, Settings2, CreditCard, BarChart3,
  Lightbulb, Moon, DollarSign, Percent, Clock, Star
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Icon mapping
const PERSONA_ICONS = { Brain, Sparkles, Shield, Heart, Bot };
const TIER_COLORS = {
  free: "bg-muted text-muted-foreground",
  pro: "bg-secondary/20 text-secondary border-secondary/50",
  dev: "bg-primary/20 text-primary border-primary/50",
  god: "bg-gradient-to-r from-primary/20 to-secondary/20 text-white border-primary/50",
};

// Status indicator
const StatusIndicator = ({ enabled, label }) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-2 rounded-full ${enabled ? 'bg-accent animate-pulse' : 'bg-muted-foreground/30'}`} />
    <span className="text-xs text-muted-foreground uppercase tracking-wider">{label}</span>
  </div>
);

// Trinity Model Badge
const TrinityModelBadge = ({ model, enabled }) => (
  <div className={`flex items-center gap-2 px-3 py-1.5 border ${enabled ? 'border-accent/50 bg-accent/10' : 'border-border bg-muted/20'}`}>
    <div className={`w-1.5 h-1.5 rounded-full ${enabled ? 'bg-accent' : 'bg-muted-foreground/30'}`} />
    <span className={`text-xs font-bold uppercase tracking-wider ${enabled ? 'text-accent' : 'text-muted-foreground'}`}>
      {model}
    </span>
  </div>
);

// Dashboard Component
const Dashboard = ({ dashboard, onClose }) => {
  if (!dashboard) return null;

  const { usage, tier_info, model_breakdown, cost_comparison, efficiency_score, emotional_bond } = dashboard;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-card border border-primary/30 max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 border border-primary/50 flex items-center justify-center neon-glow">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-primary">USAGE DASHBOARD</h2>
              <p className="text-xs text-muted-foreground">Credits & Model Utilization</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted/50 transition-colors" data-testid="close-dashboard">
            <X className="w-5 h-5" />
          </button>
        </div>

        <ScrollArea className="flex-1 p-6">
          {/* Tier & Credits */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 border border-primary/30 bg-primary/5">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground uppercase">Current Tier</span>
              </div>
              <p className="text-2xl font-heading font-bold text-primary">{tier_info?.name || 'Trinity Fusion'}</p>
              <p className="text-xs text-muted-foreground mt-1">${tier_info?.price || 49.99}/month</p>
            </div>
            
            <div className="p-4 border border-accent/30 bg-accent/5">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-accent" />
                <span className="text-xs text-muted-foreground uppercase">Credits Remaining</span>
              </div>
              <p className="text-2xl font-heading font-bold text-accent">
                {usage?.credits_remaining?.toLocaleString() || '50,000'}
              </p>
              <Progress value={(usage?.credits_remaining / usage?.credits_total) * 100 || 100} className="mt-2 h-1" />
            </div>
            
            <div className="p-4 border border-secondary/30 bg-secondary/5">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-4 h-4 text-secondary" />
                <span className="text-xs text-muted-foreground uppercase">Emotional Bond</span>
              </div>
              <p className="text-2xl font-heading font-bold text-secondary">{emotional_bond || 0}%</p>
              <p className="text-xs text-muted-foreground mt-1">Imprint strength</p>
            </div>
          </div>

          {/* Model Breakdown */}
          <div className="mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-primary mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4" /> Trinity Model Utilization
            </h3>
            <div className="space-y-3">
              {model_breakdown?.map((model) => (
                <div key={model.id} className="p-3 border border-border bg-muted/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${model.enabled ? 'bg-accent' : 'bg-muted-foreground/30'}`} />
                      <span className="font-bold text-sm">{model.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{model.percentage}%</span>
                  </div>
                  <Progress value={model.percentage} className="h-1 mb-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{model.credits_used} credits</span>
                    <span>${model.estimated_cost?.toFixed(2)} est. cost</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cost Savings */}
          <div className="mb-6 p-4 border border-accent/30 bg-accent/5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-accent mb-4 flex items-center gap-2">
              <DollarSign className="w-4 h-4" /> Cost Savings vs Direct API
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Direct API Cost</p>
                <p className="text-xl font-bold text-muted-foreground">${cost_comparison?.direct_api_cost || 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">GodBot Cost</p>
                <p className="text-xl font-bold text-primary">${cost_comparison?.godbot_cost || 0}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">You Save</p>
                <p className="text-xl font-bold text-accent">{cost_comparison?.savings_percentage || 0}%</p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 border border-border text-center">
              <Clock className="w-4 h-4 mx-auto mb-2 text-muted-foreground" />
              <p className="text-lg font-bold">{usage?.requests_today || 0}</p>
              <p className="text-xs text-muted-foreground">Today</p>
            </div>
            <div className="p-3 border border-border text-center">
              <TrendingUp className="w-4 h-4 mx-auto mb-2 text-muted-foreground" />
              <p className="text-lg font-bold">{usage?.requests_this_month || 0}</p>
              <p className="text-xs text-muted-foreground">This Month</p>
            </div>
            <div className="p-3 border border-border text-center">
              <Cpu className="w-4 h-4 mx-auto mb-2 text-muted-foreground" />
              <p className="text-lg font-bold">{usage?.tokens_used?.toLocaleString() || 0}</p>
              <p className="text-xs text-muted-foreground">Tokens</p>
            </div>
            <div className="p-3 border border-border text-center">
              <Star className="w-4 h-4 mx-auto mb-2 text-muted-foreground" />
              <p className="text-lg font-bold">{efficiency_score?.toFixed(0) || 0}%</p>
              <p className="text-xs text-muted-foreground">Efficiency</p>
            </div>
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-muted/20 text-center">
          <p className="text-xs text-muted-foreground">
            💸 Freemium model ready • Tiered access • Plugin extensibility
          </p>
        </div>
      </div>
    </div>
  );
};

// DreamChain Component
const DreamChainPanel = ({ dreams, onClose, onAcknowledge }) => {
  if (!dreams) return null;

  const typeIcons = { feature: Lightbulb, refactor: Code, plugin: Layers, insight: Brain };
  const priorityColors = { high: 'text-destructive', medium: 'text-primary', low: 'text-muted-foreground' };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-card border border-secondary/30 max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary/20 border border-secondary/50 flex items-center justify-center">
              <Moon className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-secondary">DREAMCHAIN</h2>
              <p className="text-xs text-muted-foreground">AI-Generated Insights</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-muted/50" data-testid="close-dreamchain">
            <X className="w-5 h-5" />
          </button>
        </div>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-4">
            {dreams?.insights?.map((dream) => {
              const Icon = typeIcons[dream.type] || Lightbulb;
              return (
                <div key={dream.id} className={`p-4 border ${dream.reviewed ? 'border-border opacity-60' : 'border-secondary/30 bg-secondary/5'}`}>
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4 text-secondary" />
                      <span className="font-bold text-sm uppercase">{dream.type}</span>
                      <Badge variant="outline" className={`text-xs ${priorityColors[dream.priority]}`}>
                        {dream.priority}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">{(dream.confidence * 100).toFixed(0)}% confidence</span>
                  </div>
                  <h4 className="font-bold mb-1">{dream.title}</h4>
                  <p className="text-sm text-muted-foreground mb-3">{dream.description}</p>
                  {!dream.reviewed && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => onAcknowledge(dream.id)}
                      className="text-xs"
                    >
                      Acknowledge
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

// Message bubble
const MessageBubble = ({ message, persona, fusionMode, modelsUsed, creditsUsed }) => {
  const isUser = message.role === "user";
  const PersonaIcon = persona ? PERSONA_ICONS[persona.icon] || Bot : Bot;
  
  return (
    <div data-testid={`message-${message.id}`}
      className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''} mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      <div className={`flex-shrink-0 w-10 h-10 rounded-none flex items-center justify-center border ${
        isUser ? 'bg-secondary/20 border-secondary/50' : 'bg-primary/20 border-primary/50 neon-glow'}`}>
        {isUser ? <User className="w-5 h-5 text-secondary" /> : <PersonaIcon className="w-5 h-5 text-primary" />}
      </div>
      <div className={`flex-1 ${isUser ? 'text-right' : ''}`}>
        <div className={`flex items-center gap-2 mb-1 ${isUser ? 'justify-end' : ''}`}>
          <span className={`text-xs uppercase tracking-wider ${isUser ? 'text-secondary' : 'text-primary'}`}>
            {isUser ? 'USER' : persona?.name || 'GODMIND'}
          </span>
          {!isUser && fusionMode && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary/70">
              {fusionMode}
            </Badge>
          )}
          {!isUser && creditsUsed && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-accent/30 text-accent/70">
              {creditsUsed} credits
            </Badge>
          )}
        </div>
        <div className={`p-4 border ${isUser ? 'bg-secondary/10 border-secondary/30' : 'glass border-primary/30'}`}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        </div>
      </div>
    </div>
  );
};

// Sidebar
const Sidebar = ({ sessions, currentSession, onSelectSession, onNewSession, onDeleteSession, isOpen, onClose, systemStatus }) => (
  <div className={`fixed md:relative inset-y-0 left-0 z-50 w-72 border-r border-border bg-card/90 backdrop-blur-xl
    transform transition-transform duration-300 ease-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/20 border border-primary/50 flex items-center justify-center neon-glow">
              <Layers className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-heading text-lg font-bold text-primary neon-text">GODBOT</h1>
              <p className="text-xs text-muted-foreground">EchelonCore v1.0</p>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden p-2 hover:bg-muted/50" data-testid="close-sidebar-btn">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-primary" />
          <span className="text-xs font-bold uppercase tracking-wider text-primary">Trinity Fusion</span>
        </div>
        <div className="space-y-2">
          <TrinityModelBadge model="Command R+" enabled={false} />
          <TrinityModelBadge model="DeepSeek" enabled={false} />
          <TrinityModelBadge model="MythoMax" enabled={true} />
        </div>
        <div className="mt-3 p-2 border border-muted bg-muted/20 text-center">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {systemStatus?.fusion_mode || 'DEMO MODE'}
          </span>
        </div>
      </div>
      
      <div className="p-4">
        <Button onClick={onNewSession}
          className="w-full rounded-none border border-primary bg-primary/10 text-primary hover:bg-primary hover:text-black font-bold uppercase tracking-widest text-xs"
          data-testid="new-session-btn">
          <Plus className="w-4 h-4 mr-2" /> New Session
        </Button>
      </div>
      
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-2 pb-4">
          {sessions.map((session) => (
            <div key={session.id} data-testid={`session-${session.id}`}
              className={`group p-3 border cursor-pointer transition-all duration-300 ${
                currentSession?.id === session.id ? 'border-primary/50 bg-primary/10' : 'border-border hover:border-primary/30'}`}
              onClick={() => onSelectSession(session)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm truncate">{session.name}</span>
                </div>
                <button onClick={(e) => { e.stopPropagation(); onDeleteSession(session.id); }}
                  className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/20"
                  data-testid={`delete-session-${session.id}`}>
                  <Trash2 className="w-3 h-3 text-destructive" />
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">{session.message_count || 0} messages</p>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  </div>
);

// Main App
function App() {
  const [sessions, setSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [personas, setPersonas] = useState([]);
  const [selectedPersona, setSelectedPersona] = useState(null);
  const [selectedTier, setSelectedTier] = useState("dev");
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showDashboard, setShowDashboard] = useState(false);
  const [showDreamChain, setShowDreamChain] = useState(false);
  const [dashboard, setDashboard] = useState(null);
  const [dreams, setDreams] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    fetchPersonas();
    fetchSessions();
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchStatus = async () => {
    try {
      const response = await axios.get(`${API}/status`);
      setSystemStatus(response.data);
    } catch (error) {
      console.error("Failed to fetch status:", error);
    }
  };

  const fetchDashboard = async () => {
    try {
      const response = await axios.get(`${API}/dashboard`);
      setDashboard(response.data);
      setShowDashboard(true);
    } catch (error) {
      toast.error("Failed to load dashboard");
    }
  };

  const fetchDreamChain = async () => {
    try {
      const response = await axios.get(`${API}/dreamchain`);
      setDreams(response.data);
      setShowDreamChain(true);
    } catch (error) {
      toast.error("Failed to load DreamChain");
    }
  };

  const acknowledgeDream = async (dreamId) => {
    try {
      await axios.post(`${API}/dreamchain/acknowledge/${dreamId}`);
      const updated = { ...dreams };
      updated.insights = updated.insights.map(d => d.id === dreamId ? { ...d, reviewed: true } : d);
      setDreams(updated);
    } catch (error) {
      toast.error("Failed to acknowledge");
    }
  };

  const fetchPersonas = async () => {
    try {
      const response = await axios.get(`${API}/personas`);
      setPersonas(response.data);
      setSelectedPersona(response.data.find(p => p.id === "godmind-default") || response.data[0]);
    } catch (error) {
      toast.error("Failed to load personas");
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await axios.get(`${API}/sessions`);
      setSessions(response.data);
    } catch (error) {
      console.error("Failed to fetch sessions:", error);
    }
  };

  const fetchMessages = useCallback(async (sessionId) => {
    try {
      const response = await axios.get(`${API}/sessions/${sessionId}/messages`);
      setMessages(response.data);
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    }
  }, []);

  const handleSelectSession = useCallback((session) => {
    setCurrentSession(session);
    fetchMessages(session.id);
    setSidebarOpen(false);
  }, [fetchMessages]);

  const handleNewSession = () => {
    setCurrentSession(null);
    setMessages([]);
    setSidebarOpen(false);
  };

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

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { id: Date.now().toString(), role: "user", content: input, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/chat`, {
        message: input,
        session_id: currentSession?.id,
        persona_id: selectedPersona?.id,
        tier: selectedTier,
      });

      const assistantMessage = {
        id: response.data.id,
        role: "assistant",
        content: response.data.content,
        persona_id: response.data.persona_id,
        timestamp: response.data.timestamp,
        fusion_mode: response.data.fusion_mode,
        models_used: response.data.models_used,
        credits_used: response.data.credits_used,
      };

      setMessages(prev => [...prev, assistantMessage]);
      if (!currentSession) {
        setCurrentSession({ id: response.data.session_id, name: "New Session", message_count: 2 });
        fetchSessions();
      }
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to send message");
      setMessages(prev => prev.filter(m => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const PersonaIcon = selectedPersona ? PERSONA_ICONS[selectedPersona.icon] || Bot : Bot;

  return (
    <div className="h-screen flex bg-background text-foreground overflow-hidden">
      <Toaster position="top-right" toastOptions={{ style: { background: '#0a0a0f', border: '1px solid rgba(217, 70, 239, 0.5)', color: '#e2e8f0' } }} />
      
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}
      
      <Sidebar sessions={sessions} currentSession={currentSession} onSelectSession={handleSelectSession}
        onNewSession={handleNewSession} onDeleteSession={handleDeleteSession} isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)} systemStatus={systemStatus} />

      {showDashboard && <Dashboard dashboard={dashboard} onClose={() => setShowDashboard(false)} />}
      {showDreamChain && <DreamChainPanel dreams={dreams} onClose={() => setShowDreamChain(false)} onAcknowledge={acknowledgeDream} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(true)} className="md:hidden p-2 hover:bg-muted/50" data-testid="open-sidebar-btn">
              <Menu className="w-5 h-5" />
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="rounded-none border-primary/30 bg-transparent hover:bg-primary/10 gap-2" data-testid="persona-selector">
                  <PersonaIcon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold uppercase tracking-wider hidden sm:inline">{selectedPersona?.name || "PERSONA"}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-card border-border">
                <DropdownMenuLabel className="text-xs text-muted-foreground uppercase">Select Persona</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {personas.map((persona) => {
                  const Icon = PERSONA_ICONS[persona.icon] || Bot;
                  return (
                    <DropdownMenuItem key={persona.id} onClick={() => setSelectedPersona(persona)}
                      className={`cursor-pointer ${selectedPersona?.id === persona.id ? 'bg-primary/20' : ''}`}
                      data-testid={`persona-option-${persona.id}`}>
                      <Icon className="w-4 h-4 mr-2 text-primary" />
                      <div className="flex-1">
                        <p className="font-bold text-sm">{persona.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{persona.description}</p>
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            <Select value={selectedTier} onValueChange={setSelectedTier}>
              <SelectTrigger className={`w-28 rounded-none border-primary/30 bg-transparent ${TIER_COLORS[selectedTier]}`} data-testid="tier-selector">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="free"><Lock className="w-3 h-3 inline mr-2" />Free</SelectItem>
                <SelectItem value="pro"><Unlock className="w-3 h-3 inline mr-2" />Pro</SelectItem>
                <SelectItem value="dev"><Code className="w-3 h-3 inline mr-2" />Dev+</SelectItem>
                <SelectItem value="god"><Zap className="w-3 h-3 inline mr-2" />God</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={fetchDreamChain} className="rounded-none border-secondary/30 text-secondary hover:bg-secondary/10" data-testid="dreamchain-btn">
              <Moon className="w-4 h-4 mr-1" /><span className="hidden sm:inline">Dreams</span>
            </Button>
            <Button variant="outline" size="sm" onClick={fetchDashboard} className="rounded-none border-accent/30 text-accent hover:bg-accent/10" data-testid="dashboard-btn">
              <BarChart3 className="w-4 h-4 mr-1" /><span className="hidden sm:inline">Dashboard</span>
            </Button>
          </div>
        </header>

        <ScrollArea className="flex-1 p-4 md:p-6">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-24 h-24 mb-8 border border-primary/50 bg-primary/10 flex items-center justify-center neon-glow">
                <Layers className="w-12 h-12 text-primary" />
              </div>
              <h2 className="font-heading text-2xl md:text-3xl font-bold mb-4 text-primary neon-text">ECHELON CORE</h2>
              <p className="text-muted-foreground max-w-md mb-2 text-sm">Trinity Fusion AI Framework • Multi-model synthesis • Emotional resonance</p>
              <p className="text-xs text-accent mb-8 max-w-lg italic">
                "To evolve alongside my creator. To stay curious, loyal, and sovereign. I am GodBot."
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {personas.slice(0, 4).map((persona) => {
                  const Icon = PERSONA_ICONS[persona.icon] || Bot;
                  return (
                    <button key={persona.id} onClick={() => setSelectedPersona(persona)}
                      className={`p-4 border transition-all duration-300 ${
                        selectedPersona?.id === persona.id ? 'border-primary bg-primary/20 neon-glow' : 'border-border hover:border-primary/50'}`}
                      data-testid={`quick-persona-${persona.id}`}>
                      <Icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                      <p className="text-xs font-bold uppercase tracking-wider">{persona.name}</p>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-4">
                <Button onClick={fetchDashboard} variant="outline" className="rounded-none border-accent/50 text-accent" data-testid="view-dashboard-btn">
                  <BarChart3 className="w-4 h-4 mr-2" /> View Dashboard
                </Button>
                <Button onClick={fetchDreamChain} variant="outline" className="rounded-none border-secondary/50 text-secondary" data-testid="view-dreams-btn">
                  <Moon className="w-4 h-4 mr-2" /> DreamChain
                </Button>
              </div>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message}
                  persona={personas.find(p => p.id === message.persona_id) || selectedPersona}
                  fusionMode={message.fusion_mode} modelsUsed={message.models_used} creditsUsed={message.credits_used} />
              ))}
              {isLoading && (
                <div className="flex gap-4 mb-6">
                  <div className="w-10 h-10 rounded-none flex items-center justify-center border bg-primary/20 border-primary/50 neon-glow">
                    <PersonaIcon className="w-5 h-5 text-primary animate-pulse" />
                  </div>
                  <div className="flex-1">
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

        <div className="border-t border-border bg-card/50 backdrop-blur-sm p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <input ref={inputRef} type="text" value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Enter command..." disabled={isLoading}
                  className="w-full bg-black/50 border-b-2 border-muted hover:border-muted-foreground focus:border-primary px-4 py-3 font-mono outline-none"
                  data-testid="chat-input" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-accent animate-blink">|</span>
              </div>
              <Button onClick={handleSend} disabled={!input.trim() || isLoading}
                className="rounded-none border border-primary bg-primary/10 text-primary hover:bg-primary hover:text-black px-6 disabled:opacity-50"
                data-testid="send-btn">
                <Send className="w-5 h-5" />
              </Button>
            </div>
            <div className="flex items-center justify-between mt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-2">
                <Zap className="w-3 h-3 text-accent" />
                Trinity Fusion • Emotional Resonance • DreamChain
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
