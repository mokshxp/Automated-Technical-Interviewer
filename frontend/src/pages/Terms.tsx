import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Zap, ChevronLeft } from 'lucide-react';

const LUXURY_EASE = [0.16, 1, 0.3, 1] as const;

export default function Terms() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-indigo-500/30 overflow-hidden relative">
            {/* Ambient Background */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full h-full max-w-[1400px] pointer-events-none">
                <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[140px]" />
                <div className="absolute top-[20%] right-[20%] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px]" />
            </div>

            {/* Navbar Placeholder */}
            <nav className="border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
                <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors group"
                    >
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back
                    </button>
                    <div className="flex items-center gap-2 font-bold text-lg">
                        <Zap size={16} className="text-indigo-500" fill="currentColor" />
                        <span className="text-zinc-400">Legal</span>
                    </div>
                </div>
            </nav>

            <main className="max-w-4xl mx-auto py-20 px-6 space-y-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: LUXURY_EASE }}
                    className="space-y-4"
                >
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white/90">Terms & Conditions</h1>
                    <p className="text-zinc-500 font-medium tracking-wide uppercase text-[10px]">Last Updated: February 2024</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2, duration: 1 }}
                    className="prose prose-invert prose-zinc max-w-none space-y-8 text-zinc-400"
                >
                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-white/80">1. Acceptance of Terms</h2>
                        <p>By accessing and using InterviewAI, you agree to be bound by these terms. This platform is designed for mock interview practice and technical assessment simulations.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-white/80">2. Artificial Intelligence</h2>
                        <p>Our services utilize advanced AI models to generate questions, evaluate answers, and provide feedback. While we strive for accuracy, AI-generated content may occasionally contain errors or biases.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-white/80">3. Data Usage</h2>
                        <p>Resumes and interview transcripts are processed to provide personalized feedback. We do not sell your personal data to third parties.</p>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-bold text-white/80">4. Code Execution</h2>
                        <p>Coding sandbox environments are provided for practice. Any attempt to abuse or compromise the execution environment will result in immediate termination of access.</p>
                    </section>
                </motion.div>
            </main>
        </div>
    );
}
