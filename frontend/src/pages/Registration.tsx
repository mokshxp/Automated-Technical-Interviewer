import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Upload, CheckCircle, AlertCircle, FileText, ArrowRight, Code, Mic, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Registration() {
    const [file, setFile] = useState<File | null>(null);
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const { token } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            alert("Please upload a resume");
            return;
        }

        setStatus('loading');
        const formData = new FormData();
        formData.append('resume', file);

        try {
            const response = await fetch('http://localhost:8000/candidates/register', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || 'Registration failed');
            }

            const data = await response.json();
            setStatus('success');

            // Artificial delay for animation
            setTimeout(() => {
                navigate(`/interview/${data.session_id}`);
            }, 1000);
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, x: -10 },
        visible: {
            opacity: 1,
            x: 0,
            transition: { type: "spring" as const, stiffness: 100 }
        }
    };

    const rightPanelVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: {
            opacity: 1,
            x: 0,
            transition: {
                duration: 0.6,
                delay: 0.2,
                staggerChildren: 0.1
            }
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 md:p-8 font-sans selection:bg-indigo-500/30 overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse-slow delay-1000" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-5xl w-full bg-zinc-900/50 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] relative z-10"
            >
                {/* LEFT COLUMN: Upload Section */}
                <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center relative">
                    <div className="max-w-sm mx-auto w-full">
                        <motion.div variants={itemVariants}>
                            <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center mb-6 border border-white/5 shadow-inner">
                                <Upload className="text-indigo-400" size={24} />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-3">Prepare Your Interview</h2>
                            <p className="text-zinc-400 mb-8 leading-relaxed">Upload your resume to let our AI customize technical questions specifically for your stack.</p>
                        </motion.div>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            <motion.div variants={itemVariants}>
                                <div
                                    className={`relative group border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${file ? 'border-indigo-500/50 bg-indigo-500/5' : 'border-zinc-700 hover:border-indigo-500/30 hover:bg-zinc-800/50'}`}
                                    onClick={() => document.getElementById('file-upload')?.click()}
                                >
                                    <input
                                        id="file-upload"
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,.docx"
                                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                                    />

                                    <div className="flex flex-col items-center">
                                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-all duration-300 ${file ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/25' : 'bg-zinc-800 text-zinc-500 group-hover:scale-110 group-hover:bg-zinc-700 group-hover:text-zinc-300'}`}>
                                            {file ? <FileText size={24} /> : <Upload size={24} />}
                                        </div>
                                        {file ? (
                                            <div>
                                                <p className="font-semibold text-white">{file.name}</p>
                                                <p className="text-xs text-indigo-400 mt-1 font-medium">Ready to upload</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="font-medium text-zinc-200">Click or drag resume here</p>
                                                <p className="text-xs text-zinc-500 mt-1 uppercase tracking-wider">PDF or DOCX (Max 10MB)</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Status Messages */}
                            {status === 'error' && (
                                <motion.div variants={itemVariants} className="bg-red-500/10 border border-red-500/20 text-red-200 p-4 rounded-xl flex items-center gap-3">
                                    <AlertCircle size={20} className="text-red-400" />
                                    <span className="text-sm font-medium">{message}</span>
                                </motion.div>
                            )}

                            {status === 'success' && (
                                <motion.div variants={itemVariants} className="bg-green-500/10 border border-green-500/20 text-green-200 p-4 rounded-xl flex items-center gap-3">
                                    <CheckCircle size={20} className="text-green-400" />
                                    <span className="text-sm font-medium">Resume parsed! Setting up interview...</span>
                                </motion.div>
                            )}

                            <motion.button
                                variants={itemVariants}
                                whileHover={{ scale: 1.02, boxShadow: "0 0 20px -5px rgba(99, 102, 241, 0.4)" }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={status === 'loading' || !file}
                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all relative overflow-hidden ${status === 'loading' || !file ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:shadow-indigo-500/25'}`}
                            >
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                {status === 'loading' ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        <span className="text-white/80">Processing...</span>
                                    </>
                                ) : (
                                    <>
                                        Start Interview <ArrowRight size={20} />
                                    </>
                                )}
                            </motion.button>
                        </form>
                    </div>
                </div>

                {/* RIGHT COLUMN: Instructions Panel */}
                <div className="w-full md:w-1/2 bg-zinc-900/80 border-l border-white/5 p-8 md:p-12 relative overflow-hidden flex flex-col justify-center">
                    {/* Inner Gradient for Depth */}
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 to-cyan-900/20 pointer-events-none" />

                    <motion.div variants={rightPanelVariants} className="relative z-10 max-w-sm mx-auto w-full">
                        <div className="mb-10">
                            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                                <Zap className="text-cyan-400" size={20} fill="currentColor" /> Interview Flow
                            </h3>
                            <p className="text-zinc-400 text-sm">You are about to start a 45-minute AI-led session.</p>
                        </div>

                        <div className="space-y-6">
                            {/* Step 1 */}
                            <motion.div variants={rightPanelVariants} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                                <div className="mt-1">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 group-hover:bg-indigo-500/20 transition-colors">
                                        <FileText size={20} />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-semibold text-white">Screening</h4>
                                        <span className="text-[10px] font-bold bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/20">10m</span>
                                    </div>
                                    <p className="text-sm text-zinc-400 mt-1">Multi-choice questions tailored to your uploaded resume.</p>
                                </div>
                            </motion.div>

                            {/* Step 2 */}
                            <motion.div variants={rightPanelVariants} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                                <div className="mt-1">
                                    <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                                        <Code size={20} />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-semibold text-white">Coding</h4>
                                        <span className="text-[10px] font-bold bg-cyan-500/20 text-cyan-300 px-2 py-0.5 rounded-full border border-cyan-500/20">20m</span>
                                    </div>
                                    <p className="text-sm text-zinc-400 mt-1">Solve an algorithmic challenge in our secure code runner.</p>
                                </div>
                            </motion.div>

                            {/* Step 3 */}
                            <motion.div variants={rightPanelVariants} className="flex gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                                <div className="mt-1">
                                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:bg-purple-500/20 transition-colors">
                                        <Mic size={20} />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-semibold text-white">Final Round</h4>
                                        <span className="text-[10px] font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full border border-purple-500/20">15m</span>
                                    </div>
                                    <p className="text-sm text-zinc-400 mt-1">Voice-based technical & system design questions.</p>
                                </div>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>
        </div>
    );
}
