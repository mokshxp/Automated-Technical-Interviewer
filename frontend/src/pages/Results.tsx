import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, BarChart as BarChartIcon, Home } from 'lucide-react';

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
        // behavioral: number; // Removed
    };
    questions_analysis?: QuestionAnalysis[];
    overall_status: string;
    feedback: string;
}

export default function Results() {
    const { sessionId } = useParams<{ sessionId: string }>();
    const [results, setResults] = useState<ResultsData | null>(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        axios.get(`http://localhost:8000/interview/${sessionId}/results`)
            .then(res => setResults(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(false));
    }, [sessionId]);

    if (loading) return <div className="min-h-screen flex items-center justify-center">Loading Results...</div>;
    if (!results) return <div>No Results Found</div>;

    const mcqPercent = Math.round((results.scores.oa_mcq.score / results.scores.oa_mcq.total) * 100);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                    <div className={`p-8 text-center text-white ${results.overall_status === 'Strong Hire' ? 'bg-green-600' : 'bg-gray-700'}`}>
                        <h1 className="text-4xl font-bold mb-2">{results.overall_status}</h1>
                        <p className="opacity-90">{results.feedback}</p>
                    </div>

                    <div className="p-8">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <BarChartIcon className="text-indigo-600" /> Score Breakdown
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* OA Stats */}
                            <div className="bg-indigo-50 p-6 rounded-xl">
                                <h3 className="font-semibold text-indigo-900 mb-4">Online Assessment</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                                        <span className="text-gray-600">MCQ Score</span>
                                        <span className="font-bold text-gray-800">{mcqPercent}% ({results.scores.oa_mcq.score}/{results.scores.oa_mcq.total})</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                                        <span className="text-gray-600">Coding Challenge</span>
                                        {results.scores.oa_coding === 100 ?
                                            <span className="flex items-center gap-1 text-green-600 font-bold"><CheckCircle size={16} /> Passed</span> :
                                            <span className="flex items-center gap-1 text-red-500 font-bold"><XCircle size={16} /> Failed</span>
                                        }
                                    </div>
                                </div>
                            </div>

                            {/* Interview Stats */}
                            <div className="bg-indigo-50 p-6 rounded-xl">
                                <h3 className="font-semibold text-indigo-900 mb-4">AI Interview Rounds</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                                        <span className="text-gray-600">Technical I (DSA)</span>
                                        <span className="font-bold text-gray-800">{results.scores.tech_1}/100</span>
                                    </div>
                                    <div className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                                        <span className="text-gray-600">Technical II (System Design)</span>
                                        <span className="font-bold text-gray-800">{results.scores.tech_2}/100</span>
                                    </div>
                                    {/* Behavioral Removed */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Detailed Answer Sheet */}
                {results.questions_analysis && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-8">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-800">Detailed Answer Sheet</h2>
                        </div>
                        <div className="divide-y divide-gray-100">
                            {results.questions_analysis.map((qa, idx) => (
                                <div key={idx} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex gap-4">
                                        <div className="mt-1">
                                            {qa.is_correct ?
                                                <CheckCircle className="text-green-500" size={24} /> :
                                                <XCircle className="text-red-500" size={24} />
                                            }
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-gray-900 mb-2">{idx + 1}. {qa.question}</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div className={`p-3 rounded-lg ${qa.is_correct ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
                                                    <span className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">Your Answer</span>
                                                    <span className={qa.is_correct ? 'text-green-800' : 'text-red-800'}>{qa.user_answer}</span>
                                                </div>
                                                {!qa.is_correct && (
                                                    <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                                                        <span className="block text-xs font-semibold uppercase tracking-wider mb-1 opacity-70">Correct Answer</span>
                                                        <span className="text-gray-800">{qa.correct_answer}</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="mt-2 flex gap-2">
                                                {qa.tags && qa.tags.map(tag => (
                                                    <span key={tag} className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">{tag}</span>
                                                ))}
                                                <span className={`text-xs px-2 py-1 rounded-full ${qa.difficulty === 'easy' ? 'bg-green-100 text-green-700' : qa.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                                    {qa.difficulty}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="text-center">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 flex items-center gap-2 mx-auto"
                    >
                        <Home size={18} /> Return to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}
