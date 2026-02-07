import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Send, User, Bot, Play, Terminal, Mic, MicOff } from 'lucide-react';
import Editor from '@monaco-editor/react';

interface Message {
    role: 'user' | 'ai';
    content: string;
}

export default function Interview() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);

    // Code Editor State
    const [code, setCode] = useState<string>("# Write your Python code here\nprint('Hello, World!')");
    const [language, setLanguage] = useState('python');
    const [output, setOutput] = useState('');
    const [running, setRunning] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);

    const toggleListening = () => {
        if (isListening) {
            if (recognitionRef.current) recognitionRef.current.stop();
            setIsListening(false);
        } else {
            startListening();
        }
    };

    const startListening = () => {
        if (!('webkitSpeechRecognition' in window)) {
            alert("Web Speech API not supported. Please use Chrome.");
            return;
        }

        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false; // Only final results
        recognition.lang = 'en-US';

        recognition.onstart = () => setIsListening(true);

        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setInput((prev) => prev ? `${prev} ${transcript}` : transcript);
        };

        recognition.onerror = (event: any) => {
            console.error("Speech error", event.error);
            setIsListening(false);
        };

        recognition.onend = () => setIsListening(false);

        recognitionRef.current = recognition;
        recognition.start();
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    useEffect(() => {
        // Initial fetch of session to get history if any
        const fetchSession = async () => {
            try {
                const response = await fetch(`http://localhost:8000/interview/${sessionId}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data.chat_history) {
                        setMessages(data.chat_history);
                    } else {
                        setMessages([{ role: 'ai', content: "Hello! Ready for the coding challenge? You can write and run code on the right panel." }]);
                    }
                }
            } catch (error) {
                console.error("Failed to load session", error);
            }
        };
        if (sessionId) fetchSession();
    }, [sessionId]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setLoading(true);

        try {
            const response = await fetch(`http://localhost:8000/interview/${sessionId}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userMsg }),
            });

            if (!response.ok) throw new Error('Failed to send message');

            const data = await response.json();
            setMessages(prev => [...prev, { role: 'ai', content: data.response }]);
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error. Please try again." }]);
        } finally {
            setLoading(false);
        }
    };

    const runCode = async () => {
        setRunning(true);
        setOutput("Running...");
        try {
            const response = await fetch(`http://localhost:8000/interview/${sessionId}/run_code`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language, code }),
            });

            const data = await response.json();
            if (data.error) {
                setOutput(`Error:\n${data.error}`);
            } else {
                setOutput(data.output || "No output");
            }
        } catch (err: any) {
            setOutput(`Execution Failed: ${err.message}`);
        } finally {
            setRunning(false);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <header className="bg-white shadow p-4 flex justify-between items-center z-10">
                <h1 className="text-xl font-bold text-gray-800">Live Coding Interview</h1>
                <div className="flex gap-2">
                    <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="border border-gray-300 rounded px-2 py-1 text-sm text-gray-700"
                    >
                        <option value="python">Python 3.10</option>
                        <option value="javascript">JavaScript (Node 18)</option>
                    </select>
                    <button
                        onClick={runCode}
                        disabled={running}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-1.5 rounded hover:bg-green-700 disabled:opacity-50 transition-colors text-sm font-medium"
                    >
                        <Play size={16} /> Run Code
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Left Panel: Chat */}
                <div className="w-1/3 flex flex-col border-r border-gray-200 bg-gray-50">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`flex items-start max-w-[90%] px-3 py-2 rounded-lg text-sm shadow-sm ${msg.role === 'user'
                                        ? 'bg-indigo-600 text-white'
                                        : 'bg-white text-gray-800 border border-gray-200'
                                        }`}
                                >
                                    <div className="mr-2 mt-0.5 shrink-0">
                                        {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                    </div>
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="flex justify-start text-xs text-gray-500 px-4">Typing...</div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <div className="bg-white border-t p-3">
                        <form onSubmit={sendMessage} className="flex gap-2">
                            <button
                                type="button"
                                onClick={toggleListening}
                                className={`p-2 rounded-full transition-colors ${isListening
                                        ? 'bg-red-100 text-red-600 animate-pulse'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                title="Speak answer"
                            >
                                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                            </button>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask a question..."
                                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Panel: Code Editor & Output */}
                <div className="w-2/3 flex flex-col bg-[#1e1e1e]">
                    <div className="flex-1">
                        <Editor
                            height="100%"
                            defaultLanguage="python"
                            language={language}
                            value={code}
                            theme="vs-dark"
                            onChange={(value) => setCode(value || "")}
                            options={{
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                fontSize: 14,
                                automaticLayout: true
                            }}
                        />
                    </div>

                    {/* Output Console */}
                    <div className="h-1/3 bg-black border-t border-gray-700 flex flex-col">
                        <div className="bg-gray-800 text-gray-300 px-4 py-1 text-xs font-mono flex items-center gap-2">
                            <Terminal size={12} /> Console Output
                        </div>
                        <pre className="flex-1 overflow-auto p-4 font-mono text-sm text-gray-200 whitespace-pre-wrap">
                            {output}
                        </pre>
                    </div>
                </div>
            </div>
        </div>
    );
}
