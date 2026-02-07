import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Mic, MicOff, Bot, User, Loader, Volume2 } from 'lucide-react';

interface Props {
    sessionId: string;
    roundType: string;
    onComplete: () => void;
}

interface Message {
    role: 'user' | 'ai';
    content: string;
    audioUrl?: string;
}

export default function RoundChat({ sessionId, roundType, onComplete }: Props) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    // Initial Greeting
    useEffect(() => {
        let greeting = "";
        if (roundType === "tech_1") greeting = "Welcome to the Technical Round (DSA). explain your previous code or solve a new generic problem.";
        else if (roundType === "tech_2") greeting = "Welcome to the System Design Round. Tell me about the architecture of your last project.";

        setMessages([{ role: 'ai', content: greeting }]);
    }, [roundType]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const playAudio = (url: string) => {
        const audio = new Audio(url);
        audio.play().catch(e => console.error("Audio play failed", e));
    };

    const sendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const response = await axios.post(`http://localhost:8000/interview/${sessionId}/chat`, {
                message: userMsg
            });
            setMessages(prev => [...prev, { role: 'ai', content: response.data.response }]);

            // Note: Regular chat doesn't return audio URL currently, but we could add it.
            // For now, voice mode uses /speak which returns audio.
        } catch (error) {
            console.error("Chat Error", error);
        } finally {
            setLoading(false);
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data);
            };

            recorder.onstop = sendAudio;

            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];
            recorder.start();
            setIsRecording(true);
        } catch (err) {
            alert("Microphone access denied");
            console.error(err);
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        // Stop all tracks to release mic
        mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
    };

    const sendAudio = async () => {
        if (audioChunksRef.current.length === 0) return;

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');

        setLoading(true);
        try {
            // Optimistic UI
            setMessages(prev => [...prev, { role: 'user', content: "(Voice Message sent...)" }]);

            const response = await axios.post(`http://localhost:8000/interview/${sessionId}/speak`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { text, audio_url } = response.data;

            // Replace placeholder or add new
            setMessages(prev => {
                const newHistory = [...prev];
                // Update last user message
                newHistory[newHistory.length - 1].content = `(Voice) ${text}`; // Or show what AI heard? AI response is 'text' which is the ANSWER. 
                // Wait, response.data.text is the AI RESPONSE text.
                // The prompt said "You are an interviewer... Respond...".
                // So text is AI's answer.
                // We should probably just append the AI answer.

                // Let's remove the "Voice Message sent" placeholder and properly append context if possible, 
                // but for now let's just append AI response.

                // Better approach:
                return [
                    ...prev.slice(0, -1), // Remove placeholder
                    { role: 'user', content: "🎤 (Audio Input Sent)" },
                    { role: 'ai', content: text, audioUrl: audio_url }
                ];
            });

            if (audio_url) playAudio(audio_url);

        } catch (error) {
            console.error("Audio Upload Error", error);
            setMessages(prev => [...prev, { role: 'user', content: "Failed to process audio." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleNextRound = async () => {
        try {
            await axios.post(`http://localhost:8000/interview/${sessionId}/submit_round`, {
                data: { type: roundType, transcript: messages }
            });
            onComplete();
        } catch (error) {
            console.error("Next round failed", error);
        }
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <header className="bg-white shadow p-4 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold capitalize text-indigo-700">
                        {roundType.replace('_', ' ')} Interview
                    </h2>
                    {isRecording && <span className="flex h-3 w-3 rounded-full bg-red-500 animate-pulse" />}
                </div>
                <button
                    onClick={handleNextRound}
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700"
                >
                    Finish Round
                </button>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'
                                }`}>
                                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
                            </div>
                            <div className={`p-4 rounded-xl shadow-sm whitespace-pre-wrap flex flex-col gap-2 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-800 border border-gray-100'
                                }`}>
                                {msg.content}
                                {msg.audioUrl && (
                                    <button
                                        onClick={() => playAudio(msg.audioUrl!)}
                                        className="self-start mt-2 flex items-center gap-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                                    >
                                        <Volume2 size={12} /> Play Audio
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-white p-3 rounded-xl border border-gray-100 flex gap-2 items-center text-gray-400 text-sm">
                            <Loader className="animate-spin" size={14} />
                            {isRecording ? "Listening..." : "Thinking..."}
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="bg-white border-t p-4">
                <form onSubmit={sendMessage} className="flex gap-2 max-w-4xl mx-auto">
                    <button
                        type="button"
                        onMouseDown={startRecording}
                        onMouseUp={stopRecording}
                        onMouseLeave={stopRecording}
                        onTouchStart={startRecording}
                        onTouchEnd={stopRecording}
                        className={`p-3 rounded-full transition-all ${isRecording ? 'bg-red-500 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        title="Hold to speak"
                    >
                        {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Type or hold Mic to speak..."
                        disabled={isRecording}
                        className="flex-1 border border-gray-300 rounded-full px-6 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-50"
                    />
                    <button
                        type="submit"
                        disabled={loading || !input.trim()}
                        className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 disabled:opacity-50 transition"
                    >
                        <Send size={20} />
                    </button>
                </form>
            </div>
        </div>
    );
}
