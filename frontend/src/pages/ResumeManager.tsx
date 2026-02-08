import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Loader2, Sparkles,
    Target, Binary, ShieldCheck,
    CloudUpload, Plus, ChevronRight,
    CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';

const PREMIUM_EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];


// --- Interfaces ---

interface LanguageProficiency {
    name: string;
    confidence: number;
}

interface CoreDomain {
    name: string;
    coverage: number;
}

interface Analytics {
    experience_level: "Junior" | "Mid" | "Senior";
    readiness_score: number;
    primary_languages: LanguageProficiency[];
    core_domains: CoreDomain[];
    strengths: string[];
    improvement_areas: string[];
    recommended_focus: string[];
}

interface Resume {
    id: number;
    name: string;
    email: string;
    resume_url: string;
    status: 'processing' | 'ready' | 'failed';
    analytics: Analytics | null;
    created_at: string;
}

// --- Components ---

const StatusBadge = ({ status }: { status: Resume['status'] }) => {
    const configs = {
        processing: { icon: RefreshCw, text: "Processing", color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20", spin: true },
        ready: { icon: CheckCircle2, text: "Ready", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", spin: false },
        failed: { icon: AlertCircle, text: "Failed", color: "text-red-400 bg-red-500/10 border-red-500/20", spin: false }
    };

    const config = configs[status];
    const Icon = config.icon;

    return (
        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[8px] font-black uppercase tracking-tighter ${config.color}`}>
            <Icon size={10} className={config.spin ? "animate-spin" : ""} />
            {config.text}
        </div>
    );
};

const StatRing = ({ value, color, delay, size = 64 }: { value: number, color: string, delay: number, size?: number }) => {
    const radius = (size / 2) - 4;
    const circumference = 2 * Math.PI * radius;

    return (
        <div className="relative flex items-center justify-center transition-transform hover:scale-110" style={{ width: size, height: size }}>
            <svg className="w-full h-full transform -rotate-90">
                <circle
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    className="text-zinc-800"
                />
                <motion.circle
                    cx={size / 2} cy={size / 2} r={radius}
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="transparent"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - (circumference * value) / 100 }}
                    transition={{ duration: 1.5, delay, ease: PREMIUM_EASE }}
                    className={color}
                />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-[10px] font-black tracking-tighter">
                {value}%
            </div>
        </div>
    );
};

const ProficiencyBar = ({ name, value, delay, color = "bg-indigo-500" }: { name: string, value: number, delay: number, color?: string }) => (
    <div className="space-y-2">
        <div className="flex justify-between items-end">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">{name}</span>
            <span className="text-[10px] font-mono text-zinc-500">{value}%</span>
        </div>
        <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden border border-white/5">
            <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${value}%` }}
                transition={{ duration: 1, delay, ease: PREMIUM_EASE }}
                className={`h-full ${color} shadow-[0_0_10px_rgba(99,102,241,0.3)]`}
            />
        </div>
    </div>
);

const DomainChip = ({ name, coverage, delay }: { name: string, coverage: number, delay: number }) => {
    const colorClass = coverage >= 75 ? "text-emerald-400" : coverage >= 50 ? "text-amber-400" : "text-red-400";
    const bgColorClass = coverage >= 75 ? "bg-emerald-500/10 border-emerald-500/20" : coverage >= 50 ? "bg-amber-500/10 border-amber-500/20" : "bg-red-500/10 border-red-500/20";

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay, duration: 0.4 }}
            className={`flex flex-col gap-2 p-4 rounded-2xl border ${bgColorClass} min-w-[120px]`}
        >
            <span className={`text-[9px] font-black uppercase tracking-widest ${colorClass}`}>{name}</span>
            <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight">{coverage}%</span>
                <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${coverage}%` }}
                        transition={{ duration: 1, delay: delay + 0.2 }}
                        className={`h-full ${coverage >= 75 ? 'bg-emerald-500' : coverage >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}
                    />
                </div>
            </div>
        </motion.div>
    );
};

const AnalysisLoader = () => {
    const steps = [
        "LLM_CORE :: EXTRACTING_SKILLS",
        "EXPERIENCE_ENGINE :: ANALYZING_DEPTH",
        "INTELLIGENCE_LAYER :: GENERATING_INSIGHTS",
        "FINALIZING_PROFILE"
    ];
    const [step, setStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStep(s => (s + 1) % steps.length);
        }, 1500);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center space-y-8 h-full py-20">
            <div className="relative">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    className="w-24 h-24 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full"
                />
                <div className="absolute inset-0 flex items-center justify-center text-indigo-500">
                    <Loader2 size={32} className="animate-spin" />
                </div>
            </div>
            <div className="space-y-2 text-center">
                <AnimatePresence mode="wait">
                    <motion.p
                        key={step}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -5 }}
                        className="text-xs font-mono tracking-[0.3em] text-indigo-400 uppercase"
                    >
                        {steps[step]}
                    </motion.p>
                </AnimatePresence>
                <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase">Analysis in progress...</p>
            </div>
        </div>
    );
};

interface HistoryItem {
    id: number;
    start_time: string;
    status: string;
    score: number;
    decision: string;
}

const InterviewHistory = ({ resumeId }: { resumeId: number }) => {
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchHistory = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get(`http://localhost:8000/interviews/resume/${resumeId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHistory(res.data);
            } catch (error) {
                console.error("Fetch history failed", error);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [resumeId]);

    if (loading) return <div className="p-4 text-center"><Loader2 className="animate-spin inline text-zinc-600" size={16} /></div>;
    if (history.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-white/5 border border-white/5 rounded-[32px] p-8 space-y-6"
        >
            <div className="flex items-center gap-2 text-zinc-400">
                <FileText size={18} />
                <h3 className="text-[11px] font-black uppercase tracking-[0.3em]">Interview Protocol History</h3>
            </div>
            <div className="space-y-3">
                {history.map(session => (
                    <button
                        key={session.id}
                        onClick={() => {
                            if (session.status === 'completed') navigate(`/results/${session.id}`);
                            else navigate(`/interview/${session.id}`);
                        }}
                        className="w-full flex items-center justify-between p-4 rounded-xl bg-zinc-900/50 border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`w-2 h-2 rounded-full ${session.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                            <div className="text-left">
                                <div className="text-sm font-bold text-white/90">Session #{session.id}</div>
                                <div className="text-[10px] font-mono text-zinc-500">{new Date(session.start_time).toLocaleDateString()}</div>
                            </div>
                        </div>
                        <div className="flex items-center gap-6">
                            {session.status === 'completed' && (
                                <>
                                    <div className="text-right">
                                        <div className="text-[9px] uppercase font-black text-zinc-500 tracking-widest">Score</div>
                                        <div className={`text-sm font-mono font-bold ${session.score >= 70 ? 'text-emerald-400' : 'text-zinc-400'}`}>
                                            {session.score}/100
                                        </div>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${session.decision === 'Hire' || session.decision === 'Strong Hire'
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                                        }`}>
                                        {session.decision || 'N/A'}
                                    </div>
                                </>
                            )}
                            {session.status !== 'completed' && (
                                <div className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/20">
                                    Active
                                </div>
                            )}
                            <ChevronRight size={16} className="text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                        </div>
                    </button>
                ))}
            </div>
        </motion.div>
    );
};

export default function ResumeManager() {
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [profileName, setProfileName] = useState('');
    const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();

    const fetchResumes = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) return; // Guard against no auth

            const response = await axios.get('http://localhost:8000/candidates/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResumes(response.data);

            // Auto-select removed for strict resume-centric flow
            // if (response.data.length > 0 && !selectedResumeId && !isPolling) {
            //     setSelectedResumeId(response.data[0].id);
            // }
        } catch (error) {
            console.error("Failed to fetch resumes", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResumes();
    }, []);

    // Polling Logic: Check every 2s if any candidate is processing
    useEffect(() => {
        if (resumes.some(r => r.status === 'processing')) {
            const interval = setInterval(() => {
                fetchResumes();
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [resumes]);

    const handleUpload = async (file: File) => {
        if (file.type !== 'application/pdf') {
            console.error("Only PDF files are allowed.");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('name', profileName || 'Legacy Profile');

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:8000/candidates/register', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfileName('');
            await fetchResumes();
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setUploading(false);
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleUpload(e.dataTransfer.files[0]);
        }
    };

    const selectedResume = resumes.find(r => r.id === selectedResumeId);


    // Dynamic Page State
    const isProcessing = selectedResume?.status === 'processing';
    const isFailed = selectedResume?.status === 'failed';
    const isReady = selectedResume?.status === 'ready' && !!selectedResume.analytics;

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-indigo-500/30 overflow-x-hidden">
            {/* Ambient Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[140px]" />
            </div>

            <main className="max-w-7xl mx-auto py-20 px-6 space-y-20">
                {/* Header Zone */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/5"
                        >
                            <Sparkles size={12} className="text-indigo-400" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 underline underline-offset-4 decoration-indigo-500/50">Resume Intelligence</span>
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-5xl font-black tracking-tight text-white/90"
                        >
                            Profile Analytics.
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            className="text-zinc-400 font-medium max-w-lg"
                        >
                            Review your engineering profile evaluation. Our LLM_CORE analyzes skill coverage, depth, and interview readiness from analyzed assets.
                        </motion.p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* LHS: Profiles & Upload */}
                    <div className="lg:col-span-4 space-y-10">
                        {/* New Profile Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative group p-[1px] rounded-[32px] bg-white/5"
                        >
                            <div className="bg-zinc-950/80 backdrop-blur-3xl rounded-[31px] p-6 space-y-6 border border-white/5">
                                <div className="space-y-2">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Create Profile</h3>
                                    <input
                                        type="text"
                                        placeholder="Label (e.g. Senior Architect)"
                                        value={profileName}
                                        onChange={(e) => setProfileName(e.target.value)}
                                        className="w-full bg-zinc-900/50 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-indigo-500/50 transition-colors"
                                    />
                                </div>

                                <div
                                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                                    onDragLeave={() => setDragActive(false)}
                                    onDrop={onDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`h-32 border-2 border-dashed rounded-[24px] flex flex-col items-center justify-center gap-3 cursor-pointer transition-all duration-300 ${dragActive
                                        ? 'border-indigo-500 bg-indigo-500/5 shadow-[0_0_30px_rgba(99,102,241,0.1)]'
                                        : 'border-white/5 bg-white/5 hover:border-white/20'
                                        }`}
                                >
                                    <input type="file" ref={fileInputRef} onChange={(e) => e.target.files && handleUpload(e.target.files[0])} className="hidden" accept=".pdf" />
                                    {uploading ? (
                                        <Loader2 size={24} className="text-indigo-500 animate-spin" />
                                    ) : (
                                        <CloudUpload size={24} className="text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                                    )}
                                    <div className="text-center">
                                        <p className="text-[10px] font-bold tracking-tight text-white/90">Click or drag PDF</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Active Profiles List */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">Active Profiles</h3>
                            <AnimatePresence mode="popLayout">
                                {loading ? (
                                    <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-zinc-800" /></div>
                                ) : resumes.length === 0 ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="p-10 border border-white/5 rounded-[24px] bg-white/5 text-center"
                                    >
                                        <Plus className="mx-auto mb-4 text-zinc-800" size={32} />
                                        <p className="text-sm font-medium text-zinc-600">No profiles analyzed yet.</p>
                                    </motion.div>
                                ) : (
                                    <div className="space-y-3">
                                        {resumes.map((resume) => (
                                            <motion.button
                                                key={resume.id}
                                                layout
                                                onClick={() => setSelectedResumeId(resume.id)}
                                                className={`w-full group relative p-4 rounded-2xl border transition-all text-left flex items-center justify-between ${selectedResumeId === resume.id
                                                    ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                                                    : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-2 rounded-lg transition-colors ${selectedResumeId === resume.id ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-500'}`}>
                                                        <FileText size={18} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-white/90 truncate max-w-[120px]">{resume.name}</h4>
                                                        <p className="text-[9px] uppercase font-black tracking-widest text-zinc-600 mt-1">{new Date(resume.created_at).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col gap-1 items-end">
                                                    <StatusBadge status={resume.status} />
                                                    {resume.analytics && (
                                                        <span className="text-[7px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/5 px-1.5 py-0.5 rounded-full border border-indigo-500/10">
                                                            {resume.analytics.experience_level}
                                                        </span>
                                                    )}
                                                </div>
                                            </motion.button>
                                        ))}
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* RHS: Analytics Dashboard */}
                    <div className="lg:col-span-8">
                        <AnimatePresence mode="wait">
                            {!selectedResumeId ? (
                                <motion.div
                                    key="no-selection"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="h-full border border-white/5 rounded-[32px] bg-white/5 min-h-[600px] flex flex-col items-center justify-center p-20 text-center space-y-6"
                                >
                                    <div className="p-5 rounded-full bg-zinc-800/50 text-zinc-600 border border-white/5">
                                        <Target size={48} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-white/90">Select a Profile</h3>
                                        <p className="text-sm text-zinc-500 max-w-xs">
                                            Choose an active resume profile from the list to view its specific analytics and interview history.
                                        </p>
                                    </div>
                                </motion.div>
                            ) : selectedResume && isReady && selectedResume.analytics ? (
                                <motion.div
                                    key={`ready-${selectedResume.id}`}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-10"
                                >
                                    {/* Intelligence Action Hero */}
                                    <div className="bg-zinc-900/40 border border-white/5 rounded-[40px] p-8 md:p-12">
                                        <div className="flex flex-col md:flex-row items-center gap-12">
                                            <div className="relative">
                                                <div className="absolute inset-0 bg-indigo-500/20 blur-[50px] rounded-full" />
                                                <StatRing value={selectedResume.analytics.readiness_score} color="text-indigo-400" delay={0.2} size={160} />
                                                <div className="absolute top-0 right-0 p-3 bg-indigo-500 rounded-2xl shadow-2xl shadow-indigo-500/50 translate-x-1 -translate-y-1">
                                                    <Target size={20} className="text-white" />
                                                </div>
                                            </div>
                                            <div className="flex-1 text-center md:text-left space-y-6">
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-center md:justify-start gap-3">
                                                        <h2 className="text-4xl font-black tracking-tighter">Interview Readiness</h2>
                                                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-indigo-400">
                                                            {selectedResume.analytics.experience_level} level
                                                        </span>
                                                    </div>
                                                    <p className="text-zinc-500 font-medium text-lg">
                                                        Based on resume depth, tech stack density, and role exposure.
                                                    </p>
                                                </div>
                                                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                                    <button
                                                        onClick={async () => {
                                                            try {
                                                                const token = localStorage.getItem('token');
                                                                const response = await axios.post('http://localhost:8000/interviews/',
                                                                    { resume_id: selectedResume.id },
                                                                    { headers: { Authorization: `Bearer ${token}` } }
                                                                );
                                                                navigate(`/interview/${response.data.session_id}`);
                                                            } catch (e) {
                                                                console.error("Failed to start session", e);
                                                                alert("Failed to initialize session. Please try again.");
                                                            }
                                                        }}
                                                        className="px-8 py-5 bg-white text-zinc-950 rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-zinc-200 transition-all shadow-2xl shadow-white/5 flex items-center justify-center gap-3 group"
                                                    >
                                                        Start Evaluation Session
                                                        <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Tech & Domains Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Language Proficiency */}
                                        <div className="bg-zinc-900/40 border border-white/5 rounded-[32px] p-8 space-y-8">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                                                    <Binary size={18} />
                                                </div>
                                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">Language Proficiency</h3>
                                            </div>
                                            <div className="space-y-6">
                                                {selectedResume.analytics.primary_languages?.map((lang, i) => (
                                                    <ProficiencyBar
                                                        key={lang.name}
                                                        name={lang.name}
                                                        value={lang.confidence}
                                                        delay={0.3 + (i * 0.1)}
                                                    />
                                                )) || <p className="text-xs text-zinc-500">No language data available.</p>}
                                            </div>
                                        </div>

                                        {/* Core Domain Matrix */}
                                        <div className="bg-zinc-900/40 border border-white/5 rounded-[32px] p-8 space-y-8">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                                                    <ShieldCheck size={18} />
                                                </div>
                                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-zinc-400">Domain Intelligence</h3>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                {selectedResume.analytics.core_domains?.map((domain, i) => (
                                                    <DomainChip
                                                        key={domain.name}
                                                        name={domain.name}
                                                        coverage={domain.coverage}
                                                        delay={0.4 + (i * 0.1)}
                                                    />
                                                )) || <p className="text-xs text-zinc-500 col-span-2">No domain data available.</p>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Insights Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Strength Analysis */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.6 }}
                                            className="bg-emerald-500/5 border border-emerald-500/10 rounded-[32px] p-8 space-y-6"
                                        >
                                            <div className="flex items-center gap-2 text-emerald-400">
                                                <CheckCircle2 size={18} />
                                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em]">Strongest Indicators</h3>
                                            </div>
                                            <ul className="space-y-4">
                                                {selectedResume.analytics.strengths?.map((str, i) => (
                                                    <li key={i} className="flex items-start gap-4">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                                        <p className="text-sm font-medium text-zinc-300 leading-relaxed">{str}</p>
                                                    </li>
                                                )) || <li className="text-xs text-zinc-500">No strengths detected.</li>}
                                            </ul>
                                        </motion.div>

                                        {/* Improvement Needed */}
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.7 }}
                                            className="bg-amber-500/5 border border-amber-500/10 rounded-[32px] p-8 space-y-6"
                                        >
                                            <div className="flex items-center gap-2 text-amber-400">
                                                <AlertCircle size={18} />
                                                <h3 className="text-[11px] font-black uppercase tracking-[0.3em]">Critical Gaps</h3>
                                            </div>
                                            <ul className="space-y-4">
                                                {selectedResume.analytics.improvement_areas?.map((gap, i) => (
                                                    <li key={i} className="flex items-start gap-4">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                                                        <p className="text-sm font-medium text-zinc-300 leading-relaxed">{gap}</p>
                                                    </li>
                                                )) || <li className="text-xs text-zinc-500">No improvement areas detected.</li>}
                                            </ul>
                                        </motion.div>
                                    </div>

                                    {/* Actionable Focus */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.8 }}
                                        className="bg-indigo-500/10 border border-indigo-500/20 rounded-[32px] p-8 space-y-6"
                                    >
                                        <div className="flex items-center gap-2 text-indigo-400">
                                            <Sparkles size={18} />
                                            <h3 className="text-[11px] font-black uppercase tracking-[0.3em]">Recommended Action Plan</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {selectedResume.analytics.recommended_focus?.map((focus, i) => (
                                                <div key={i} className="p-4 rounded-2xl bg-zinc-950/50 border border-white/5 text-xs font-bold text-zinc-400 leading-relaxed">
                                                    {focus}
                                                </div>
                                            )) || <p className="text-xs text-zinc-500">No recommendations available.</p>}
                                        </div>
                                    </motion.div>

                                    {/* Interview History Section */}
                                    <InterviewHistory resumeId={selectedResume.id} />
                                </motion.div>
                            ) : isProcessing ? (
                                <motion.div
                                    key="processing"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="h-full border border-white/5 rounded-[32px] bg-white/5 min-h-[600px] flex items-center justify-center"
                                >
                                    <AnalysisLoader />
                                </motion.div>
                            ) : isFailed ? (
                                <motion.div
                                    key="failed"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-full border border-red-500/20 rounded-[32px] bg-red-500/5 min-h-[400px] flex flex-col items-center justify-center p-20 text-center space-y-6"
                                >
                                    <div className="p-5 rounded-full bg-red-500/10 text-red-500">
                                        <AlertCircle size={48} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-red-400">Analysis Collapsed</h3>
                                        <p className="text-sm text-zinc-500 max-w-xs">We encountered an error while parsing this asset. Please verify the PDF integrity and try re-uploading.</p>
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                                    >
                                        Retry Analysis
                                    </button>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="h-full border border-white/5 rounded-[32px] bg-white/5 min-h-[400px] flex flex-col items-center justify-center p-20 text-center space-y-6"
                                >
                                    <div className="p-5 rounded-full bg-zinc-800 text-zinc-500">
                                        <Sparkles size={48} />
                                    </div>
                                    <div className="space-y-2">
                                        <h3 className="text-xl font-bold text-white/90">Awaiting Signal</h3>
                                        <p className="text-sm text-zinc-500 max-w-xs">Upload an engineering resume to generate multi-dimensional skill coverage and readiness analytics.</p>
                                    </div>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="px-6 py-3 bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-all"
                                    >
                                        Upload Resume
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Footer Metadata */}
                <div className="pt-20 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-zinc-600">
                    <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em]">
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> API: SECURE
                        </span>
                        <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> SYSTEM: READY
                        </span>
                    </div>
                    <p className="text-[10px] font-bold tracking-widest opacity-40 uppercase">Intelligence Dashboard :: V2_SYNCHRONIZED</p>
                </div>
            </main>
        </div>
    );
}
