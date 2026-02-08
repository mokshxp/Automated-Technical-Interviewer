import { useState, useEffect } from 'react';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import { Play, Loader } from 'lucide-react';
import Timer from '../common/Timer';
import { useProctoring } from '../../hooks/useProctoring';

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

const LANGUAGES = [
    { id: 'python', name: 'Python' },
    { id: 'javascript', name: 'JavaScript' },
    { id: 'typescript', name: 'TypeScript' }
];

export default function RoundOA_Coding({ sessionId, onComplete }: Props) {
    // ... (state remains same)
    const [problem, setProblem] = useState<Problem | null>(null);
    const [language, setLanguage] = useState("python");
    const [code, setCode] = useState("");
    const [output, setOutput] = useState("");
    const [running, setRunning] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(30 * 60);

    const handleForceSubmit = async () => {
        // ... (existing logic)
        if (!problem) return;
        setSubmitting(true);
        try {
            await axios.post(`http://localhost:8000/interview/${sessionId}/coding/submit`, {
                language,
                code
            }, {
                params: { problem_id: problem.problem_id }
            });
            console.log("Interview Terminated. Submitting current progress.");
            onComplete();
        } catch (e) {
            console.error("Force submit failed", e);
            onComplete();
        }
    };

    const { warning } = useProctoring({
        onTerminate: handleForceSubmit,
        enable: !!problem && !submitting
    });

    // ... (rest of logic: getStarterCode, useEffects)

    const getStarterCode = (lang: string, prob: Problem) => {
        if (lang === 'python') return prob.starter_code;

        const title = prob.title.toLowerCase();
        if (title.includes("two sum")) {
            return lang === 'typescript'
                ? "function twoSum(nums: number[], target: number): number[] {\n    // Write your code here\n    return [];\n}"
                : "function twoSum(nums, target) {\n    // Write your code here\n    return [];\n}";
        }
        if (title.includes("reverse string")) {
            return lang === 'typescript'
                ? "function reverseString(s: string[]): string[] {\n    // Write your code here\n    return [];\n}"
                : "function reverseString(s) {\n    // Write your code here\n    return [];\n}";
        }
        if (title.includes("fizzbuzz")) {
            return lang === 'typescript'
                ? "function fizzBuzz(n: number): string[] {\n    // Write your code here\n    return [];\n}"
                : "function fizzBuzz(n) {\n    // Write your code here\n    return [];\n}";
        }

        return "// Write your solution here";
    };

    useEffect(() => {
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

    useEffect(() => {
        if (loading || !problem) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    console.log("Time is up! Submitting your solution.");
                    handleSubmit();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [loading, problem]);

    const handleLanguageChange = (newLang: string) => {
        setLanguage(newLang);
        if (problem) {
            setCode(getStarterCode(newLang, problem));
        }
    };

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
                setOutput(prev => prev + "\n\n[System] Warning: Some test cases failed. Submitting anyway...");
            }

            console.log(passed ? "All Test Cases Passed" : "Submitted with failures");
            onComplete();
        } catch (error) {
            console.error("Submission failed", error);
            setOutput(prev => prev + "\n[System] Error: Submission failed. Please try again.");
            setSubmitting(false);
        }
    };


    if (loading) return <div className="h-full flex items-center justify-center">Loading Problem...</div>;
    if (!problem) return <div className="h-full flex items-center justify-center text-red-500">Failed to load coding problem.</div>;

    return (
        <div className="flex flex-col min-h-full w-full bg-gray-100 relative overflow-hidden">
            {warning && (
                <div className="absolute top-20 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-6 py-4 rounded-lg shadow-2xl z-50 flex items-center gap-3 animate-bounce">
                    <span className="text-2xl">⚠️</span>
                    <span className="font-bold">{warning}</span>
                </div>
            )}
            <header className="bg-white shadow p-4 flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-gray-800">Round 1: Coding Challenge</h2>
                    <select
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="border rounded px-2 py-1 bg-gray-50 text-sm"
                    >
                        {LANGUAGES.map(lang => (
                            <option key={lang.id} value={lang.id}>{lang.name}</option>
                        ))}
                    </select>
                </div>

                <div className="bg-zinc-900 rounded-xl p-2 shadow-lg flex items-center justify-center">
                    <Timer
                        duration={30 * 60}
                        remaining={timeLeft}
                        size="sm"
                        showTrack={false}
                    />
                </div>

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
                            language={language}
                            value={code}
                            theme="vs-dark"
                            onChange={(val: string | undefined) => setCode(val || "")}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
                            }}
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

