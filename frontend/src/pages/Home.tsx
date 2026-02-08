import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, Mic, Code, Zap, CheckCircle2,
    Play, Github, Linkedin, Mail
} from 'lucide-react';
import HomeAssistant from '../components/HomeAssistant';
import { useAuth } from '../context/AuthContext';

const PREMIUM_EASE = [0.16, 1, 0.3, 1] as any;

// --- Demo Sub-components ---

const CodingDemo = () => {
    const code = `function twoSum(nums, target) {
  const map = new Map()
  for (let i = 0; i < nums.length; i++) {
    const diff = target - nums[i]
    if (map.has(diff)) return [map.get(diff), i]
    map.set(nums[i], i)
  }
}`;
    const [displayedCode, setDisplayedCode] = useState("");

    useEffect(() => {
        let current = "";
        let i = 0;
        const interval = setInterval(() => {
            if (i < code.length) {
                current += code[i];
                setDisplayedCode(current);
                i++;
            } else {
                clearInterval(interval);
            }
        }, 30);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full h-full bg-zinc-950/90 rounded-2xl p-4 font-mono text-[10px] leading-relaxed overflow-hidden border border-white/10">
            <div className="flex items-center gap-1.5 mb-3 opacity-30">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
                <span className="ml-2 text-[8px] uppercase tracking-widest text-white">editor.js</span>
            </div>
            <div className="text-zinc-400 whitespace-pre">
                {displayedCode}
                <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-1.5 h-3 bg-indigo-500 ml-0.5 align-middle"
                />
            </div>
        </div>
    );
};

const VoiceDemo = () => (
    <div className="w-full h-full bg-zinc-950/90 rounded-2xl flex flex-col items-center justify-center p-6 border border-white/10 overflow-hidden relative">
        <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full" />
        <div className="relative z-10 flex flex-col items-center gap-6 w-full">
            <div className="flex items-center gap-1.5 h-8">
                {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                    <motion.div
                        key={i}
                        animate={{
                            height: [8, i % 2 === 0 ? 32 : 16, 8],
                            opacity: [0.3, 1, 0.3]
                        }}
                        transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            delay: i * 0.1,
                            ease: "easeInOut"
                        }}
                        className="w-1 bg-purple-400 rounded-full"
                    />
                ))}
            </div>
            <div className="flex flex-col items-center gap-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-400">Arch_Analysis</p>
                <p className="text-[8px] font-medium text-zinc-500 uppercase tracking-widest">Scalability Trade-offs</p>
            </div>
        </div>
    </div>
);

const FeedbackDemo = () => {
    const metrics = [
        { label: 'Accuracy', val: 92, color: 'bg-emerald-500' },
        { label: 'Optimization', val: 78, color: 'bg-indigo-500' },
        { label: 'Clarity', val: 85, color: 'bg-amber-500' }
    ];

    return (
        <div className="w-full h-full bg-zinc-950/90 rounded-2xl p-6 border border-white/10 flex flex-col justify-center space-y-4">
            <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500">Evaluation Score</span>
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-lg font-bold text-white"
                >
                    88%
                </motion.span>
            </div>
            <div className="space-y-3">
                {metrics.map((m, idx) => (
                    <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-zinc-500">
                            <span>{m.label}</span>
                            <span>{m.val}%</span>
                        </div>
                        <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${m.val}%` }}
                                transition={{ duration: 1, delay: idx * 0.1, ease: PREMIUM_EASE }}
                                className={`h-full ${m.color}`}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

interface FeatureCardProps {
    idx: number;
    icon: any;
    title: string;
    desc: string;
    color: string;
    bg: string;
    border: string;
}

const FeatureCard = ({ feature }: { feature: FeatureCardProps }) => {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: feature.idx * 0.1, duration: 0.5 }}
            viewport={{ once: true }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`group relative p-8 rounded-3xl bg-zinc-950/50 border border-white/5 hover:bg-zinc-900 transition-all duration-300 ${feature.border} overflow-hidden`}
            style={{
                transform: isHovered ? 'translateY(-12px) scale(1.05)' : 'translateY(0) scale(1)',
                zIndex: isHovered ? 10 : 1
            }}
        >
            {/* Base Content */}
            <div className={`transition-opacity duration-300 ${isHovered ? 'opacity-20' : 'opacity-100'}`}>
                <div className={`w-14 h-14 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-6 ring-1 ring-inset ring-white/5`}>
                    {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">
                    {feature.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed text-sm">
                    {feature.desc}
                </p>
            </div>

            {/* Demo Overlay */}
            <AnimatePresence>
                {isHovered && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{ duration: 0.2, ease: PREMIUM_EASE }}
                        className="absolute inset-4 z-20 flex items-center justify-center pointer-events-none"
                    >
                        {feature.title === "Adaptive Coding" && <CodingDemo />}
                        {feature.title === "Voice System Design" && <VoiceDemo />}
                        {feature.title === "Instant Feedback" && <FeedbackDemo />}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hover Glow */}
            <div className={`absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
        </motion.div>
    );
};

export default function Home() {
    const { isAuthenticated } = useAuth();

    const features: FeatureCardProps[] = [
        {
            idx: 0,
            icon: <Code size={24} />,
            title: "Adaptive Coding",
            desc: "LeetCode-style challenges that scale in difficulty as you solve them. Supports Python, JS, TS.",
            color: "text-blue-400",
            bg: "bg-blue-500/10",
            border: "group-hover:border-blue-500/50"
        },
        {
            idx: 1,
            icon: <Mic size={24} />,
            title: "Voice System Design",
            desc: "Speak naturally. The AI acts as a senior architect, evaluating your scalability and trade-off decisions.",
            color: "text-purple-400",
            bg: "bg-purple-500/10",
            border: "group-hover:border-purple-500/50"
        },
        {
            idx: 2,
            icon: <CheckCircle2 size={24} />,
            title: "Instant Feedback",
            desc: "Get detailed scorecards, behavioral analysis, and actionable advice immediately after you finish.",
            color: "text-green-400",
            bg: "bg-green-500/10",
            border: "group-hover:border-green-500/50"
        }
    ];

    return (
        <div className="min-h-screen bg-zinc-950 text-white selection:bg-indigo-500/30 overflow-x-hidden font-sans">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20">
                            <Zap size={18} className="text-white" fill="currentColor" />
                        </div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            InterviewAI
                        </span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link to="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
                            Sign In
                        </Link>
                        <Link to="/signup" className="hidden sm:block text-sm font-medium bg-white text-zinc-950 px-5 py-2.5 rounded-full hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium uppercase tracking-wider backdrop-blur-md"
                >
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                    v2.0 Now Live
                </motion.div>

                <div className="max-w-4xl mx-auto text-center space-y-8 z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.1] text-white"
                    >
                        Review like it <br />
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x">
                            actually matters.
                        </span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed"
                    >
                        Built for serious engineers. AI-driven technical interviews that adapt to your level.
                        Real-time feedback, voice mode, and coding challenges.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.3 }}
                        className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8"
                    >
                        <Link
                            to={isAuthenticated ? "/register" : "/login"}
                            className="group relative px-8 py-4 bg-indigo-600 text-white font-semibold rounded-full overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)] active:scale-95"
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                {isAuthenticated ? "Start Interview" : "Get Started"} <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        </Link>

                        <button className="flex items-center gap-2 px-8 py-4 bg-zinc-900 text-white font-medium rounded-full border border-zinc-800 hover:bg-zinc-800 transition-all hover:scale-105 active:scale-95 hover:border-zinc-700">
                            <Play size={18} fill="currentColor" /> View Demo
                        </button>
                    </motion.div>
                </div>

                <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[100%] h-[100%] max-w-[1400px] pointer-events-none overflow-hidden">
                    <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
                    <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] mix-blend-screen animate-pulse-slow delay-1000" />
                </div>

                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />
            </section>

            {/* Features Section */}
            <section className="py-32 px-6 border-t border-white/5 bg-zinc-900/30 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40 pb-2">
                            Engineering Grade Prep
                        </h2>
                        <p className="text-zinc-400 max-w-2xl mx-auto">
                            Stop memorizing. Start solving. Our AI mimics real-world interview conditions.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {features.map((feature, idx) => (
                            <FeatureCard key={idx} feature={feature} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Dashboard Motivational Text */}
            <section className="py-40 px-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-900/5 to-transparent pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="space-y-8 relative z-10"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono uppercase tracking-[0.2em]">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        System Status: Ready
                    </div>

                    <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white tracking-tighter">
                        Built for the next step.
                    </h2>

                    <p className="text-zinc-500 font-medium text-lg md:text-xl max-w-xl mx-auto">
                        This is not just practice. <br className="hidden md:block" />
                        <span className="text-indigo-400">This is distinct signal.</span>
                    </p>
                </motion.div>
            </section>

            {/* Footer */}
            <footer className="border-t border-white/5 py-12 px-6 bg-zinc-950">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                            <Zap size={14} className="text-white" fill="currentColor" />
                        </div>
                        <span className="text-zinc-400 font-semibold text-sm">Automated Interviewer</span>
                    </div>

                    <div className="text-zinc-600 text-sm">
                        © 2024. All rights reserved.
                    </div>

                    <div className="flex gap-6">
                        <a href="https://github.com/mokshxp" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                            <Github size={20} />
                        </a>
                        <a href="https://www.linkedin.com/in/moksh-gupta-8b7588279/" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-indigo-400 transition-colors">
                            <Linkedin size={20} />
                        </a>
                        <a href="mailto:gmoksh985@gmail.com" className="text-zinc-500 hover:text-red-400 transition-colors">
                            <Mail size={20} />
                        </a>
                    </div>
                </div>
            </footer>

            <HomeAssistant />
        </div>
    );
}
