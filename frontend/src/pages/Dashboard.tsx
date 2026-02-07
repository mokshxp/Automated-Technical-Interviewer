import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, LogOut, Plus, Bot, Clock, BarChart3, ChevronRight, ArrowRight, Zap } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';

// --- Constants ---
const PREMIUM_EASE = [0.16, 1, 0.3, 1];

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
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // Dynamic Tilt
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), { stiffness: 150, damping: 25 });
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), { stiffness: 150, damping: 25 });

    function onMouseMove(event: React.MouseEvent<HTMLDivElement>) {
        const rect = event.currentTarget.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        mouseX.set((event.clientX - centerX) / rect.width);
        mouseY.set((event.clientY - centerY) / rect.height);
    }

    function onMouseLeave() {
        mouseX.set(0);
        mouseY.set(0);
    }

    const containerVariants = {
        initial: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: PREMIUM_EASE }
        },
        hover: {
            y: featured ? -16 : -12,
            scale: 1.04,
            transition: {
                duration: 0.22,
                ease: PREMIUM_EASE
            }
        },
        exit: {
            y: 0,
            scale: 1,
            transition: {
                duration: 0.32,
                ease: PREMIUM_EASE,
                delay: 0.08
            }
        }
    };

    const lightSweepVariants = {
        initial: { x: '-150%', opacity: 0 },
        hover: {
            x: '150%',
            opacity: [0, 1, 0],
            transition: {
                duration: 0.4,
                ease: "easeInOut"
            }
        }
    };

    const iconVariants = {
        idle: { scale: 1, rotate: 0 },
        hover: {
            scale: [1, 1.15, 1.05],
            rotate: [0, -6, 6, 0],
            transition: {
                duration: 0.25,
                times: [0, 0.4, 0.7, 1],
                ease: PREMIUM_EASE
            }
        }
    };

    const textVariants = {
        initial: { y: 0, opacity: 0.8 },
        hover: {
            y: -6,
            opacity: 1,
            transition: { duration: 0.2, ease: PREMIUM_EASE }
        }
    };

    const arrowVariants = {
        initial: { x: 0, opacity: 0.6 },
        hover: {
            x: 12,
            opacity: 1,
            transition: { duration: 0.2, ease: PREMIUM_EASE }
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
            exit="exit"
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseLeave}
            onClick={onClick}
            style={{
                rotateX: featured ? 0 : rotateX,
                rotateY: featured ? 0 : rotateY,
                perspective: 1000
            }}
            className={`group relative rounded-3xl cursor-pointer overflow-hidden transition-all duration-300 ${featured
                    ? `bg-gradient-to-br ${accentClasses[accentColor]} p-[1px]`
                    : "bg-zinc-950/50 border border-white/5 hover:bg-zinc-900"
                }`}
        >
            {/* Light Sweep Effect */}
            <motion.div
                variants={lightSweepVariants}
                className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 pointer-events-none z-20"
            />

            {/* Spotlight Glow */}
            <motion.div
                className="pointer-events-none absolute -inset-px rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"
                style={{
                    background: useTransform(
                        [mouseX, mouseY],
                        ([x, y]) => `radial-gradient(400px circle at ${((x as number) + 0.5) * 100}% ${((y as number) + 0.5) * 100}%, rgba(255,255,255,0.08), transparent 40%)`
                    )
                }}
            />

            {/* Inner Content */}
            <div className={`h-full rounded-[23px] p-8 flex flex-col justify-between relative z-10 ${featured ? "bg-zinc-900/90 backdrop-blur-xl" : "backdrop-blur-sm"
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

            {/* Idle Background Shimmer for Featured Card */}
            {featured && (
                <motion.div
                    animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0 bg-[linear-gradient(45deg,rgba(99,102,241,0.05),transparent,rgba(168,85,247,0.05))] bg-[length:200%_200%] pointer-events-none -z-10"
                />
            )}
        </motion.div>
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

            {/* Main Content */}
            <main className="relative z-10 max-w-7xl mx-auto py-20 px-6">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="space-y-16"
                >
                    {/* Header */}
                    <div className="text-center md:text-left space-y-4">
                        <motion.h2
                            variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: PREMIUM_EASE } } }}
                            className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-none"
                        >
                            Ready to practice?
                        </motion.h2>
                        <motion.p
                            variants={{ hidden: { opacity: 0, x: -30 }, visible: { opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.1, ease: PREMIUM_EASE } } }}
                            className="text-xl text-zinc-400 max-w-2xl font-medium leading-relaxed"
                        >
                            Unlock your engineering potential with focused, <br className="hidden md:block" />
                            <span className="text-indigo-400 font-bold decoration-indigo-500/30 decoration-2 underline-offset-4 underline">AI-driven technical simulations.</span>
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

                    {/* Lower Section: Enhanced Activity Placeholder */}
                    <motion.div
                        variants={{ hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: PREMIUM_EASE } } }}
                        className="pt-16 space-y-10"
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-2xl font-black flex items-center gap-3 text-white tracking-tight">
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
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
                </motion.div>
            </main>
        </div>
    );
}
