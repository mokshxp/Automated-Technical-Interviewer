import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AlertCircle, Clock, ChevronRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
    id: number;
    text: string;
    options: string[];
    correct_answer: number;
    difficulty: string;
    tags: string[];
}

export default function Quiz() {
    const { candidateId } = useParams<{ candidateId: string }>();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [currentQIndex, setCurrentQIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const fetchQuestions = async () => {
            try {
                const response = await fetch(`http://localhost:8000/candidates/${candidateId}/questions`);
                if (!response.ok) throw new Error('Failed to fetch questions');
                const data = await response.json();
                setQuestions(data);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (candidateId) fetchQuestions();
    }, [candidateId]);

    const handleSubmit = async (auto = false) => {
        setIsSubmitting(true);
        if (auto) console.log("Auto-submitting");

        try {
            const response = await fetch(`http://localhost:8000/candidates/${candidateId}/quiz_submit`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answers }),
            });

            if (!response.ok) throw new Error('Failed to submit quiz');

            const data = await response.json();
            navigate(`/interview/${data.session_id}`);
        } catch (err: any) {
            setError(err.message);
            setIsSubmitting(false);
        }
    };

    // Timer Logic
    useEffect(() => {
        if (loading || isSubmitting) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [loading, isSubmitting]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleOptionSelect = (optionIndex: number) => {
        const currentQ = questions[currentQIndex];
        setAnswers(prev => ({ ...prev, [currentQ.id]: optionIndex }));
    };

    const handleNext = () => {
        if (currentQIndex < questions.length - 1) {
            setCurrentQIndex(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
            <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center text-red-400">
            <AlertCircle className="mr-2" /> {error}
        </div>
    );

    const currentQ = questions[currentQIndex];
    if (!currentQ) return null;

    const progress = ((currentQIndex) / questions.length) * 100;

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-20%] left-[-10%] w-[60%] h-[60%] bg-purple-600/10 rounded-full blur-[120px]" />

            {/* Header */}
            <div className="relative z-10 px-8 py-6 flex justify-between items-center border-b border-white/5 bg-white/5 backdrop-blur-md">
                <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                        Screening Round
                    </h1>
                    <p className="text-xs text-gray-400 mt-1">Question {currentQIndex + 1} of {questions.length}</p>
                </div>

                <div className={`flex items-center gap-2 font-mono text-lg font-bold px-4 py-2 rounded-xl bg-black/30 border border-white/10 ${timeLeft < 60 ? 'text-red-400 animate-pulse' : 'text-indigo-300'}`}>
                    <Clock size={18} />
                    {formatTime(timeLeft)}
                </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-800 h-1">
                <motion.div
                    className="h-full bg-indigo-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>

            {/* Main Question Area */}
            <div className="flex-1 flex items-center justify-center p-6 relative z-10">
                <div className="max-w-3xl w-full">
                    <AnimatePresence mode='wait'>
                        <motion.div
                            key={currentQ.id}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl"
                        >
                            {/* Tags/Difficulty */}
                            <div className="flex gap-2 mb-6">
                                <span className={`px-2 py-0.5 rounded-full text-xs uppercase tracking-wider font-bold border ${currentQ.difficulty === 'easy' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                        currentQ.difficulty === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                            'bg-red-500/10 text-red-400 border-red-500/20'
                                    }`}>
                                    {currentQ.difficulty}
                                </span>
                            </div>

                            <h2 className="text-2xl md:text-3xl font-bold mb-10 leading-relaxed">
                                {currentQ.text}
                            </h2>

                            <div className="space-y-4">
                                {currentQ.options.map((option, idx) => {
                                    const isSelected = answers[currentQ.id] === idx;
                                    return (
                                        <motion.button
                                            key={idx}
                                            whileHover={{ scale: 1.01 }}
                                            whileTap={{ scale: 0.99 }}
                                            onClick={() => handleOptionSelect(idx)}
                                            className={`w-full text-left p-5 rounded-xl border transition-all duration-200 flex items-center justify-between group ${isSelected
                                                    ? 'bg-indigo-600 border-indigo-500 shadow-lg shadow-indigo-500/20'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                                                }`}
                                        >
                                            <span className={`text-lg ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                                                {option}
                                            </span>
                                            {isSelected && (
                                                <div className="bg-white text-indigo-600 rounded-full p-1">
                                                    <Check size={16} strokeWidth={3} />
                                                </div>
                                            )}
                                        </motion.button>
                                    );
                                })}
                            </div>

                            <div className="mt-10 flex justify-end">
                                <button
                                    onClick={handleNext}
                                    disabled={answers[currentQ.id] === undefined}
                                    className={`px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all ${answers[currentQ.id] !== undefined
                                            ? 'bg-white text-indigo-900 hover:bg-indigo-50'
                                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                        }`}
                                >
                                    {currentQIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
