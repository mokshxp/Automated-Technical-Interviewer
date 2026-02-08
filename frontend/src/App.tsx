import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Registration from './pages/Registration';
import Quiz from './pages/Quiz';
import InterviewSession from './pages/InterviewSession';
import Results from './pages/Results';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Terms from './pages/Terms';
import Dashboard from './pages/Dashboard';
import ResumeManager from './pages/ResumeManager';
import LearningChat from './pages/LearningChat';
import Pricing from './pages/Pricing';

// Protected Route Component
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <div className="p-10 text-center">Loading...</div>;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/pricing" element={<Pricing />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/resumes" element={<ResumeManager />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/quiz/:candidateId" element={<Quiz />} />
            <Route path="/interview/:sessionId" element={<InterviewSession />} />
            <Route path="/results/:sessionId" element={<Results />} />
            <Route path="/learning" element={<LearningChat />} />
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
