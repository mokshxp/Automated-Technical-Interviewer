import { useState } from 'react';
import { Bot, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HomeAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [hasSpoken, setHasSpoken] = useState(false);

    const speak = (text: string) => {
        if ('speechSynthesis' in window) {
            const msg = new SpeechSynthesisUtterance(text);
            msg.lang = "en-US";
            msg.rate = 1;
            window.speechSynthesis.speak(msg);
        }
    };

    const handleInteraction = () => {
        if (!isOpen) {
            setIsOpen(true);
            if (!hasSpoken) {
                speak("Welcome back. Ready to level up your system design skills? Click start interview when you are ready.");
                setHasSpoken(true);
            }
        } else {
            setIsOpen(false);
            window.speechSynthesis.cancel();
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="bg-white p-4 rounded-2xl shadow-xl max-w-xs mb-2 border border-indigo-100"
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-gray-800 flex items-center gap-2">
                                <Bot size={18} className="text-indigo-600" /> AI Assistant
                            </h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={14} />
                            </button>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Ready to level up your system design skills? I can take your interview anytime.
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={handleInteraction}
                className={`p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center ${isOpen ? 'bg-indigo-600 text-white rotate-0' : 'bg-white text-indigo-600 hover:bg-gray-50 hover:scale-105'
                    }`}
            >
                <Bot size={28} />
            </button>
        </div>
    );
}
