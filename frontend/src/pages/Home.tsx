import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Mic, Code, Zap, CheckCircle2, Play, Github, Linkedin, Mail } from 'lucide-react';
import HomeAssistant from '../components/HomeAssistant';
import { useAuth } from '../context/AuthContext';

export default function Home() {
    const { isAuthenticated } = useAuth();
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

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium uppercase tracking-wider backdrop-blur-md"
                >
                    <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse box-shadow-indigo-500/50" />
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

                {/* Animated Background Gradients */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-[100%] h-[100%] max-w-[1400px] pointer-events-none overflow-hidden">
                    <div className="absolute top-[10%] left-[20%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow" />
                    <div className="absolute top-[20%] right-[20%] w-[400px] h-[400px] bg-purple-600/20 rounded-full blur-[100px] mix-blend-screen animate-pulse-slow delay-1000" />
                </div>

                {/* Grid Pattern Overlay */}
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
                        {[
                            {
                                icon: <Code size={24} />,
                                title: "Adaptive Coding",
                                desc: "LeetCode-style challenges that scale in difficulty as you solve them. Supports Python, JS, TS.",
                                color: "text-blue-400",
                                bg: "bg-blue-500/10",
                                border: "group-hover:border-blue-500/50"
                            },
                            {
                                icon: <Mic size={24} />,
                                title: "Voice System Design",
                                desc: "Speak naturally. The AI acts as a senior architect, evaluating your scalability and trade-off decisions.",
                                color: "text-purple-400",
                                bg: "bg-purple-500/10",
                                border: "group-hover:border-purple-500/50"
                            },
                            {
                                icon: <CheckCircle2 size={24} />,
                                title: "Instant Feedback",
                                desc: "Get detailed scorecards, behavioral analysis, and actionable advice immediately after you finish.",
                                color: "text-green-400",
                                bg: "bg-green-500/10",
                                border: "group-hover:border-green-500/50"
                            }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1, duration: 0.5 }}
                                viewport={{ once: true }}
                                className={`group p-8 rounded-3xl bg-zinc-950/50 border border-white/5 hover:bg-zinc-900 transition-all hover:-translate-y-2 duration-300 ${feature.border}`}
                            >
                                <div className={`w-14 h-14 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-6 ring-1 ring-inset ring-white/5`}>
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-white group-hover:text-white transition-colors">
                                    {feature.title}
                                </h3>
                                <p className="text-zinc-400 leading-relaxed text-sm">
                                    {feature.desc}
                                </p>
                            </motion.div>
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
