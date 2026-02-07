import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, User as UserIcon, Bot, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function LearningChat() {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: "Hello! I'm your AI Interview Coach. Ask me anything about coding, system design, or interview prep!" }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();
    const { } = useAuth();
    // Assuming context has candidate info or we fetch it. For MVP, we presume user is linked.

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            // We need a candidate ID. For MVP we'll try to find one or pass null.
            // In a real app, AuthContext should ideally provide the candidate ID.
            // Or we fetch it. For now, let's assume specific logic or pass 1 if debugging.
            // Better: Let backend find candidate by User ID (not implemented in AuthContext yet).
            // Workaround: We'll send just the message, backend handles missing candidate_id gracefully.

            const response = await axios.post(`http://localhost:8000/learning/chat`, {
                message: userMsg,
                // candidate_id: user?.candidate_id // If we had it
            });

            setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
        } catch (error) {
            console.error("Chat failed", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow p-4 flex items-center gap-4">
                <button onClick={() => navigate('/dashboard')} className="text-gray-600 hover:text-gray-900">
                    <ArrowLeft />
                </button>
                <h1 className="text-xl font-bold text-indigo-700 flex items-center gap-2">
                    <Bot className="text-indigo-600" /> AI Learning Assistant
                </h1>
            </header>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-xl shadow-sm flex gap-3 ${msg.role === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-none'
                            : 'bg-white text-gray-800 rounded-bl-none'
                            }`}>
                            <div className="mt-1 shrink-0">
                                {msg.role === 'user' ? <UserIcon size={20} /> : <Bot size={20} />}
                            </div>
                            <div className="whitespace-pre-wrap">{msg.content}</div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white p-4 rounded-xl shadow-sm rounded-bl-none flex gap-3 items-center text-gray-500">
                            <Bot size={20} />
                            <span className="animate-pulse">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-200">
                <div className="max-w-4xl mx-auto flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder="Ask about algorithms, system design, or interview tips..."
                        className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        disabled={loading}
                    />
                    <button
                        onClick={sendMessage}
                        disabled={loading || !input.trim()}
                        className="bg-indigo-600 text-white p-3 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
