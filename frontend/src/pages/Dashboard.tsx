import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileText, LogOut, Plus, Bot, Clock, BarChart3, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Dashboard() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
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
        <div className="min-h-screen bg-gray-900 text-white relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/20 rounded-full blur-[120px]" />

            {/* Navbar */}
            <nav className="relative z-10 border-b border-white/10 bg-white/5 backdrop-blur-md">
                <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg">
                            AI
                        </div>
                        <h1 className="text-xl font-bold tracking-tight">Mock Interviewer</h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden md:block text-sm text-gray-400">
                            Welcome back, <span className="text-white font-medium">{user?.full_name}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 transition-colors"
                        >
                            <LogOut size={16} /> <span className="hidden sm:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <main className="relative z-10 max-w-7xl mx-auto py-12 px-6">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="space-y-12"
                >
                    {/* Hero Section */}
                    <div className="text-center md:text-left">
                        <motion.h2 variants={itemVariants} className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Ready to practice?
                        </motion.h2>
                        <motion.p variants={itemVariants} className="text-gray-400 mb-8">
                            Start a new session or review your past performance.
                        </motion.p>
                    </div>

                    {/* Action Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* New Session Card */}
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                            className="group relative bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 shadow-2xl overflow-hidden cursor-pointer"
                            onClick={() => navigate('/register')}
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Plus size={120} />
                            </div>
                            <div className="relative z-10">
                                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-6 text-white text-xl">
                                    <Plus size={28} />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">New Interview</h3>
                                <p className="text-indigo-100/80 mb-6">Start a full end-to-end mock interview session based on your resume.</p>
                                <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider">
                                    Start Now <ChevronRight size={16} />
                                </div>
                            </div>
                        </motion.div>

                        {/* Resume Manager Card */}
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                            className="group bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-lg rounded-3xl p-8 transition-colors cursor-pointer"
                            onClick={() => navigate('/resumes')}
                        >
                            <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center mb-6 text-green-400">
                                <FileText size={28} />
                            </div>
                            <h3 className="text-2xl font-bold mb-2 text-white">Resumes</h3>
                            <p className="text-gray-400 mb-6">Manage your uploaded resumes and view parsed details.</p>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-300 group-hover:text-white transition-colors">
                                View Resumes <ArrowRightIcon />
                            </div>
                        </motion.div>

                        {/* AI Tutor Card */}
                        <motion.div
                            variants={itemVariants}
                            whileHover={{ y: -5 }}
                            className="group bg-white/5 border border-white/10 hover:bg-white/10 backdrop-blur-lg rounded-3xl p-8 transition-colors cursor-pointer"
                            onClick={() => navigate('/learning')}
                        >
                            <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center mb-6 text-purple-400">
                                <Bot size={28} />
                            </div>
                            <h3 className="text-2xl font-bold mb-2 text-white">AI Tutor</h3>
                            <p className="text-gray-400 mb-6">Chat with our AI to learn new concepts or get interview tips.</p>
                            <div className="flex items-center gap-2 text-sm font-bold text-gray-300 group-hover:text-white transition-colors">
                                Start Chat <ArrowRightIcon />
                            </div>
                        </motion.div>
                    </div>

                    {/* Recent Activity Section */}
                    <motion.div variants={itemVariants}>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-xl font-bold flex items-center gap-2">
                                <Clock size={20} className="text-gray-400" /> Recent Activity
                            </h3>
                            <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                                View All
                            </button>
                        </div>

                        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center text-gray-500">
                            <div className="flex flex-col items-center justify-center gap-4">
                                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center text-gray-600">
                                    <BarChart3 size={24} />
                                </div>
                                <p>No completed interviews yet.</p>
                                <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium">
                                    Complete your first session
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </main>
        </div>
    );
}

// Simple Helper for the icon arrow
const ArrowRightIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </svg>
);
