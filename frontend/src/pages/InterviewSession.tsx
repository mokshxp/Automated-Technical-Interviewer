import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import RoundOA_MCQ from '../components/interview/RoundOA_MCQ';
import RoundOA_Coding from '../components/interview/RoundOA_Coding';
import RoundChat from '../components/interview/RoundChat';
import PrepTimer from '../components/interview/PrepTimer';

type RoundState = 'INITIALIZING' | 'READY' | 'TRANSITIONING' | 'COMPLETED';

export default function InterviewSession() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();

    // State Machine
    const [roundState, setRoundState] = useState<RoundState>('INITIALIZING');
    const [serverState, setServerState] = useState<any>(null);
    const transitionGuard = useRef(false);

    // Fetch Interview State
    const fetchState = async (isTransition = false) => {
        try {
            const res = await axios.get(`http://localhost:8000/interview/${sessionId}/state`);
            setServerState(res.data);

            if (res.data.status === 'completed') {
                setRoundState('COMPLETED');
            } else {
                // If this fetch was part of a transition, allow a small delay for the overlay to be seen
                // ensuring it doesn't just flash for 10ms
                if (isTransition) {
                    setTimeout(() => {
                        setRoundState('READY');
                        transitionGuard.current = false;
                    }, 800);
                } else {
                    setRoundState('READY');
                }
            }
        } catch (error) {
            console.error("Failed to fetch state", error);
            // In a real app, handle error state here
            transitionGuard.current = false;
        }
    };

    // Initial Load
    useEffect(() => {
        fetchState();

        // Strict body lock to prevent scroll on transition
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, [sessionId]);

    // Transition Handler (Guarded)
    const handleTransition = async (action: 'advance' | 'refresh') => {
        if (transitionGuard.current) return;
        transitionGuard.current = true;
        setRoundState('TRANSITIONING');

        try {
            if (action === 'advance') {
                await axios.post(`http://localhost:8000/interview/${sessionId}/advance`);
            }
            // 'refresh' just fetches new state (assuming submit happened inside component)
            await fetchState(true);
        } catch (error) {
            console.error("Transition failed", error);
            setRoundState('READY');
            transitionGuard.current = false;
        }
    };

    // Render Helpers
    const currentRound = serverState?.current_round;

    const renderActiveRound = () => {
        if (!currentRound) return null;

        if (currentRound.startsWith('prep_')) {
            let message = "Get Ready";
            let duration = 60;
            switch (currentRound) {
                case 'prep_oa': message = "MCQ Assessment :: Core Concepts Matrix"; break;
                case 'prep_coding': message = "Algorithm Challenge :: LeetCode Protocol"; break;
                case 'prep_tech_1': message = "Technical Round 01 :: DSA & Logic Depth"; break;
                case 'prep_tech_2': message = "Technical Round 02 :: System Architecture"; break;
            }
            return <PrepTimer duration={duration} message={message} onComplete={() => handleTransition('advance')} />;
        }

        switch (currentRound) {
            case 'oa_mcq':
                return <RoundOA_MCQ sessionId={sessionId!} onComplete={() => handleTransition('refresh')} />;
            case 'oa_coding':
                return <RoundOA_Coding sessionId={sessionId!} onComplete={() => handleTransition('refresh')} />;
            case 'tech_1':
            case 'tech_2':
                return <RoundChat sessionId={sessionId!} roundType={currentRound} onComplete={() => handleTransition('refresh')} />;
            case 'resume_analysis':
                // Auto-advance resume analysis if stuck here, though backend usually handles this
                return <div className="text-white text-center mt-20">Analyzing Resume...</div>;
            default:
                return (
                    <div className="flex items-center justify-center h-full text-red-500 font-mono">
                        Unknown Round: {currentRound}
                    </div>
                );
        }
    };

    return (
        <div className="fixed inset-0 bg-zinc-950 overflow-hidden font-sans selection:bg-zinc-800">
            {/* 1. Active Round Content (Always Rendered unless Completed) */}
            {roundState !== 'COMPLETED' && roundState !== 'INITIALIZING' && (
                <div className="absolute inset-0 z-0">
                    {renderActiveRound()}
                </div>
            )}

            {/* 2. Transition Overlay (Renders ON TOP of content) */}
            <AnimatePresence>
                {(roundState === 'TRANSITIONING' || roundState === 'INITIALIZING') && (
                    <TransitionOverlay key="overlay" isInitial={roundState === 'INITIALIZING'} />
                )}
            </AnimatePresence>

            {/* 3. Completion View */}
            <AnimatePresence>
                {roundState === 'COMPLETED' && (
                    <CompletionView onNavigate={() => navigate(`/results/${sessionId}`)} />
                )}
            </AnimatePresence>
        </div>
    );
}

// --- Subcomponents ---

function TransitionOverlay({ isInitial }: { isInitial: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[50] flex items-center justify-center bg-zinc-950/90 backdrop-blur-sm text-white"
        >
            <div className="w-full max-w-[420px] bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl overflow-hidden">
                {/* Progress Bar */}
                <div className="h-1 w-full bg-zinc-800">
                    <motion.div
                        className="h-full bg-indigo-500"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: isInitial ? 1.5 : 2, ease: "easeInOut" }}
                    />
                </div>

                <div className="p-8 flex flex-col items-center text-center space-y-6">
                    {/* Header */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 mb-3">
                            {isInitial ? (
                                <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                            ) : (
                                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                                </div>
                            )}
                            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                                {isInitial ? 'System Boot' : 'Round Completed'}
                            </span>
                        </div>
                        <h2 className="text-xl font-medium text-white">
                            {isInitial ? 'Initializing Interview Protocol' : 'Preparing Next Stage'}
                        </h2>
                    </div>

                    {/* Subtext */}
                    <p className="text-sm text-zinc-400">
                        {isInitial ? 'Establishing secure connection...' : 'System is synchronizing interview assets.'}<br />
                        <span className="text-zinc-600 block mt-1">Starting shortly...</span>
                    </p>

                    {/* Footer */}
                    <div className="w-full pt-6 border-t border-zinc-800 flex justify-between items-center text-[10px] text-zinc-600 font-mono uppercase">
                        <span>Status: Active</span>
                        <span>Latency: 12ms</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function CompletionView({ onNavigate }: { onNavigate: () => void }) {
    useEffect(() => {
        const timer = setTimeout(onNavigate, 3500);
        return () => clearTimeout(timer);
    }, [onNavigate]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-zinc-950 text-white p-8 text-center"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
            >
                <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                </div>
                <h1 className="text-4xl font-black uppercase tracking-tighter text-white">
                    Interview Complete
                </h1>
                <p className="text-zinc-500 font-medium max-w-sm mx-auto">
                    The evaluation matrix is being calculated. Redirecting to your performance intelligence report...
                </p>
            </motion.div>
        </motion.div>
    );
}
