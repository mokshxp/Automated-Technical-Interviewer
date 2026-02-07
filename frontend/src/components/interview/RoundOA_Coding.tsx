import { useState, useEffect } from 'react';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import { Play, Loader } from 'lucide-react';

interface Props {
    sessionId: string;
    onComplete: () => void;
}

interface TestCase {
    input: any;
    output: any;
}

interface Problem {
    problem_id: number;
    title: string;
    description: string;
    starter_code: string;
    public_test_cases: TestCase[];
}

export default function RoundOA_Coding({ sessionId, onComplete }: Props) {
    const [problem, setProblem] = useState<Problem | null>(null);
    const [code, setCode] = useState("");
    const [output, setOutput] = useState("");
    const [running, setRunning] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const language = "python";

    useEffect(() => {
        // Fetch Problem
        axios.get(`http://localhost:8000/interview/${sessionId}/coding/problem`)
            .then(res => {
                setProblem(res.data);
                setCode(res.data.starter_code);
            })
            .catch(err => {
                console.error("Failed to fetch problem", err);
                setOutput("Error loading problem. Please refresh.");
            })
            .finally(() => setLoading(false));
    }, [sessionId]);

    const runCode = async () => {
        if (!problem) return;
        setRunning(true);
        setOutput("Running against public test cases...");
        try {
            const response = await axios.post(`http://localhost:8000/interview/${sessionId}/coding/run`, {
                language,
                code,
            }, {
                params: { problem_id: problem.problem_id }
            });

            if (response.data.error) {
                setOutput(`Error:\n${response.data.error}`);
            } else {
                setOutput(response.data.output || "No output");
            }
        } catch (err: any) {
            setOutput(`Execution Failed: ${err.message}`);
        } finally {
            setRunning(false);
        }
    };

    const handleSubmit = async () => {
        if (!problem) return;
        setSubmitting(true);
        try {
            const response = await axios.post(`http://localhost:8000/interview/${sessionId}/coding/submit`, {
                language,
                code
            }, {
                params: { problem_id: problem.problem_id }
            });

            const resultOutput = response.data.execution_result?.output || "";
            const passed = response.data.passed;

            if (!passed) {
                alert("Your solution did not pass all hidden test cases. Check console output.");
                setOutput(resultOutput + "\n\n[System] Some test cases failed. Keep trying!");
                setSubmitting(false);
                return;
            }

            // Success
            alert("All Test Cases Passed! Moving to next round.");
            onComplete();
        } catch (error) {
            console.error("Submission failed", error);
            alert("Submission failed error.");
            setSubmitting(false);
        }
    };

    if (loading) return <div className="h-full flex items-center justify-center">Loading Problem...</div>;
    if (!problem) return <div className="h-full flex items-center justify-center text-red-500">Failed to load coding problem.</div>;

    return (
        <div className="flex flex-col h-screen bg-gray-100">
            <header className="bg-white shadow p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Round 1: Coding Challenge</h2>
                <div className="flex gap-2">
                    <button
                        onClick={runCode}
                        disabled={running}
                        className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
                    >
                        {running ? <Loader size={16} className="animate-spin" /> : <Play size={16} />} Run
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="bg-indigo-600 text-white px-6 py-2 rounded font-bold hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {submitting ? 'Submitting...' : 'Submit Solution'}
                    </button>
                </div>
            </header>

            <div className="flex-1 flex gap-4 p-4 overflow-hidden">
                {/* Problem Statement */}
                <div className="w-1/3 bg-white p-6 rounded shadow overflow-y-auto">
                    <h3 className="text-lg font-bold mb-4">Problem: {problem.title}</h3>
                    <p className="text-gray-600 mb-4 whitespace-pre-wrap">{problem.description}</p>

                    <div className="mt-4">
                        <h4 className="font-semibold mb-2">Public Test Cases:</h4>
                        {problem.public_test_cases.map((tc, idx) => (
                            <div key={idx} className="bg-gray-50 p-4 rounded text-sm font-mono mb-2">
                                <div>Input: {JSON.stringify(tc.input)}</div>
                                <div>Output: {JSON.stringify(tc.output)}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Editor & Console */}
                <div className="w-2/3 flex flex-col gap-4">
                    <div className="flex-1 bg-[#1e1e1e] rounded overflow-hidden shadow">
                        <Editor
                            height="100%"
                            defaultLanguage="python"
                            value={code}
                            theme="vs-dark"
                            onChange={(val: string | undefined) => setCode(val || "")}
                        />
                    </div>
                    <div className="h-1/3 bg-black text-white p-4 font-mono text-sm rounded shadow overflow-auto">
                        <div className="text-gray-500 mb-2 border-b border-gray-700 pb-1">Console Output</div>
                        <pre className="whitespace-pre-wrap">{output}</pre>
                    </div>
                </div>
            </div>
        </div>
    );
}

