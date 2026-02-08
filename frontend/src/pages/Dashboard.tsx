import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FileText, LogOut, Plus, Bot, Clock, BarChart3,
    ChevronRight, ArrowRight, Zap, Github, Linkedin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Constants ---
const PREMIUM_EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

// --- Components ---

interface CardProps {
    title: string;
    desc: string;
    icon: React.ReactNode;
    onClick: () => void;
    featured?: boolean;
    accentColor?: string;
    cta: string;
}

const DashboardCard = ({ title, desc, icon, onClick, featured, accentColor = "indigo", cta }: CardProps) => {
    const containerVariants = {
        initial: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: PREMIUM_EASE }
        },
        hover: {
            y: -14,
            scale: 1.045,
            transition: {
                type: "tween",
                duration: 0.16,
                ease: PREMIUM_EASE
            }
        },
        exit: {
            y: 0,
            scale: 1,
            transition: {
                type: "tween",
                duration: 0.22,
                ease: [0.4, 0, 0.2, 1] as any
            }
        }
    };

    const glowVariants = {
        initial: { opacity: 0 },
        hover: {
            opacity: [0, 1, 0.6],
            transition: {
                duration: 0.3,
                times: [0, 0.5, 1],
                ease: "easeOut"
            }
        }
    };

    const lightSweepVariants = {
        initial: { x: '-150%', opacity: 0 },
        hover: {
            x: '150%',
            opacity: [0, 1, 0],
            transition: { duration: 0.4, ease: "easeInOut" }
        }
    };

    const iconVariants = {
        initial: { scale: 1, rotate: 0 },
        hover: {
            scale: 1.15,
            rotate: 6,
            transition: { duration: 0.09, ease: PREMIUM_EASE }
        }
    };

    const textVariants = {
        initial: { y: 0, opacity: 0.8 },
        hover: {
            y: -4,
            opacity: 1,
            transition: { duration: 0.12, ease: PREMIUM_EASE }
        }
    };

    const arrowVariants = {
        initial: { x: 0, opacity: 0.6 },
        hover: {
            x: 8,
            opacity: 1,
            transition: { duration: 0.12, ease: PREMIUM_EASE }
        }
    };

    const accentClasses: Record<string, string> = {
        indigo: "from-indigo-600 to-purple-700 shadow-indigo-500/30 text-indigo-400 bg-indigo-500/10 hover:border-indigo-500/50",
        green: "from-emerald-600 to-teal-700 shadow-emerald-500/30 text-green-400 bg-green-500/10 hover:border-green-500/50",
        purple: "from-purple-600 to-fuchsia-700 shadow-purple-500/30 text-purple-400 bg-purple-500/10 hover:border-purple-500/50"
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="initial"
            animate="visible"
            whileHover="hover"
            onClick={onClick}
            className={`group relative rounded-[32px] cursor-pointer overflow-hidden transition-all duration-300 ${featured
                ? `bg-gradient-to-br ${accentClasses[accentColor]} p-[1px]`
                : "bg-zinc-950/50 border border-white/5 hover:bg-zinc-900"
                }`}
        >
            <motion.div
                variants={lightSweepVariants}
                className="absolute inset-0 z-0 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none"
            />

            <motion.div
                variants={glowVariants}
                className="absolute inset-0 z-0 bg-white/5 pointer-events-none"
            />

            <div className={`h-full rounded-[31px] p-8 flex flex-col justify-between relative z-10 ${featured ? "bg-zinc-900/90 backdrop-blur-xl" : "backdrop-blur-sm"
                }`}>
                <div>
                    <motion.div
                        variants={iconVariants}
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-inset ring-white/10 ${accentClasses[accentColor].split(' ').slice(2, 4).join(' ')} shadow-xl group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-shadow duration-300`}
                    >
                        {icon}
                    </motion.div>

                    <motion.h3
                        variants={textVariants}
                        className="text-2xl font-bold mb-2 text-white tracking-tight group-hover:tracking-normal transition-[letter-spacing] duration-300"
                    >
                        {title}
                    </motion.h3>

                    <motion.p
                        variants={textVariants}
                        className="text-zinc-400 text-sm leading-relaxed mb-4 group-hover:text-zinc-200 transition-colors"
                    >
                        {desc}
                    </motion.p>
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.15em] text-zinc-500 group-hover:text-white transition-all">
                        <span>{cta}</span>
                        <motion.span variants={arrowVariants}>
                            <ChevronRight size={18} />
                        </motion.span>
                    </div>

                    {featured && (
                        <motion.div
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="w-2.5 h-2.5 rounded-full bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,1)]"
                        />
                    )}
                </div>
            </div>
        </motion.div>
    );
};

const SystemIntelligenceLog = () => {
    const logs = [
        "LLM_CORE :: INITIALIZING_NEURAL_VECTORS",
        "SYNC_PROTOCOL :: PERFORMANCE_METRICS_UPDATE",
        "AI_ENGINE :: CALIBRATING_RESPONSE_LATENCY",
        "MODERATION_GUARD :: ANALYZING_SESSION_INTEGRITY",
        "USER_PROFILE :: AGGREGATING_COMPETENCY_MATRIX",
        "SYSTEM :: OPTIMIZING_SANDBOX_STABILITY",
        "NETWORK :: ESTABLISHING_SECURE_TUNNEL",
        "ENCRYPTION :: REFRESHING_SESSION_KEYS"
    ];

    const [visibleLogs, setVisibleLogs] = useState<string[]>([logs[0]]);

    useEffect(() => {
        let logIndex = 1;
        const interval = setInterval(() => {
            setVisibleLogs(current => {
                const nextLog = logs[logIndex];
                logIndex = (logIndex + 1) % logs.length;
                const updated = [nextLog, ...current];
                return updated.slice(0, 4);
            });
        }, 6000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full max-w-sm ml-auto md:ml-0 md:mr-auto mt-20 opacity-30 select-none">
            <div className="space-y-3 font-mono text-[10px] tracking-widest text-zinc-500">
                <AnimatePresence initial={false} mode="popLayout">
                    {visibleLogs.map((log, i) => (
                        <motion.div
                            key={log + i}
                            initial={{ opacity: 0, x: -10, y: 10 }}
                            animate={{ opacity: 1 - i * 0.25, x: 0, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 1, ease: 'easeOut' }}
                            className="flex items-center gap-3"
                        >
                            <span className="text-indigo-400 font-bold">{i === 0 ? ">>>" : "---"}</span>
                            <span>{log}</span>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            <div className="mt-8 flex items-center gap-4 text-white/10 overflow-hidden">
                <div className="h-px flex-1 bg-white/5" />
                <div className="text-[8px] font-black uppercase tracking-[0.3em]">AI_CORE_READY</div>
                <div className="h-px flex-1 bg-white/5" />
            </div>
        </div>
    );
};

// --- Page ---

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.1
            }
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white relative overflow-hidden font-sans selection:bg-indigo-500/30">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full h-full max-w-[1400px] pointer-events-none overflow-hidden">
                <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] mix-blend-screen animate-pulse-slow" />
                <div className="absolute top-[20%] right-[20%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen animate-pulse-slow delay-1000" />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none -z-10" />

            {/* Navbar */}
            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: PREMIUM_EASE }}
                className="relative z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl"
            >
                <div className="max-w-7xl mx-auto px-6 h-16 flex justify-between items-center">
                    <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
                        <motion.div
                            whileHover={{ rotate: 180, scale: 1.1 }}
                            transition={{ duration: 0.5, ease: PREMIUM_EASE }}
                            className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/20"
                        >
                            <Zap size={18} className="text-white" fill="currentColor" />
                        </motion.div>
                        <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            InterviewAI
                        </span>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => navigate('/pricing')}
                            className="hidden sm:flex items-center gap-2 px-4 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 hover:bg-indigo-500/20 transition-all shadow-[0_0_15px_rgba(99,102,241,0.1)] hover:shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                        >
                            <Zap size={12} fill="currentColor" />
                            Upgrade
                        </button>
                        <div className="hidden md:block text-sm text-zinc-400">
                            Welcome, <span className="text-white font-medium">{user?.full_name}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-red-400 transition-colors group"
                        >
                            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </motion.nav>

            <main className="relative z-10 max-w-7xl mx-auto py-20 px-6">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="space-y-16"
                >
                    {/* Header */}
                    <div className="text-center md:text-left space-y-8">
                        <div className="space-y-2">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 0.5, y: 0 }}
                                transition={{ duration: 0.6, ease: PREMIUM_EASE }}
                                className="text-[10px] font-black uppercase tracking-[0.4em] text-white/70 flex items-center gap-2 justify-center md:justify-start"
                            >
                                <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                SYSTEM_STATUS // ACTIVE
                            </motion.div>

                            <motion.h2
                                initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
                                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                                transition={{ duration: 0.8, delay: 0.1, ease: PREMIUM_EASE }}
                                className="text-5xl md:text-6xl font-bold tracking-tight text-white/90 leading-tight"
                            >
                                Let's Begin
                            </motion.h2>

                            <motion.div
                                initial={{ scaleX: 0 }}
                                animate={{ scaleX: 1 }}
                                transition={{ duration: 1, delay: 0.3, ease: PREMIUM_EASE }}
                                style={{ originX: 0 }}
                                className="h-px w-24 bg-gradient-to-r from-indigo-500 to-transparent relative"
                            >
                                <motion.div
                                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute inset-0 bg-indigo-400 blur-sm"
                                />
                            </motion.div>
                        </div>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2, ease: PREMIUM_EASE }}
                            className="text-lg text-zinc-500 max-w-2xl font-medium leading-relaxed"
                        >
                            Unlock your engineering potential with focused, <br className="hidden md:block" />
                            <span className="text-indigo-400/80 font-semibold decoration-indigo-500/20 decoration-1 underline-offset-8 underline">AI-driven technical simulations.</span>
                        </motion.p>
                    </div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <DashboardCard
                            title="New Interview"
                            desc="Start a high-fidelity mock interview tailored to your specific stack and seniority."
                            icon={<Plus size={28} />}
                            cta="Initiate Round"
                            featured
                            onClick={() => navigate('/register')}
                        />
                        <DashboardCard
                            title="Resumes"
                            desc="Manage multiple profiles and review AI-parsed skill metrics."
                            icon={<FileText size={28} />}
                            cta="Analyze Assets"
                            accentColor="green"
                            onClick={() => navigate('/resumes')}
                        />
                        <DashboardCard
                            title="AI Tutor"
                            desc="Interactive whiteboard sessions and conceptual drills with your mentor."
                            icon={<Bot size={28} />}
                            cta="Launch Mentor"
                            accentColor="purple"
                            onClick={() => navigate('/learning')}
                        />
                    </div>

                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: PREMIUM_EASE }}
                        className="pt-16 space-y-10"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black flex items-center gap-3 text-white tracking-tight">
                                <Clock size={20} className="text-indigo-500" />
                                Recent Performance
                            </h3>
                            <button className="text-[10px] font-black text-zinc-500 hover:text-white uppercase tracking-[0.3em] transition-all flex items-center gap-2 group">
                                Analytics history <ArrowRight size={14} className="group-hover:translate-x-1.5 transition-transform" />
                            </button>
                        </div>

                        <div className="relative group overflow-hidden rounded-[40px]">
                            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 rounded-[40px] blur-2xl opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-500" />
                            <div className="relative bg-zinc-950 border border-white/5 rounded-[40px] p-24 text-center backdrop-blur-3xl overflow-hidden">
                                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03)_0%,transparent_70%)]" />

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="relative z-10 flex flex-col items-center gap-8"
                                >
                                    <div className="w-24 h-24 bg-zinc-900 shadow-inner rounded-3xl flex items-center justify-center text-zinc-800 group-hover:text-indigo-500 group-hover:scale-115 group-hover:rotate-6 transition-all duration-700 ease-out">
                                        <BarChart3 size={40} />
                                    </div>
                                    <div className="space-y-3">
                                        <h4 className="text-zinc-200 text-2xl font-black tracking-tighter">System is idle</h4>
                                        <p className="text-zinc-500 text-base max-w-md mx-auto leading-relaxed font-medium">
                                            No sessions found. Complete your first technical round to generate a comprehensive performance index.
                                        </p>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05, y: -2 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => navigate('/register')}
                                        className="mt-4 px-10 py-4 bg-white text-zinc-950 rounded-full text-base font-black hover:bg-zinc-200 transition-all shadow-2xl shadow-indigo-500/10"
                                    >
                                        Start Your Journey
                                    </motion.button>
                                </motion.div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Skill Index Section */}
                    <div className="space-y-10 pb-10">
                        <h3 className="text-2xl font-black flex items-center gap-3 text-white tracking-tight">
                            <Zap size={20} className="text-indigo-500" />
                            Skill Index
                        </h3>

                        <div className="bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/5 rounded-[40px] p-12 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
                                <BarChart3 size={200} />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
                                <div className="space-y-4">
                                    <h4 className="text-zinc-400 text-xs font-black uppercase tracking-[0.3em]">Competency Matrix</h4>
                                    <p className="text-zinc-500 text-base font-medium max-w-xs">Aggregate metrics from all assessment rounds will generate your professional profile.</p>
                                </div>
                                <div className="space-y-8">
                                    {[
                                        { label: "Technical Logic", val: "15%" },
                                        { label: "Architectural Depth", val: "8%" },
                                        { label: "Communication", val: "12%" }
                                    ].map((skill, i) => (
                                        <div key={i} className="space-y-3">
                                            <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                                <span className="text-zinc-500">{skill.label}</span>
                                                <span className="text-indigo-500">{skill.val}</span>
                                            </div>
                                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: skill.val }}
                                                    transition={{ duration: 1.5, delay: i * 0.2, ease: PREMIUM_EASE }}
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-600"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Creative Gap Filler */}
                    <SystemIntelligenceLog />
                </motion.div>
            </main>

            {/* Premium Dashboard Footer */}
            <footer className="border-t border-white/5 py-12 px-6 mt-20 bg-zinc-950/50 backdrop-blur-md">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col items-center md:items-start gap-2">
                        <div className="flex items-center gap-2">
                            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center">
                                <Zap size={14} className="text-white" fill="currentColor" />
                            </div>
                            <span className="text-zinc-200 font-bold text-sm tracking-tight text-white/80">InterviewAI Control</span>
                        </div>
                        <p className="text-zinc-600 text-[10px] uppercase font-bold tracking-[0.2em]">High-Fidelity Engineering Assessments</p>
                    </div>

                    <div className="flex items-center gap-8 text-zinc-500 text-xs font-bold uppercase tracking-widest">
                        <button
                            onClick={() => navigate('/terms')}
                            className="hover:text-white transition-colors"
                        >
                            Terms
                        </button>
                        <a href="mailto:gmoksh985@gmail.com" className="hover:text-white transition-colors">
                            Contact Support
                        </a>
                        <div className="h-4 w-px bg-white/10 hidden md:block" />
                        <div className="flex gap-4">
                            <a href="https://github.com/mokshxp" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                <Github size={18} />
                            </a>
                            <a href="https://www.linkedin.com/in/moksh-gupta-8b7588279/" target="_blank" rel="noopener noreferrer" className="hover:text-indigo-400 transition-colors">
                                <Linkedin size={18} />
                            </a>
                        </div>
                    </div>

                    <div className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em]">
                        © 2024 SYSTEM_CORE_V2
                    </div>
                </div>
            </footer>
        </div>
    );
}
