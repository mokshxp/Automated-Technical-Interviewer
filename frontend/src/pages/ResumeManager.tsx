import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Upload, FileText, Trash2, Loader } from 'lucide-react';

interface Resume {
    id: number;
    name: string;
    email: string;
    resume_url: string;
    created_at: string;
}

export default function ResumeManager() {
    const [resumes, setResumes] = useState<Resume[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchResumes();
    }, []);

    const fetchResumes = async () => {
        try {
            const response = await axios.get('http://localhost:8000/candidates/');
            setResumes(response.data);
        } catch (error) {
            console.error("Failed to fetch resumes", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file || !name) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('name', name);
        formData.append('email', email); // Still required by backend model for now

        try {
            await axios.post('http://localhost:8000/candidates/register', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFile(null);
            setName('');
            setEmail('');
            fetchResumes();
        } catch (error) {
            console.error("Upload failed", error);
            alert("Upload failed. Please check the file type (PDF only).");
        } finally {
            setUploading(false);
        }
    };

    const startInterview = (candidateId: number) => {
        // Navigate to interview setup or directly to quiz
        // For now, mapping old flow: Quiz -> Interview
        navigate(`/quiz/${candidateId}`);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FileText className="text-indigo-600" /> Resume Manager
                </h1>

                {/* Upload Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
                    <h2 className="text-lg font-semibold text-gray-700 mb-4">Upload New Resume</h2>
                    <form onSubmit={handleUpload} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Profile Name (e.g., "Frontend Dev")</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                placeholder="Frontend Profile"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email (for reference)</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                                placeholder="resume@example.com"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Resume (PDF)</label>
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    accept=".pdf"
                                    onChange={handleFileChange}
                                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                                    required
                                />
                                <button
                                    type="submit"
                                    disabled={uploading}
                                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-2 font-medium"
                                >
                                    {uploading ? <Loader className="animate-spin" size={18} /> : <Upload size={18} />}
                                    {uploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Resumes List */}
                <h2 className="text-lg font-semibold text-gray-700 mb-4">Your Resumes</h2>
                {loading ? (
                    <div className="text-center py-10 text-gray-500">Loading...</div>
                ) : resumes.length === 0 ? (
                    <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500">
                        No resumes found. Upload one to get started!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {resumes.map((resume) => (
                            <div key={resume.id} className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:border-indigo-300 transition relative group">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-bold text-gray-800">{resume.name}</h3>
                                        <p className="text-xs text-gray-500">{new Date(resume.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-full">
                                        <FileText size={20} />
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                    {resume.email}
                                </p>

                                <div className="flex gap-2 mt-2">
                                    <button
                                        onClick={() => startInterview(resume.id)}
                                        className="flex-1 bg-indigo-600 text-white py-2 rounded text-sm font-medium hover:bg-indigo-700 transition"
                                    >
                                        Start Interview
                                    </button>
                                    <button className="p-2 text-red-500 hover:bg-red-50 rounded transition" title="Delete Resume">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
