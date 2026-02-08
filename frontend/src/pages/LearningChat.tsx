import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, User as UserIcon, Bot, ArrowLeft,
    Sparkles, Zap, BrainCircuit, MessageSquare,
    Terminal, Info, ChevronRight, Loader2,
    Command
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const PREMIUM_EASE = [0.16, 1, 0.3, 1];

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const Waveform = () => (
    <div className="flex items-center gap-1 h-4">
        {[0, 1, 2, 3].map((i) => (
            <motion.div
                key={i}
                animate={{
                    height: [4, 12, 4],
                    opacity: [0.3, 1, 0.3]
                }}
                transition={{
                    duration: 1,
                    repeat: Infinity,
                    delay: i * 0.15,
                    ease: "easeInOut"
                }}
                className="w-0.5 bg-indigo-400 rounded-full"
            />
        ))}
    </div>
);

const SuggestionChip = ({ text, onClick }: { text: string; onClick: () => void }) => (
    <motion.button
        whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="px-4 py-2 bg-white/5 border border-white/5 rounded-full text-[11px] font-medium text-zinc-400 hover:text-white transition-colors"
    >
        {text}
    </motion.button>
);

export default function LearningChat() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async (overrideMsg?: string) => {
        const textToSend = overrideMsg || input;
        if (!textToSend.trim()) return;

        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: textToSend }]);
        setLoading(true);

        try {
            const response = await axios.post(`http://localhost:8000/learning/chat`, {
                message: textToSend
            });
            setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
        } catch (error) {
            console.error("Chat failed", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "I encountered a system interrupt. Please re-initiate or try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-zinc-950 text-white selection:bg-indigo-500/30 overflow-hidden font-sans">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none -z-10">
                <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-[10%] right-[20%] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]" />
            </div>

            {/* 1. Header Zone */}
            <header className="h-20 border-b border-white/5 backdrop-blur-xl bg-zinc-950/50 flex items-center justify-between px-8 z-20 shrink-0">
                <div className="flex items-center gap-6">
                    <motion.button
                        whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.05)' }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/dashboard')}
                        className="p-2.5 rounded-xl border border-white/5 text-zinc-400 hover:text-white transition-all"
                    >
                        <ArrowLeft size={18} />
                    </motion.button>
                    <div className="h-8 w-px bg-white/5" />
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm font-black uppercase tracking-[0.2em] text-white/90">AI Learning Assistant</h1>
                            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                                <span className="text-[8px] font-black tracking-widest text-emerald-500 uppercase">System: Online</span>
                            </div>
                        </div>
                        <p className="text-[10px] font-medium text-zinc-500 tracking-wide uppercase opacity-70">Expert Technical Mentor V2.0_CORE</p>
                    </div>
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-7 h-7 rounded-full bg-zinc-800 border-2 border-zinc-950 overflow-hidden flex items-center justify-center text-[10px] font-bold text-zinc-600">
                                {String.fromCharCode(64 + i)}
                            </div>
                        ))}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-[0.1em] text-zinc-600">Sync Active</span>
                </div>
            </header>

            {/* 2. Chat Workspace (Main Content) */}
            <div className="flex-1 overflow-y-auto px-6 py-10 space-y-8 scroll-smooth scrollbar-hide">
                <div className="max-w-4xl mx-auto space-y-8">

                    <AnimatePresence mode="popLayout">
                        {messages.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                transition={{ duration: 0.8, ease: PREMIUM_EASE }}
                                className="py-20 flex flex-col items-center justify-center text-center space-y-8"
                            >
                                <div className="relative">
                                    <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full" />
                                    <div className="relative p-6 bg-zinc-900 border border-white/5 rounded-[32px] shadow-2xl">
                                        <Bot size={48} className="text-indigo-400" strokeWidth={1.5} />
                                    </div>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                        className="absolute -top-4 -right-4 p-2 bg-zinc-900 border border-white/5 rounded-full shadow-lg"
                                    >
                                        <Sparkles size={16} className="text-indigo-400" />
                                    </motion.div>
                                </div>

                                <div className="space-y-3">
                                    <h2 className="text-3xl font-black tracking-tight text-white/90">Hello, {user?.full_name?.split(' ')[0] || 'Engineer'}.</h2>
                                    <p className="text-zinc-500 font-medium max-w-sm mx-auto leading-relaxed">
                                        I am your technical mentor. Ask me to explain complex DSA, design systems, or review your interview strategy.
                                    </p>
                                </div>

                                <div className="flex flex-wrap justify-center gap-3 max-w-lg">
                                    <SuggestionChip text="Explain Binary Search" onClick={() => sendMessage("Explain Binary Search in simple terms")} />
                                    <SuggestionChip text="System Design: Rate Limiter" onClick={() => sendMessage("How do I design a distributed rate limiter?")} />
                                    <SuggestionChip text="DSA Preparation Roadmap" onClick={() => sendMessage("What is a good 4-week roadmap for DSA?")} />
                                    <SuggestionChip text="Mock Mock Interview" onClick={() => sendMessage("Can you act as an interviewer and ask me a system design question?")} />
                                </div>
                            </motion.div>
                        ) : (
                            messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, ease: PREMIUM_EASE }}
                                    className={`flex items-start gap-5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                                >
                                    <div className={`p-3 rounded-2xl shrink-0 ${msg.role === 'user'
                                            ? 'bg-zinc-800 text-zinc-400'
                                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                        }`}>
                                        {msg.role === 'user' ? <UserIcon size={20} /> : <Bot size={20} />}
                                    </div>
                                    <div className={`max-w-[85%] md:max-w-[70%] space-y-2 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                                        <div className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${msg.role === 'user' ? 'text-zinc-600' : 'text-indigo-500'
                                            }`}>
                                            {msg.role === 'user' ? 'Request' : 'Mentor Response'}
                                        </div>
                                        <div className={`p-6 rounded-[24px] text-sm leading-relaxed whitespace-pre-wrap transition-all shadow-sm ${msg.role === 'user'
                                                ? 'bg-zinc-900 border border-white/5 text-zinc-300'
                                                : 'bg-zinc-900 border border-indigo-500/10 text-zinc-200'
                                            }`}>
                                            {msg.content}
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}

                        {loading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-start gap-5"
                            >
                                <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                    <BrainCircuit size={20} className="animate-pulse" />
                                </div>
                                <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-[24px] flex items-center gap-4">
                                    <Waveform />
                                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">Processing Inquiry...</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} className="h-20" />
                </div>
            </div>

            {/* 3. Input + Controls Zone (Fixed at Bottom) */}
            <div className="shrink-0 p-8 pt-0 z-30">
                <div className="max-w-4xl mx-auto relative group">
                    <div className="absolute -inset-4 bg-indigo-500/5 blur-2xl rounded-full opacity-0 group-focus-within:opacity-100 transition-opacity" />
                    <div className="relative bg-zinc-900/50 backdrop-blur-3xl border border-white/5 rounded-[32px] p-2 flex items-center gap-3 group-focus-within:border-indigo-500/30 transition-all p-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent group-focus-within:from-indigo-500/20 group-focus-within:to-indigo-500/20">
                        <div className="flex-1 bg-zinc-950/80 rounded-[31px] flex items-center px-6 gap-3">
                            <Command size={18} className="text-zinc-600" />
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                placeholder="Consult your AI mentor about DSA or Design..."
                                className="w-full h-14 bg-transparent text-sm focus:outline-none placeholder:text-zinc-600 font-medium"
                                disabled={loading}
                            />
                            <div className="flex items-center gap-2">
                                <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-zinc-900 border border-white/5 rounded-md text-[8px] font-black text-zinc-500 uppercase tracking-tighter">
                                    Enter
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05, backgroundColor: loading ? '#27272a' : '#4f46e5' }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => sendMessage()}
                                    disabled={loading || !input.trim()}
                                    className={`p-3 rounded-2xl transition-all duration-300 shadow-lg ${loading || !input.trim()
                                            ? 'bg-zinc-800 text-zinc-600 cursor-not-allowed'
                                            : 'bg-indigo-600 text-white shadow-indigo-500/20'
                                        }`}
                                >
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                                </motion.button>
                            </div>
                        </div>
                    </div>

                    {/* Control Bar */}
                    <div className="mt-4 flex items-center justify-between px-6">
                        <div className="flex gap-4">
                            <div className="flex items-center gap-1.5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-help">
                                <Terminal size={12} className="text-indigo-400" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">DSA_MODE</span>
                            </div>
                            <div className="flex items-center gap-1.5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all cursor-help">
                                <BrainCircuit size={12} className="text-purple-400" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">SYS_DESIGN</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-700">
                            <Info size={12} />
                            <span>Context limit: 4096 tokens</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
