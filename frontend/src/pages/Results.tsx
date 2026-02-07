import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, BarChart as BarChartIcon, Home } from 'lucide-react';

interface ResultsData {
    scores: {
        oa_mcq: { score: number; total: number };
        oa_coding: number;
        tech_1: number;
        tech_2: number;
        behavioral: number;
    };
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
                                    <div className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                                        <span className="text-gray-600">Behavioral</span>
                                        <span className="font-bold text-gray-800">{results.scores.behavioral}/100</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

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
