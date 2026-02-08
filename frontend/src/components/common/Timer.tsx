import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface TimerProps {
    duration: number; // in seconds
    remaining: number; // in seconds
    size?: 'sm' | 'md' | 'lg';
    label?: string;
    showTrack?: boolean;
}

export default function Timer({
    duration,
    remaining,
    size = 'md',
    label,
    showTrack = true
}: TimerProps) {

    // Configurations based on size
    const config = useMemo(() => {
        switch (size) {
            case 'sm': return { size: 40, stroke: 3, fontSize: 'text-xs', labelSize: 'text-[10px]' };
            case 'lg': return { size: 160, stroke: 6, fontSize: 'text-4xl', labelSize: 'text-sm' };
            case 'md': default: return { size: 80, stroke: 4, fontSize: 'text-xl', labelSize: 'text-xs' };
        }
    }, [size]);

    const { size: dim, stroke, fontSize, labelSize } = config;
    const radius = (dim - stroke) / 2;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.max(0, Math.min(1, remaining / duration));
    const offset = circumference - progress * circumference;

    // Strict Color Logic
    const getColor = () => {
        const percentage = (remaining / duration) * 100;
        if (percentage <= 5) return "#ef4444"; // red-500 (Critical)
        if (percentage <= 20) return "#f59e0b"; // amber-500 (Warning)
        return "#6366f1"; // indigo-500 (Normal)
    };

    const strokeColor = getColor();

    // Formatting MM:SS
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    const formattedTime = `${mins}:${secs < 10 ? '0' : ''}${secs}`;

    return (
        <div className="flex flex-col items-center justify-center gap-2">
            <div className="relative flex items-center justify-center" style={{ width: dim, height: dim }}>
                {/* Static Background Track */}
                {showTrack && (
                    <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                        <circle
                            cx={dim / 2}
                            cy={dim / 2}
                            r={radius}
                            stroke="#1e1e2e" // Dark track color (zinc-900/slate-900 equivalent)
                            strokeWidth={stroke}
                            fill="transparent"
                        />
                    </svg>
                )}

                {/* Progress Ring - No Animation Ease for precision feeling */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                    <motion.circle
                        cx={dim / 2}
                        cy={dim / 2}
                        r={radius}
                        stroke={strokeColor}
                        strokeWidth={stroke}
                        fill="transparent"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        animate={{ strokeDashoffset: offset }}
                        transition={{ duration: 0.5, ease: "linear" }} // Smooth linear update, no bounce
                    />
                </svg>

                {/* Digital Readout */}
                <div className={`absolute inset-0 flex items-center justify-center font-mono font-bold text-white ${fontSize}`}>
                    {formattedTime}
                </div>
            </div>

            {/* Optional Label */}
            {label && (
                <span className={`uppercase tracking-widest font-semibold text-gray-500 ${labelSize}`}>
                    {label}
                </span>
            )}
        </div>
    );
}
