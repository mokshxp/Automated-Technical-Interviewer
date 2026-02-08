import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Timer from '../common/Timer';
import { ChevronRight } from 'lucide-react';

interface PrepTimerProps {
    duration: number; // in seconds
    message: string;
    onComplete: () => void;
}

export default function PrepTimer({ duration, message, onComplete }: PrepTimerProps) {
    const [timeLeft, setTimeLeft] = useState(duration);

    useEffect(() => {
        if (timeLeft <= 0) {
            onComplete();
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft, onComplete]);

    return (
        <div className="min-h-full w-full flex items-center justify-center bg-zinc-950 text-white selection:bg-zinc-800">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="w-full max-w-[420px] bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-8 shadow-2xl backdrop-blur-sm"
            >
                <div className="flex flex-col items-center text-center space-y-6">

                    {/* Status Header */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-semibold cursor-default">System Status: Ready</span>
                        </div>
                        <h2 className="text-xl font-semibold tracking-tight text-zinc-100">
                            Session Initializing
                        </h2>
                        <p className="text-sm text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
                            {message}
                        </p>
                    </div>

                    {/* Timer Section */}
                    <div className="py-4 border-y border-zinc-800/50 w-full flex justify-center bg-zinc-900/30">
                        <Timer
                            duration={duration}
                            remaining={timeLeft}
                            size="md"
                            label="Auto-Start In"
                        />
                    </div>

                    {/* Primary Action */}
                    <button
                        onClick={onComplete}
                        className="group w-full bg-zinc-100 hover:bg-white text-zinc-900 font-medium py-3 rounded-lg transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/20"
                    >
                        Start Interview Now
                        <ChevronRight size={16} className="text-zinc-600 group-hover:translate-x-0.5 transition-transform" />
                    </button>

                    {/* Footer Info */}
                    <div className="text-[10px] text-zinc-600 font-mono">
                        ID: {Math.random().toString(36).substr(2, 9).toUpperCase()} // SECURE_MODE_ACTIVE
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
