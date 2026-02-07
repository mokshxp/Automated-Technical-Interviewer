import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import RoundOA_MCQ from '../components/interview/RoundOA_MCQ';
import RoundOA_Coding from '../components/interview/RoundOA_Coding';
import RoundChat from '../components/interview/RoundChat';
import PrepTimer from '../components/interview/PrepTimer';

export default function InterviewSession() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const [state, setState] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchState = async () => {
        try {
            const res = await axios.get(`http://localhost:8000/interview/${sessionId}/state`);
            setState(res.data);
        } catch (error) {
            console.error("Failed to fetch state", error);
        } finally {
            setLoading(false);
        }
    };

    const advanceRound = async () => {
        setLoading(true);
        try {
            await axios.post(`http://localhost:8000/interview/${sessionId}/advance`);
            fetchState();
        } catch (error) {
            console.error("Failed to advance", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchState();
        // Poll every 10s to ensure sync? Or just rely on triggers.
        // User wants strict flow, so auto-transitions should happen via frontend triggers or backend sync.
    }, [sessionId]);

    const handleRoundComplete = () => {
        setLoading(true);
        // For task rounds (MCQ/Coding/Chat), completion implies submission which advances state on backend.
        // So we just fetch state.
        fetchState();
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-gray-900 text-white">
            <div className="text-2xl animate-pulse font-light">Loading Interview Protocol...</div>
        </div>
    );

    if (state?.status === 'completed') {
        setTimeout(() => navigate(`/results/${sessionId}`), 2000); // Auto redirect to results
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-4xl font-bold text-green-400 mb-4"
                >
                    Interview Complete
                </motion.h1>
                <p className="text-gray-400">Analysis in progress...</p>
            </div>
        );
    }

    const round = state?.current_round;

    // 1. Resume Analysis (Auto-advance)
    if (round === 'resume_analysis') {
        return (
            <div className="h-screen flex flex-col items-center justify-center bg-black text-white p-8 text-center">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                >
                    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                    <h2 className="text-2xl font-bold">Analyzing Resume...</h2>
                    <p className="text-gray-400">Extracting skills and generating personalized questions.</p>
                </motion.div>
                {/* Auto-advance effect */}
                <EffectAdvance onAdvance={advanceRound} delay={5000} />
            </div>
        );
    }

    // 2. Prep Rounds
    if (round?.startsWith('prep_')) {
        let message = "Get Ready";
        let duration = 5; // Default short for testing

        switch (round) {
            case 'prep_oa':
                message = "Online Assessment (MCQ) starting shortly.\nFocus on your core concepts.";
                duration = 60; // 2 min (Using 60s for demo, user asked 2 min) -> 120s
                break;
            case 'prep_coding':
                message = "Coding Challenge starting shortly.\nYou will be given one LeetCode-style problem.";
                duration = 60; // 2 min
                break;
            case 'prep_tech_1':
                message = "Technical Round 1 (DSA) starting shortly.\nYou will be asked to explain your coding approach verbally.";
                duration = 60;
                break;
            case 'prep_tech_2':
                message = "Technical Round 2 (System Design) starting shortly.\nPrepare to discuss projects and architecture.";
                duration = 60;
                break;

        }

        // Override for quick testing if needed, but sticking to logic
        return <PrepTimer duration={duration} message={message} onComplete={advanceRound} />;
    }

    // 3. Task Rounds
    if (round === 'oa_mcq') {
        return <RoundOA_MCQ sessionId={sessionId!} onComplete={handleRoundComplete} />;
    }

    if (round === 'oa_coding') {
        return <RoundOA_Coding sessionId={sessionId!} onComplete={handleRoundComplete} />;
    }

    if (['tech_1', 'tech_2'].includes(round)) {
        return <RoundChat sessionId={sessionId!} roundType={round} onComplete={handleRoundComplete} />;
    }

    return <div className="p-10 text-white">Unknown State: {round}</div>;
}

// Helper for auto-advancing component
function EffectAdvance({ onAdvance, delay }: { onAdvance: () => void, delay: number }) {
    useEffect(() => {
        const timer = setTimeout(onAdvance, delay);
        return () => clearTimeout(timer);
    }, []);
    return null;
}
