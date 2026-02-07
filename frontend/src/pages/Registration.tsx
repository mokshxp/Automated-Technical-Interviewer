import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Upload, CheckCircle, AlertCircle, FileText, ArrowRight } from 'lucide-react';
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

            // Navigate to the NEW session
            setTimeout(() => {
                navigate(`/interview/${data.session_id}`);
            }, 1000);
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <motion.div
                initial="hidden"
                animate="visible"
                variants={containerVariants}
                className="max-w-6xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px]"
            >
                {/* LEFT COLUMN: Upload Section */}
                <div className="w-full md:w-1/2 p-10 flex flex-col justify-center bg-white relative">
                    <div className="max-w-md mx-auto w-full">
                        <motion.div variants={itemVariants}>
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Interview Setup</h2>
                            <p className="text-gray-500 mb-8">Upload your resume to personalize your interview experience.</p>
                        </motion.div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <motion.div variants={itemVariants}>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Resume (PDF/DOCX)</label>
                                <div
                                    className={`relative group border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${file ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'}`}
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
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${file ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
                                            {file ? <FileText size={32} /> : <Upload size={32} />}
                                        </div>
                                        {file ? (
                                            <div>
                                                <p className="font-medium text-indigo-900">{file.name}</p>
                                                <p className="text-xs text-indigo-500 mt-1">Ready to upload</p>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="font-medium text-gray-900">Click to upload or drag and drop</p>
                                                <p className="text-sm text-gray-500 mt-1">PDF or DOCX (Max 10MB)</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>

                            {/* Status Messages */}
                            {status === 'error' && (
                                <motion.div variants={itemVariants} className="bg-red-50 text-red-700 p-4 rounded-xl flex items-center gap-3">
                                    <AlertCircle size={20} />
                                    <span className="text-sm font-medium">{message}</span>
                                </motion.div>
                            )}

                            {status === 'success' && (
                                <motion.div variants={itemVariants} className="bg-green-50 text-green-700 p-4 rounded-xl flex items-center gap-3">
                                    <CheckCircle size={20} />
                                    <span className="text-sm font-medium">{message}</span>
                                </motion.div>
                            )}

                            <motion.button
                                variants={itemVariants}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                type="submit"
                                disabled={status === 'loading' || !file}
                                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${status === 'loading' || !file ? 'bg-gray-300 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-500/30'}`}
                            >
                                {status === 'loading' ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Processing...
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
                <div className="w-full md:w-1/2 bg-gradient-to-br from-indigo-900 to-purple-900 p-10 text-white flex flex-col justify-center relative overflow-hidden">
                    {/* Background Blobs */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/20 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

                    <div className="relative z-10 max-w-md mx-auto">
                        <motion.div variants={itemVariants} className="mb-10">
                            <h3 className="text-2xl font-bold mb-2">The Process</h3>
                            <p className="text-indigo-200">What to expect in the next 45 minutes.</p>
                        </motion.div>

                        <div className="space-y-8">
                            {/* Round 1 */}
                            <motion.div variants={itemVariants} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 text-indigo-300 font-bold">1</div>
                                    <div className="w-0.5 h-full bg-white/10 mt-2" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg flex items-center gap-2">MCQ Screening <span className="text-xs bg-indigo-500/30 text-indigo-200 px-2 py-0.5 rounded-full border border-indigo-500/30">10 min</span></h4>
                                    <p className="text-sm text-indigo-200 mt-1">Technical concepts tailored to your resume stack.</p>
                                </div>
                            </motion.div>

                            {/* Round 2 */}
                            <motion.div variants={itemVariants} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 text-indigo-300 font-bold">2</div>
                                    <div className="w-0.5 h-full bg-white/10 mt-2" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg flex items-center gap-2">Coding Challenge <span className="text-xs bg-purple-500/30 text-purple-200 px-2 py-0.5 rounded-full border border-purple-500/30">20 min</span></h4>
                                    <p className="text-sm text-indigo-200 mt-1">Solve an algorithmic problem with our secure code runner.</p>
                                </div>
                            </motion.div>

                            {/* Round 3 */}
                            <motion.div variants={itemVariants} className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20 text-indigo-300 font-bold">3</div>
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg flex items-center gap-2">Final Interview <span className="text-xs bg-pink-500/30 text-pink-200 px-2 py-0.5 rounded-full border border-pink-500/30">15 min</span></h4>
                                    <p className="text-sm text-indigo-200 mt-1">Spoken technical & behavioral questions with AI audio feedback.</p>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
