import { useState, useEffect, useRef } from 'react';
import { Mic, Volume2, Square } from 'lucide-react';
import { useProctoring } from '../../hooks/useProctoring';

interface SystemDesignVoiceModeProps {
    onComplete: () => void;
}

export default function SystemDesignVoiceMode({ onComplete }: SystemDesignVoiceModeProps) {
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [transcript, setTranscript] = useState<{ role: 'ai' | 'user'; text: string }[]>([]);
    const [interviewStep, setInterviewStep] = useState(0);

    const recognitionRef = useRef<any>(null);

    const { warning } = useProctoring({
        onTerminate: () => {
            console.log("Interview Terminated due to violations.");
            onComplete();
        },
        enable: true
    });

    // Initial Question & Cleanup
    useEffect(() => {
        if (interviewStep === 0) {
            const initialQ = "Design a URL shortening service like TinyURL.";
            setTranscript([{ role: 'ai', text: initialQ }]);
            speak(initialQ);
            setInterviewStep(1);
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
                recognitionRef.current.abort(); // Force stop
            }
            if ('speechSynthesis' in window) {
                window.speechSynthesis.cancel(); // Stop speaking
            }
        };
    }, [interviewStep]);

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            setIsSpeaking(true);
            const msg = new SpeechSynthesisUtterance(text);
            msg.lang = "en-US";
            msg.rate = 1;
            msg.onend = () => {
                setIsSpeaking(false);
                // Auto-listen after speaking? Maybe better to let user click to speak to avoid loops
            };
            window.speechSynthesis.speak(msg);
        }
    };

    const listen = () => {
        if (!('webkitSpeechRecognition' in window)) {
            console.error("Browser does not support Speech Recognition");
            return;
        }

        const SpeechRecognition = (window as any).webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);

        recognition.onresult = (e: any) => {
            const answer = e.results[0][0].transcript;
            handleAnswer(answer);
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    const handleAnswer = (answer: string) => {
        setTranscript(prev => [...prev, { role: 'user', text: answer }]);

        // Simple Keyword Logic
        const lowerAns = answer.toLowerCase();
        let followUp = "Can you go deeper into your design decision?";

        if (lowerAns.includes("load balancer")) {
            followUp = "Which load balancing strategy would you use and why?";
        } else if (lowerAns.includes("cache") || lowerAns.includes("redis")) {
            followUp = "Which cache eviction policy would you choose?";
        } else if (lowerAns.includes("database") || lowerAns.includes("sql") || lowerAns.includes("nosql")) {
            followUp = "Would you choose SQL or NoSQL? Explain trade-offs.";
        } else if (lowerAns.includes("scale") || lowerAns.includes("sharding")) {
            followUp = "How would you scale this system to millions of users?";
        } else if (lowerAns.includes("consistent hashing")) {
            followUp = "Explain how consistent hashing helps in this scenario.";
        }

        setTimeout(() => {
            setTranscript(prev => [...prev, { role: 'ai', text: followUp }]);
            speak(followUp);
        }, 500);
    };

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-900 text-white p-6 justify-between overflow-hidden">
            {warning && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl z-[60] flex items-center gap-3 animate-bounce">
                    <span className="text-2xl">⚠️</span>
                    <span className="font-bold">{warning}</span>
                </div>
            )}
            {/* Ambient Background */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
                <div className={`absolute top-1/4 left-1/4 w-64 h-64 bg-indigo-600 rounded-full blur-[80px] transition-all duration-1000 ${isSpeaking ? 'scale-125 opacity-50' : 'scale-100 opacity-20'}`} />
                <div className={`absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-600 rounded-full blur-[80px] transition-all duration-1000 ${isListening ? 'scale-125 opacity-50' : 'scale-100 opacity-20'}`} />
            </div>

            <div className="z-10 flex-1 overflow-y-auto space-y-4 pr-2">
                {transcript.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-xl ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-200'}`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isSpeaking && (
                    <div className="flex justify-start">
                        <div className="bg-gray-800 p-3 rounded-xl text-gray-400 text-sm flex items-center gap-2">
                            <Volume2 size={16} className="animate-pulse" /> AI Speaking...
                        </div>
                    </div>
                )}
            </div>

            <div className="z-10 mt-6 flex justify-center items-center gap-6">
                <button
                    onClick={isListening ? stopListening : listen}
                    className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border-4 ${isListening ? 'bg-red-500 border-red-400 animate-pulse' : 'bg-indigo-600 border-indigo-400 hover:scale-105'}`}
                >
                    {isListening ? <Square size={32} fill="currentColor" /> : <Mic size={32} />}
                </button>
            </div>

            <div className="text-center mt-4 text-gray-400 text-sm">
                {isListening ? "Listening..." : "Tap Mic to Answer"}
            </div>

            <button
                onClick={onComplete}
                className="absolute top-4 right-4 text-xs bg-gray-800 hover:bg-gray-700 px-3 py-1 rounded border border-gray-700"
            >
                End Interview
            </button>
        </div>
    );
}
