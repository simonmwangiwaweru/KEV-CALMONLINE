import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { askKaziAI, ChatMessage } from '../services/aiAdvisorService';
import { formatCurrency } from '../services/financialEngine';
import { 
  Sparkles, 
  Send, 
  X, 
  RotateCcw, 
  Bot, 
  User, 
  Copy, 
  Check, 
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ArrowUpRight,
  TrendingUp,
  ShieldAlert,
  Calendar,
  Wallet
} from 'lucide-react';

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialPrompt?: string;
}

export const AIChatModal: React.FC<AIChatModalProps> = ({
  isOpen,
  onClose,
  initialPrompt
}) => {
  const appContext = useApp();
  const { 
    settings, 
    financialPosition, 
    weeklyStatus, 
    currentWeekInfo, 
    currentUser,
    workerPayments,
    jobs,
    ledger
  } = appContext;

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('calm_ai_chat_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages]);

  // Persist messages in localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('calm_ai_chat_history', JSON.stringify(messages.slice(-30)));
    }
  }, [messages]);

  // Handle initial prompt if triggered from a quick chip
  useEffect(() => {
    if (isOpen && initialPrompt) {
      handleSendMessage(initialPrompt);
    }
  }, [isOpen, initialPrompt]);

  const handleSendMessage = async (textToSend?: string) => {
    const promptText = (textToSend || input).trim();
    if (!promptText || isLoading) return;

    setInput('');
    setErrorMsg(null);

    const userMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const responseText = await askKaziAI(newMessages, appContext);
      const assistantMsg: ChatMessage = {
        id: 'msg_' + (Date.now() + 1),
        role: 'model',
        content: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...newMessages, assistantMsg]);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('[Calm Online AI Advisor Error]', error);
      setErrorMsg(error?.message || 'Failed to connect to Calm Online AI. Please verify your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([]);
    localStorage.removeItem('calm_ai_chat_history');
    setErrorMsg(null);
  };

  // Smart Context-Aware Proactive Prompts
  const unpaidWorkersCount = workerPayments.filter(p => !p.isPaid || p.balanceRemaining > 0).length;
  const pendingJobsCount = jobs.filter(j => j.balanceRemaining > 0).length;

  const quickPrompts = [
    { 
      label: "⚡ What happened?", 
      query: "Give me an executive digest of what happened recently in my business: cash flow, recent receipts, jobs, expenses, and weekly discipline." 
    },
    { 
      label: "💡 What do you suggest?", 
      query: "What is the best financial strategy and priority decisions I should execute right now based on my current cash reserves, liabilities, and safety margins?" 
    },
    { 
      label: unpaidWorkersCount > 0 ? `👥 Pay ${unpaidWorkersCount} unpaid workers` : "👥 Worker liability audit", 
      query: "Audit all unpaid or pending worker wages. Who is owed, for which jobs and dates, and what is our strategy to settle them?" 
    },
    { 
      label: pendingJobsCount > 0 ? `💼 Follow up on ${pendingJobsCount} client debts` : "💼 Pending client balances", 
      query: "List all clients who owe us money, their contact details, days pending, and suggest a polite follow-up message to collect." 
    },
    { 
      label: "🛡️ Safe salary strategy", 
      query: "Can I safely transfer owner salary this week? Analyze net profit, 20% company reserve cushion, and advise on the smartest amount." 
    },
    { 
      label: "🔔 Recall reminders & deadlines", 
      query: "Remind me of all pending deadlines, Saturday tithe obligations, recurring client dues, and any carried-forward items from previous weeks." 
    },
  ];

  if (!isOpen) return null;

  const userGreetingName = currentUser?.displayName 
    ? currentUser.displayName.split(' ')[0] 
    : (currentUser?.email ? currentUser.email.split('@')[0] : 'Partner');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/15 backdrop-blur-[3px] transition-opacity animate-in fade-in duration-200">
      {/* 
        Single Continuous Frosted Glass Sheet:
        No opaque white bands, no color-blocking strips. 
        Background clouds and blue sky shine through continuously.
      */}
      <div 
        className="w-full max-w-3xl h-[92vh] sm:h-[86vh] flex flex-col rounded-[28px] border border-white/50 bg-white/20 backdrop-blur-2xl shadow-[0_20px_60px_rgba(15,23,42,0.12),inset_0_1px_0_rgba(255,255,255,0.60)] overflow-hidden relative text-[var(--text)] animate-modal-enter"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Seamless Glass Header (Translucent, NO OPAQUE WHITE BAND) */}
        <div className="px-6 py-4 border-b border-white/25 flex items-center justify-between bg-white/10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl glass flex items-center justify-center border border-white/60 shadow-xs text-emerald-800 bg-white/30">
              <Sparkles className="w-5 h-5 text-emerald-700 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="t-group text-emerald-900">
                  Calm Online AI Advisor
                </span>
                <span className="text-white/60">·</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-500/30">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="t-label mt-0.5 flex items-center gap-2 flex-wrap text-xs text-[var(--text-2)]">
                <span className="font-mono">{currentWeekInfo.weekId}</span>
                <span>•</span>
                <span className="font-mono font-semibold text-[var(--text)]">
                  {formatCurrency(financialPosition.companyMoney + financialPosition.personalMoney, settings.currency)} Cash
                </span>
                <span>•</span>
                <span className={`font-semibold ${weeklyStatus.status === 'WEEK_COMPLETE' ? 'text-[var(--ok)]' : 'text-amber-800'}`}>
                  {weeklyStatus.status === 'WEEK_COMPLETE' ? '✓ Discipline Complete' : '○ Discipline Open'}
                </span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={handleClearHistory}
                title="Clear Chat History"
                className="icon-btn"
                aria-label="Clear chat"
              >
                <RotateCcw className="w-4 h-4 text-[var(--text-2)]" strokeWidth={1.5} />
              </button>
            )}
            <button
              onClick={onClose}
              className="icon-btn"
              aria-label="Close AI Chat"
            >
              <X className="w-4 h-4 text-[var(--text-2)]" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Seamless Glass Message Feed Area (Completely transparent background) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-none bg-transparent">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-4 sm:p-6 space-y-6 max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-3xl glass flex items-center justify-center border border-white/60 shadow-[var(--glass-shadow)] text-emerald-700 bg-white/30">
                <Bot className="w-8 h-8 text-emerald-600" />
              </div>
              <div className="space-y-1.5">
                <h4 className="t-title text-base sm:text-lg">
                  Welcome, {userGreetingName}
                </h4>
                <p className="text-xs sm:text-sm text-[var(--text-2)] leading-relaxed max-w-md">
                  I am your personalized financial strategist. I track your live books, suggest safer decisions, recall past job details, and remind you of deadlines before they pass.
                </p>
              </div>

              {/* Quick Launch Chips */}
              <div className="w-full space-y-2.5 pt-1">
                <div className="t-caption uppercase tracking-wider text-[var(--text-3)] font-bold">
                  Recommended Questions
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickPrompts.map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(q.query)}
                      className="px-3.5 py-2 glass glass--pill hover:bg-white/40 border border-white/50 text-xs font-semibold text-[var(--text)] transition-all active:scale-95 shadow-[var(--glass-shadow)] cursor-pointer flex items-center gap-1.5 bg-white/20"
                    >
                      <span>{q.label}</span>
                      <ArrowUpRight className="w-3 h-3 text-[var(--text-3)] opacity-70" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((m) => {
                const isUser = m.role === 'user';
                return (
                  <div
                    key={m.id}
                    className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    {!isUser && (
                      <div className="w-8 h-8 rounded-xl glass flex-shrink-0 flex items-center justify-center border border-white/60 text-emerald-700 bg-white/30 shadow-xs mt-1">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-sm relative group transition-all shadow-[var(--glass-shadow)] ${
                      isUser 
                        ? 'glass border border-emerald-500/40 bg-emerald-600/20 text-[var(--text)] rounded-tr-xs backdrop-blur-md font-medium' 
                        : 'glass border border-white/50 text-[var(--text)] bg-white/35 rounded-tl-xs backdrop-blur-md'
                    }`}>
                      {/* Copy button for model responses */}
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(m.id, m.content)}
                          className="absolute top-2.5 right-2.5 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-white/40 text-[var(--text-2)] transition-all cursor-pointer"
                          title="Copy response"
                        >
                          {copiedId === m.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}

                      <div className="whitespace-pre-wrap leading-relaxed space-y-1 text-xs sm:text-sm">
                        {renderMarkdownContent(m.content)}
                      </div>

                      <div className={`text-[10px] mt-2 font-mono ${isUser ? 'text-emerald-900/70 text-right' : 'text-[var(--text-3)] text-left'}`}>
                        {m.timestamp}
                      </div>
                    </div>

                    {isUser && (
                      <div className="w-8 h-8 rounded-xl glass border border-emerald-500/40 bg-emerald-600/25 text-emerald-800 flex-shrink-0 flex items-center justify-center shadow-xs mt-1">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })}

              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="w-8 h-8 rounded-xl glass flex-shrink-0 flex items-center justify-center border border-white/60 text-emerald-700 bg-white/30 shadow-xs mt-1">
                    <Sparkles className="w-4 h-4 animate-spin text-emerald-600" />
                  </div>
                  <div className="glass border border-white/50 rounded-2xl rounded-tl-xs p-3.5 bg-white/35 backdrop-blur-md shadow-[var(--glass-shadow)] flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                    <span className="text-xs font-medium text-[var(--text-2)] ml-2">
                      Reviewing your financial history, strategy & rules...
                    </span>
                  </div>
                </div>
              )}

              {errorMsg && (
                <div className="p-3.5 rounded-2xl glass border border-rose-500/30 bg-rose-500/10 text-rose-800 text-xs flex items-start gap-2.5 shadow-sm">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-bold">Request Failed</p>
                    <p className="mt-0.5 text-rose-700">{errorMsg}</p>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Quick Suggestion Pills above input if conversation is ongoing */}
        {messages.length > 0 && !isLoading && (
          <div className="px-4 py-2 border-t border-white/15 bg-white/10 backdrop-blur-md flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="t-caption text-[var(--text-3)] font-bold shrink-0">Ask next:</span>
            {quickPrompts.slice(0, 4).map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q.query)}
                className="px-3 py-1 text-xs glass glass--pill hover:bg-white/40 border border-white/35 whitespace-nowrap text-[var(--text-2)] hover:text-[var(--text)] transition-colors cursor-pointer shadow-xs bg-white/20"
              >
                {q.label}
              </button>
            ))}
          </div>
        )}

        {/* Seamless Glass Input Bar (NO OPAQUE WHITE BAND) */}
        <div className="p-3 sm:p-4 border-t border-white/20 bg-white/10 backdrop-blur-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask e.g. 'what happened?', 'what is a better strategy?', 'remind me of dues'..."
                disabled={isLoading}
                className="w-full px-4 py-3 rounded-2xl glass-input text-xs sm:text-sm text-[var(--text)] placeholder-[var(--text-3)] border border-white/50 focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all shadow-inner bg-white/30"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="p-3 rounded-2xl glass glass--pill is-active text-[var(--text)] border border-emerald-600/40 bg-emerald-500/20 hover:bg-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-[var(--glow)] active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4 text-emerald-800" strokeWidth={2} />
            </button>
          </form>
          <div className="flex items-center justify-between text-[10px] text-[var(--text-3)] mt-2 px-1">
            <span>Personalized AI Co-Pilot • Calm Online</span>
            <span>Real-Time Business Recall & Reminders</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Basic markdown parser for bold, bullet points, headers, and code
 */
function renderMarkdownContent(text: string) {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    // Check for headers
    if (line.startsWith('### ')) {
      return (
        <h5 key={lineIdx} className="font-bold text-sm text-[var(--text)] mt-2 mb-1 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
          {formatInline(line.slice(4))}
        </h5>
      );
    }
    if (line.startsWith('## ')) {
      return (
        <h4 key={lineIdx} className="font-bold text-sm sm:text-base text-[var(--text)] mt-3 mb-1 border-b border-white/20 pb-1">
          {formatInline(line.slice(3))}
        </h4>
      );
    }
    if (line.startsWith('# ')) {
      return (
        <h3 key={lineIdx} className="font-bold text-base sm:text-lg text-[var(--text)] mt-3 mb-1 border-b border-white/20 pb-1">
          {formatInline(line.slice(2))}
        </h3>
      );
    }

    // Bullet items
    if (line.startsWith('* ') || line.startsWith('- ')) {
      return (
        <div key={lineIdx} className="flex items-start gap-2 ml-1.5 my-0.5">
          <span className="text-emerald-700 text-sm leading-none mt-1">•</span>
          <span className="flex-1">{formatInline(line.slice(2))}</span>
        </div>
      );
    }

    // Numbered list items
    const numberedMatch = line.match(/^(\d+)\.\s+(.*)/);
    if (numberedMatch) {
      return (
        <div key={lineIdx} className="flex items-start gap-2 ml-1.5 my-1">
          <span className="font-mono font-bold text-emerald-800 text-xs mt-0.5 px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">{numberedMatch[1]}</span>
          <span className="flex-1">{formatInline(numberedMatch[2])}</span>
        </div>
      );
    }

    if (line.trim() === '') {
      return <div key={lineIdx} className="h-1.5" />;
    }

    return (
      <p key={lineIdx} className="my-0.5">
        {formatInline(line)}
      </p>
    );
  });
}

function formatInline(str: string): React.ReactNode {
  const parts = str.split(/(\*\*.*?\*\*|`.*?`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-[var(--text)]">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return <code key={i} className="px-1.5 py-0.5 rounded-md glass font-mono text-[11px] border border-white/40 bg-white/30 text-emerald-900">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}
