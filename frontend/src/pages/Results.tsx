import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, BarChart as BarChartIcon, ArrowRight, BookOpen, Cpu, Code } from 'lucide-react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';

// --- Interfaces ---
interface QuestionAnalysis {
    question: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    difficulty: string;
    tags: string[];
}

interface ResultsData {
    scores: {
        oa_mcq: { score: number; total: number };
        oa_coding: number;
        tech_1: number;
        tech_2: number;
    };
    questions_analysis?: QuestionAnalysis[];
    overall_status: string;
    feedback: string;
}

// --- Animation Components ---

const CountUp = ({ to, duration = 1 }: { to: number, duration?: number }) => {
    const count = useMotionValue(0);
    const rounded = useTransform(count, (latest) => Math.round(latest));

    useEffect(() => {
        const controls = animate(count, to, { duration, ease: "easeOut" });
        return controls.stop;
    }, [count, to, duration]);

    return <motion.span>{rounded}</motion.span>;
};

const FadeInWhenVisible = ({ children, delay = 0 }: { children: React.ReactNode, delay?: number }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay, ease: "easeOut" }}
        >
            {children}
        </motion.div>
    );
};

// --- Main Component ---

export default function Results() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const [results, setResults] = useState<ResultsData | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        // Slight artificial delay for "calculating" feel if response is too fast
        const start = Date.now();
        axios.get(`http://localhost:8000/interview/${sessionId}/results`)
            .then(res => {
                const elapsed = Date.now() - start;
                const delay = Math.max(0, 800 - elapsed);
                setTimeout(() => {
                    setResults(res.data);
                    setLoading(false);
                }, delay);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [sessionId]);

    if (loading) return (
        <div className="fixed inset-0 bg-zinc-950 flex flex-col items-center justify-center text-white z-50">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full mb-8"
            />
            <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-indigo-300 font-mono tracking-widest uppercase text-sm"
            >
                Finalizing Assessment Matrix...
            </motion.p>
        </div>
    );

    if (!results) return (
        <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
            <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Results Not Found</h2>
                <button onClick={() => navigate('/dashboard')} className="text-indigo-600 hover:underline">Return Home</button>
            </div>
        </div>
    );

    const mcqPercent = results.scores.oa_mcq.total > 0 ? Math.round((results.scores.oa_mcq.score / results.scores.oa_mcq.total) * 100) : 0;

    // Determine Verdict Styling
    let verdictColor = "bg-gray-100 text-gray-800 border-gray-200";
    let verdictIcon = <div className="w-3 h-3 rounded-full bg-gray-400" />;
    let verdictGlow = "shadow-gray-200/50";
    let displayText = results.overall_status;
    let displaySubtext = results.feedback;

    if (results.overall_status === 'Strong Hire') {
        verdictColor = "bg-emerald-50 text-emerald-900 border-emerald-200";
        verdictIcon = <CheckCircle className="text-emerald-500" size={20} />;
        verdictGlow = "shadow-emerald-500/20";
    } else if (results.overall_status === 'Reject' || results.overall_status === 'Weak') {
        displayText = "Development Focus Needed"; // Softer language
        verdictColor = "bg-rose-50 text-rose-900 border-rose-200";
        verdictIcon = <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />;
        verdictGlow = "shadow-rose-500/20";
        // Ensure feedback is visible even if brief/harsh from backend (though backend ideally sends good feedback)
        if (displaySubtext.length < 10) displaySubtext = "The assessment identified key areas for technical growth. Review the detailed breakdown below to improve your skills.";
    } else {
        // Borderline/Average
        displayText = "Potential Identified";
        verdictColor = "bg-amber-50 text-amber-900 border-amber-200";
        verdictIcon = <div className="w-2 h-2 rounded-full bg-amber-500" />;
        verdictGlow = "shadow-amber-500/20";
    }

    return (
        <div className="min-h-screen bg-[#FDFDFC] font-sans selection:bg-indigo-100 selection:text-indigo-900 pb-20">
            {/* 1. VERDICT HEADER */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
                className="bg-white border-b border-gray-100 sticky top-0 z-40 backdrop-blur-md bg-white/80"
            >
                <div className="max-w-5xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">A</div>
                        <span className="font-bold text-gray-900 tracking-tight">Antigravity<span className="text-indigo-600">.ai</span></span>
                    </div>
                    <button onClick={() => navigate('/dashboard')} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
                        Exit to Dashboard
                    </button>
                </div>
            </motion.div>

            <div className="max-w-4xl mx-auto px-6 mt-12 space-y-16">

                {/* Verdict Reveal Animation */}
                <motion.div
                    initial={{ scale: 0.96, opacity: 0, y: 10 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className={`relative p-8 rounded-2xl border ${verdictColor} ${verdictGlow} shadow-xl overflow-hidden`}
                >
                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                        <div className="flex-1 space-y-2">
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex items-center gap-3 mb-4"
                            >
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-white/50 border border-current flex items-center gap-2`}>
                                    {verdictIcon} Status
                                </span>
                                <span className="text-xs font-mono opacity-60 uppercase">{new Date().toLocaleDateString()}</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3, duration: 0.5 }}
                                className="text-4xl md:text-5xl font-black tracking-tighter"
                            >
                                {displayText}
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.9 }}
                                transition={{ delay: 0.5 }}
                                className="text-lg leading-relaxed max-w-2xl opacity-90"
                            >
                                {displaySubtext}
                            </motion.p>
                        </div>

                        {/* Circular Score Badge */}
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 20 }}
                            className="bg-white p-1 rounded-full shadow-lg"
                        >
                            <div className="w-24 h-24 rounded-full border-4 border-current flex flex-col items-center justify-center bg-gray-50 text-current">
                                <span className="text-3xl font-black"><CountUp to={Math.round((results.scores.tech_1 + results.scores.tech_2) / 2)} /></span>
                                <span className="text-[10px] font-bold uppercase tracking-wide opacity-60">Avg Score</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Background Shine */}
                    <motion.div
                        className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-white/40 to-transparent pointer-events-none"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    />
                </motion.div>


                {/* 2. SCORE BREAKDOWN */}
                <div className="space-y-6">
                    <FadeInWhenVisible>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <BarChartIcon className="text-indigo-600" size={20} /> Performance Analytics
                        </h2>
                    </FadeInWhenVisible>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* OA Card */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1, duration: 0.5 }}
                            whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-indigo-100 transition-all group"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg group-hover:bg-blue-100 transition-colors">
                                    <Code size={20} />
                                </div>
                                <h3 className="font-bold text-gray-800">Online Assessment</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <span className="text-gray-500 text-sm font-medium">MCQ Proficiency</span>
                                    <span className="font-mono font-bold text-gray-900 text-lg">
                                        <CountUp to={mcqPercent} />%
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-500 text-sm font-medium">Coding Check</span>
                                    {results.scores.oa_coding === 100 ?
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            whileInView={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.3 }}
                                            className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm bg-emerald-50 px-3 py-1 rounded-full"
                                        >
                                            <CheckCircle size={14} /> PASSED
                                        </motion.div> :
                                        <motion.div
                                            initial={{ x: -5 }}
                                            whileInView={{ x: 0, rotate: [0, -5, 5, 0] }}
                                            transition={{ delay: 0.3, duration: 0.4 }}
                                            className="flex items-center gap-1.5 text-rose-600 font-bold text-sm bg-rose-50 px-3 py-1 rounded-full"
                                        >
                                            <XCircle size={14} /> FAILED
                                        </motion.div>
                                    }
                                </div>
                            </div>
                        </motion.div>

                        {/* Interview Card */}
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.22, duration: 0.5 }}
                            whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-purple-100 transition-all group"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg group-hover:bg-purple-100 transition-colors">
                                    <Cpu size={20} />
                                </div>
                                <h3 className="font-bold text-gray-800">Technical Deep Dive</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-2 border-b border-gray-50">
                                    <div className="flex flex-col">
                                        <span className="text-gray-500 text-sm font-medium">DSA & Logic</span>
                                        <span className="text-[10px] text-gray-300 uppercase tracking-wider">Round 1</span>
                                    </div>
                                    <span className="font-mono font-bold text-gray-900 text-lg">
                                        <CountUp to={results.scores.tech_1} />/100
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <div className="flex flex-col">
                                        <span className="text-gray-500 text-sm font-medium">System Design</span>
                                        <span className="text-[10px] text-gray-300 uppercase tracking-wider">Round 2</span>
                                    </div>
                                    <span className="font-mono font-bold text-gray-900 text-lg">
                                        <CountUp to={results.scores.tech_2} />/100
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>


                {/* 3. DETAILED ANSWER SHEET */}
                {results.questions_analysis && results.questions_analysis.length > 0 && (
                    <div className="space-y-6">
                        <FadeInWhenVisible>
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <BookOpen className="text-indigo-600" size={20} /> Knowledge Gap Analysis
                            </h2>
                        </FadeInWhenVisible>

                        <div className="space-y-4">
                            {results.questions_analysis.map((qa, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true, margin: "-50px" }}
                                    transition={{ duration: 0.5, delay: idx * 0.05 }} // Stagger
                                    whileHover={{ y: -2, boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                                    className={`bg-white rounded-xl border p-6 transition-all duration-300 ${qa.is_correct ? 'border-gray-100' : 'border-rose-100 bg-rose-50/10'}`}
                                >
                                    <div className="flex gap-4 items-start">
                                        <div className="mt-1 flex-shrink-0">
                                            {qa.is_correct ?
                                                <div className="p-1 rounded-full bg-emerald-100 text-emerald-600"><CheckCircle size={18} /></div> :
                                                <motion.div
                                                    initial={{ scale: 0.8 }}
                                                    whileInView={{ scale: 1 }}
                                                    className="p-1 rounded-full bg-rose-100 text-rose-600"
                                                >
                                                    <XCircle size={18} />
                                                </motion.div>
                                            }
                                        </div>

                                        <div className="flex-1 space-y-4">
                                            <div>
                                                <h3 className="text-gray-900 font-medium leading-snug">{qa.question}</h3>

                                                {/* Tags */}
                                                <div className="flex flex-wrap gap-2 mt-3">
                                                    {qa.tags?.map(tag => (
                                                        <motion.span
                                                            key={tag}
                                                            whileHover={{ scale: 1.05, backgroundColor: "#e0e7ff", color: "#3730a3" }}
                                                            className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500 px-2 py-1 rounded-md cursor-default transition-colors"
                                                        >
                                                            {tag}
                                                        </motion.span>
                                                    ))}
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${qa.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-600' :
                                                        qa.difficulty === 'medium' ? 'bg-amber-50 text-amber-600' :
                                                            'bg-rose-50 text-rose-600'
                                                        }`}>
                                                        {qa.difficulty}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Answers */}
                                            <div className="flex flex-col md:flex-row gap-4 text-sm mt-4">
                                                <div className={`flex-1 p-3 rounded-lg border ${qa.is_correct ? 'bg-emerald-50/50 border-emerald-100 text-emerald-900' : 'bg-rose-50/50 border-rose-100 text-rose-900'}`}>
                                                    <span className="block text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">You Selected</span>
                                                    <div className="font-medium">{qa.user_answer}</div>
                                                </div>

                                                {!qa.is_correct && (
                                                    <motion.div
                                                        initial={{ opacity: 0, x: 10 }}
                                                        whileInView={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.2 }}
                                                        className="flex-1 p-3 rounded-lg border bg-gray-50 border-gray-200 text-gray-700"
                                                    >
                                                        <span className="block text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">Correct Answer</span>
                                                        <div className="font-medium">{qa.correct_answer}</div>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}


                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="flex justify-center pb-12"
                >
                    <motion.button
                        onClick={() => navigate('/dashboard')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-zinc-900 text-white px-8 py-4 rounded-full font-bold shadow-2xl hover:bg-black transition-colors flex items-center gap-3 group"
                    >
                        Return to Dashboard
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                </motion.div>

            </div>
        </div>
    );
}
