import { useState, useRef, useEffect } from "react";
import { X, Send, Bot, Loader2, Minimize2 } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const SYSTEM_PROMPT = `Tu es JobBot, l'assistant IA de la plateforme "Emploi Maroc IA". 
Tu aides les utilisateurs à :
- Trouver des offres d'emploi au Maroc adaptées à leur profil
- Comprendre comment utiliser la plateforme (recherche, filtres, CV, matching IA)
- Obtenir des conseils pour améliorer leur CV et lettre de motivation
- Préparer des entretiens d'embauche
- Comprendre le marché de l'emploi marocain (secteurs porteurs, salaires, villes)
- Naviguer sur le site : /search pour chercher des offres, /dashboard pour le tableau de bord, /cv/upload pour uploader son CV

Tu répondras en français (ou dans la langue de l'utilisateur).
Tu seras concis, professionnel et encourageant.
Si on te pose une question hors sujet emploi, recentre gentiment la conversation.`;

declare global {
  interface Window {
    puter?: {
      ai?: {
        chat: (prompt: string, options?: { model?: string }) => Promise<any>;
      };
    };
  }
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Bonjour ! Je suis **JobBot**, votre assistant IA pour l'emploi au Maroc.\n\nJe peux vous aider à :\n• Trouver des offres adaptées à votre profil\n• Analyser et améliorer votre CV\n• Préparer vos entretiens\n• Naviguer sur la plateforme\n\nComment puis-je vous aider ?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    // Build context from conversation
    const conversationHistory = messages
      .filter(m => m.id !== "welcome")
      .map(m => `${m.role === "user" ? "Utilisateur" : "JobBot"}: ${m.content}`)
      .join("\n");

    const fullPrompt = `${SYSTEM_PROMPT}\n\n${conversationHistory ? `Historique:\n${conversationHistory}\n\n` : ""}Utilisateur: ${text}\n\nJobBot:`;

    const assistantMsgId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, assistantMsg]);

    try {
      if (window.puter?.ai) {
        const response = await window.puter.ai.chat(fullPrompt, { model: "gpt-4o-mini" });
        const content = typeof response === "string"
          ? response
          : response?.message?.content || response?.content || "Je n'ai pas pu obtenir une réponse.";

        setMessages(prev =>
          prev.map(m => m.id === assistantMsgId ? { ...m, content } : m)
        );
      } else {
        // Fallback if puter.js not loaded
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMsgId
              ? {
                  ...m,
                  content:
                    "⚠️ L'assistant IA n'est pas disponible pour le moment. Veuillez rafraîchir la page et réessayer.\n\nEn attendant, vous pouvez :\n• Explorer les offres via **Recherche**\n• Uploader votre CV via le **Tableau de bord**",
                }
              : m
          )
        );
      }
    } catch (err: any) {
      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMsgId
            ? {
                ...m,
                content: "❌ Une erreur s'est produite. Veuillez réessayer dans quelques instants.",
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Render markdown-ish (bold and bullets)
  const renderContent = (content: string) => {
    const parts = content.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={i}>{part.slice(2, -2)}</strong>;
      }
      return part.split("\n").map((line, j) => (
        <span key={`${i}-${j}`}>
          {j > 0 && <br />}
          {line}
        </span>
      ));
    });
  };

  return (
    <>
      {/* Floating bubble */}
      {!isOpen && (
        <button
          id="chatbot-bubble"
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
            boxShadow: "0 8px 32px rgba(99,102,241,0.5)",
          }}
          title="Ouvrir le chat IA"
        >
          <Bot className="w-6 h-6 text-white" />
          <span
            className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white animate-pulse"
            title="En ligne"
          />
        </button>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div
          id="chatbot-panel"
          className="fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl overflow-hidden shadow-2xl transition-all duration-300"
          style={{
            width: "380px",
            height: isMinimized ? "60px" : "560px",
            background: "rgba(15, 15, 25, 0.97)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(99,102,241,0.3)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
            style={{
              background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
              minHeight: "60px",
            }}
            onClick={() => setIsMinimized(!isMinimized)}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border border-indigo-600" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm">JobBot IA</p>
                <p className="text-indigo-200 text-xs">Assistant Emploi Maroc</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
                className="text-white/70 hover:text-white transition-colors p-1 rounded"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); setIsMinimized(false); }}
                className="text-white/70 hover:text-white transition-colors p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div
                className="flex-1 overflow-y-auto p-4 space-y-3"
                style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(99,102,241,0.3) transparent" }}
              >
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-7 h-7 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-indigo-400" />
                      </div>
                    )}
                    <div
                      className="max-w-[80%] px-3 py-2 rounded-xl text-sm leading-relaxed"
                      style={
                        msg.role === "user"
                          ? {
                              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                              color: "white",
                              borderRadius: "16px 4px 16px 16px",
                            }
                          : {
                              background: "rgba(255,255,255,0.06)",
                              color: "rgba(255,255,255,0.9)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              borderRadius: "4px 16px 16px 16px",
                            }
                      }
                    >
                      {msg.content === "" ? (
                        <span className="flex gap-1 items-center py-1">
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </span>
                      ) : (
                        renderContent(msg.content)
                      )}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick suggestions */}
              {messages.length === 1 && (
                <div className="px-4 pb-2 flex flex-wrap gap-2">
                  {["Offres à Casablanca", "Améliorer mon CV", "Préparer un entretien", "Comment fonctionne le matching ?"].map(s => (
                    <button
                      key={s}
                      onClick={() => { setInput(s); setTimeout(sendMessage, 0); }}
                      className="text-xs px-3 py-1.5 rounded-full border border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div
                className="flex items-center gap-2 px-4 py-3 border-t"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Posez votre question..."
                  disabled={isLoading}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-indigo-500/50 transition-colors"
                  id="chatbot-input"
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !input.trim()}
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95"
                  style={{
                    background: isLoading || !input.trim()
                      ? "rgba(99,102,241,0.2)"
                      : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                  }}
                  id="chatbot-send"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 text-indigo-300 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 text-white" />
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
