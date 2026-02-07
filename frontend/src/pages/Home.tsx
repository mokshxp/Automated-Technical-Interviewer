import { Link } from 'react-router-dom';

export default function Home() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <h1 className="text-5xl font-bold mb-4 animate-bounce">Mock Interview Platform</h1>
            <p className="text-xl opacity-90 mb-8">Ready for your interview?</p>
            <div className="flex gap-4">
                <Link to="/login" className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                    Login
                </Link>
                <Link to="/signup" className="px-6 py-3 bg-transparent border-2 border-white text-white font-bold rounded-full shadow-lg hover:bg-white/10 transition-colors">
                    Sign Up
                </Link>
            </div>
        </div>
    );
}
