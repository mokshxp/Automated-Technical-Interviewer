import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

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

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full opacity-20">
                <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-indigo-600 rounded-full blur-[100px]" />
                <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-purple-600 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="z-10 text-center space-y-8"
            >
                <h2 className="text-3xl font-light text-indigo-300">Prepare Yourself</h2>

                <p className="text-xl max-w-md mx-auto leading-relaxed text-gray-300">
                    {message}
                </p>

                <div className="relative w-48 h-48 mx-auto flex items-center justify-center">
                    {/* Ring Animation */}
                    <svg className="absolute w-full h-full transform -rotate-90">
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-gray-800"
                        />
                        <motion.circle
                            cx="96"
                            cy="96"
                            r="88"
                            stroke="currentColor"
                            strokeWidth="8"
                            fill="transparent"
                            className="text-indigo-500"
                            strokeDasharray={2 * Math.PI * 88}
                            strokeDashoffset={2 * Math.PI * 88 * (1 - timeLeft / duration)}
                            strokeLinecap="round"
                        />
                    </svg>

                    <div className="text-5xl font-mono font-bold flex items-center gap-2">
                        {formatTime(timeLeft)}
                    </div>
                </div>

                <p className="text-sm text-gray-500 uppercase tracking-widest animate-pulse">
                    Use this time to breathe and focus
                </p>
            </motion.div>
        </div>
    );
}
