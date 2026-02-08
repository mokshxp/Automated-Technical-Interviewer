import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Check, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const PREMIUM_EASE = [0.16, 1, 0.3, 1];

interface Plan {
    id: string;
    name: string;
    price: string;
    period: string;
    statement: string;
    features: string[];
    isPopular?: boolean;
    accent?: 'indigo' | 'emerald';
}

const commonFeatures = [
    'Full Premium Access',
    'Unlimited AI Simulations',
    'Priority AI Tutor Access',
    'Architecture Depth Reports',
    'Resume Parsing Analytics',
    'Advanced Skill Indexing'
];

const plans: Record<'weekly' | 'monthly' | 'yearly', Plan> = {
    weekly: {
        id: 'weekly',
        name: 'Weekly',
        price: '9',
        period: '/ week',
        statement: 'Full premium access on a flexible weekly basis.',
        features: commonFeatures
    },
    monthly: {
        id: 'monthly',
        name: 'Monthly',
        price: '29',
        period: '/ month',
        statement: 'The standard for consistent engineering growth.',
        features: commonFeatures
    },
    yearly: {
        id: 'yearly',
        name: 'Yearly',
        price: '99',
        period: '/ year',
        statement: 'Maximum value for long-term career mastery.',
        features: commonFeatures,
        isPopular: true,
        accent: 'indigo'
    }
};

const PricingToggle = ({ active, onChange }: { active: string, onChange: (id: 'weekly' | 'monthly' | 'yearly') => void }) => {
    return (
        <div className="flex p-1 bg-zinc-900/50 backdrop-blur-md border border-white/5 rounded-full w-fit mx-auto">
            {(['weekly', 'monthly', 'yearly'] as const).map((id) => (
                <button
                    key={id}
                    onClick={() => onChange(id)}
                    className={`relative px-6 py-2 text-xs font-black uppercase tracking-[0.2em] transition-colors duration-300 ${active === id ? 'text-white' : 'text-zinc-500 hover:text-white'
                        }`}
                >
                    {active === id && (
                        <motion.div
                            layoutId="toggle-pill"
                            className="absolute inset-0 bg-white/10 rounded-full"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                    )}
                    <span className="relative z-10">{id}</span>
                </button>
            ))}
        </div>
    );
};

const PricingCard = ({ plan, index, onUpgrade, loading }: { plan: Plan; index: number; onUpgrade: (id: string) => void; loading: boolean }) => {
    const isYearly = plan.id === 'yearly';

    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.8,
                delay: index * 0.1,
                ease: PREMIUM_EASE
            }
        }
    };

    return (
        <motion.div
            variants={cardVariants}
            whileHover={{ y: isYearly ? -12 : -8, scale: 1.02 }}
            className={`relative group rounded-[32px] p-[1px] ${isYearly
                ? 'bg-gradient-to-b from-indigo-500/50 via-indigo-500/10 to-transparent'
                : 'bg-white/5'
                }`}
        >
            <div className={`h-full rounded-[31px] p-10 flex flex-col justify-between backdrop-blur-3xl transition-all duration-300 ${isYearly ? 'bg-zinc-950/90 shadow-[0_0_40px_rgba(99,102,241,0.1)] group-hover:shadow-[0_0_60px_rgba(99,102,241,0.2)]' : 'bg-zinc-950/80 group-hover:bg-zinc-900/80'}`}>

                {isYearly && (
                    <div className="absolute top-6 right-6">
                        <div className="px-3 py-1 bg-indigo-500/20 rounded-full border border-indigo-500/30 overflow-hidden relative">
                            <span className="text-[10px] font-black uppercase tracking-[0.1em] text-indigo-400 relative z-10">Best Value</span>
                            <motion.div
                                animate={{ x: ['-200%', '200%'] }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                            />
                        </div>
                    </div>
                )}

                <div>
                    <div className="space-y-1 mb-8">
                        <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">{plan.name}</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl md:text-5xl font-bold tracking-tighter text-white/90">$</span>
                            <motion.span
                                key={plan.price}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl md:text-5xl font-bold tracking-tighter text-white/90"
                                transition={{ duration: 0.2, ease: "easeOut" }}
                            >
                                {plan.price}
                            </motion.span>
                            <span className="text-zinc-500 text-sm font-medium tracking-tight">{plan.period}</span>
                        </div>
                    </div>

                    <p className="text-zinc-400 text-sm leading-relaxed mb-8 font-medium">{plan.statement}</p>

                    <ul className="space-y-4 mb-10">
                        {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-start gap-3 group/item">
                                <div className="mt-1 w-4 h-4 rounded-full bg-white/5 flex items-center justify-center border border-white/5 transition-colors group-hover/item:border-indigo-500/50">
                                    <Check size={10} className="text-zinc-500 transition-colors group-hover/item:text-indigo-400" />
                                </div>
                                <span className="text-zinc-400 text-xs font-medium tracking-tight group-hover/item:text-zinc-300 transition-colors">{feature}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <motion.button
                    onClick={() => onUpgrade(plan.id)}
                    disabled={loading}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.96 }}
                    className={`w-full py-4 rounded-2xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.2em] transition-all duration-300 relative group/btn overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed ${isYearly
                        ? 'bg-indigo-600 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)]'
                        : 'bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10'
                        }`}
                >
                    <span className="relative z-10">
                        {loading ? 'Processing...' : 'Upgrade Now'}
                    </span>
                    {!loading && <ChevronRight size={14} className="relative z-10 transition-transform group-hover/btn:translate-x-1" />}
                    {loading && <Loader2 size={14} className="relative z-10 animate-spin" />}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 pointer-events-none opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                </motion.button>
            </div>
        </motion.div>
    );
};

export default function Pricing() {
    const navigate = useNavigate();
    const { refreshSubscription } = useAuth();
    const [selectedPlan, setSelectedPlan] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const handleUpgrade = async (interval: string) => {
        setLoadingPlan(interval);
        try {
            await axios.post('http://localhost:8000/auth/upgrade', { interval });
            await refreshSubscription();
            navigate('/dashboard');
        } catch (error) {
            console.error("Upgrade failed", error);
        } finally {
            setLoadingPlan(null);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[140px] animate-pulse-slow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[140px] animate-pulse-slow delay-1000" />
            </div>

            {/* Navbar Placeholder */}
            <nav className="border-b border-white/5 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-all text-xs font-black uppercase tracking-widest group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>
                    <div className="flex items-center gap-2 font-bold text-lg">
                        <Zap size={18} className="text-indigo-500" fill="currentColor" />
                        <span className="text-white/80 tracking-tight">System Access</span>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-24 px-6">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="space-y-16"
                >
                    {/* Header */}
                    <div className="text-center space-y-6 max-w-2xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5"
                        >
                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Premium Upgrade</span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
                            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                            className="text-4xl md:text-5xl font-black tracking-tight text-white/90"
                        >
                            Engineered for Consistency.
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-zinc-500 font-medium leading-relaxed"
                        >
                            Choose the plan that aligns with your engineering goals. <br className="hidden md:block" />
                            Unlimited simulations and advanced performance metrics across all tiers.
                        </motion.p>
                    </div>

                    {/* Toggle */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <PricingToggle active={selectedPlan} onChange={setSelectedPlan} />
                    </motion.div>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
                        <PricingCard
                            plan={plans.weekly}
                            index={0}
                            onUpgrade={handleUpgrade}
                            loading={loadingPlan === 'weekly'}
                        />
                        <PricingCard
                            plan={plans.monthly}
                            index={1}
                            onUpgrade={handleUpgrade}
                            loading={loadingPlan === 'monthly'}
                        />
                        <PricingCard
                            plan={plans.yearly}
                            index={2}
                            onUpgrade={handleUpgrade}
                            loading={loadingPlan === 'yearly'}
                        />
                    </div>

                    {/* Footer Note */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.4 }}
                        transition={{ delay: 1 }}
                        className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 pt-10"
                    >
                        All transactions are processed through encrypted system tunnels.
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
}
