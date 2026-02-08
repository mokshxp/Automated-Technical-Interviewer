import { useState, useEffect } from 'react';
import axios from 'axios';
import { Loader } from 'lucide-react';
import Timer from '../common/Timer';

interface Question {
    text: string;
    options: string[];
    correct_answer: number;
    id: number;
}
interface Props {
    sessionId: string;
    onComplete: () => void;
}

export default function RoundOA_MCQ({ sessionId, onComplete }: Props) {
    // ... (state remains same)
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
    const [currentIndex, setCurrentIndex] = useState(0);

    // ... (existing useEffects and handlers)

    useEffect(() => {
        // Fetch questions linked to SESSION (Strict)
        axios.get(`http://localhost:8000/interview/${sessionId}/questions`)
            .then(res => {
                const shuffled = res.data.sort(() => Math.random() - 0.5);
                setQuestions(shuffled);
            })
            .catch(err => {
                console.error(err);
            })
            .finally(() => setLoading(false));
    }, [sessionId]);

    // Timer Logic
    useEffect(() => {
        if (loading || submitting) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    handleSubmit(true); // Force submit
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [loading, submitting]);

    // ... (rest of logic)

    const handleAnswer = (qId: number, optionIdx: number) => {
        setAnswers(prev => ({ ...prev, [qId]: optionIdx }));
    };

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const prevQuestion = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async (auto = false) => {
        setSubmitting(true);
        try {
            await axios.post(`http://localhost:8000/interview/${sessionId}/submit_round`, {
                data: {
                    type: 'oa_mcq',
                    answers: answers,
                    auto_submitted: auto
                }
            });
            onComplete();
        } catch (error) {
            console.error("Submission failed", error);
            if (!auto) {
                console.log("Failed to submit round. Please retry.");
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="flex justify-center p-10"><Loader className="animate-spin" /></div>;
    if (questions.length === 0) return <div className="p-10 text-center text-red-500">No questions loaded. Link error?</div>;

    const currentQ = questions[currentIndex];
    const isLast = currentIndex === questions.length - 1;
    const isAnswered = answers[currentQ.id] !== undefined;
    const allAnswered = Object.keys(answers).length === questions.length;

    return (
        <div className="min-h-full w-full bg-white p-6 md:p-12">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800">Round 1: Online Assessment</h2>
                    <p className="text-gray-500 text-sm">Question {currentIndex + 1} of {questions.length}</p>
                </div>
                <div className="bg-zinc-900 rounded-xl p-2 shadow-lg">
                    <Timer
                        duration={15 * 60}
                        remaining={timeLeft}
                        size="sm"
                        showTrack={false}
                    />
                </div>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 mb-8 min-h-[400px] flex flex-col">
                <h3 className="text-xl font-semibold mb-6 leading-relaxed">{currentQ.text}</h3>

                <div className="space-y-3 flex-grow">
                    {currentQ.options.map((opt, optIdx) => (
                        <button
                            key={optIdx}
                            onClick={() => handleAnswer(currentQ.id, optIdx)}
                            className={`w-full text-left p-4 rounded-xl border-2 transition-all ${answers[currentQ.id] === optIdx
                                ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-medium shadow-sm'
                                : 'border-gray-100 hover:border-indigo-200 hover:bg-gray-50'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${answers[currentQ.id] === optIdx ? 'border-indigo-600' : 'border-gray-300'
                                    }`}>
                                    {answers[currentQ.id] === optIdx && <div className="w-3 h-3 rounded-full bg-indigo-600" />}
                                </div>
                                {opt}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex justify-between items-center">
                <button
                    onClick={prevQuestion}
                    disabled={currentIndex === 0 || submitting}
                    className={`px-6 py-2 rounded-lg font-medium transition ${currentIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-100'
                        }`}
                >
                    Previous
                </button>

                {isLast ? (
                    <button
                        onClick={() => handleSubmit(false)}
                        disabled={submitting || !allAnswered}
                        className={`px-8 py-3 rounded-xl font-bold shadow-lg transition transform active:scale-95 ${submitting || !allAnswered
                            ? 'bg-gray-300 cursor-not-allowed text-gray-500 shadow-none'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-indigo-500/30'
                            }`}
                    >
                        {submitting ? 'Submitting...' : !allAnswered ? 'Answer All to Submit' : 'Submit Assessment'}
                    </button>
                ) : (
                    <button
                        onClick={nextQuestion}
                        className="px-8 py-3 rounded-xl font-bold bg-gray-900 text-white hover:bg-black transition transform active:scale-95 flex items-center gap-2 shadow-lg"
                    >
                        Next Question
                    </button>
                )}
            </div>
        </div>
    );
}
