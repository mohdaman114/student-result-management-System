import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Award, TrendingUp, BookOpen, LogOut, Loader2, User, Mail, Hash, School, Eye } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { ViewResultModal } from '@/components/common/ViewResultModal';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router';
import api from '@/utils/api';

interface Student {
  _id: string;
  name: string;
  email: string;
  rollNumber: string;
  class: string;
  section?: string;
}

interface Subject {
  subjectName: string;
  marks: number;
}

interface Result {
  _id: string;
  studentId: Student;
  examName: string;
  subjects: Subject[];
  totalMarks: number;
  percentage: number;
  grade: string;
  status: 'PASS' | 'FAIL';
  createdAt: string;
}

export function StudentPanel() {
  const [results, setResults] = useState<Result[]>([]);
  const [selectedResult, setSelectedResult] = useState<Result | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMyResults = async () => {
      try {
        const response = await api.get(`/results/student/${user?._id}`);
        setResults(response.data);
      } catch (error: any) {
        console.error('Error fetching results:', error);
        toast.error(error.response?.data?.message || 'Failed to fetch your results');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchMyResults();
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleViewResult = (result: Result) => {
    setSelectedResult(result);
    setShowResultModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
        <p className="text-lg text-gray-700 dark:text-gray-300 ml-3">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 transition-colors duration-500">
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Student Portal
            </h1>
            <p className="text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              Welcome back, <span className="text-purple-600 dark:text-purple-400 font-bold">{user?.name}</span>
            </p>
          </div>
          <div className="flex gap-3">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <LogOut className="w-5 h-5" />
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <GlassCard className="p-8 h-full">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 mb-4 shadow-lg shadow-purple-500/50">
                  <User className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-2xl text-gray-900 dark:text-white mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {user?.name}
                </h2>
                <span className="px-3 py-1 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-medium">
                  Student
                </span>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10">
                  <Mail className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Email</p>
                    <p className="text-gray-900 dark:text-white font-medium">{user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10">
                  <Hash className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Roll Number</p>
                    <p className="text-gray-900 dark:text-white font-medium">{user?.rollNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10">
                  <School className="w-5 h-5 text-green-600 dark:text-green-400" />
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Class</p>
                    <p className="text-gray-900 dark:text-white font-medium">{user?.class}</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>

          {/* Results List */}
          <div className="lg:col-span-2">
            <GlassCard className="p-8 h-full">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  My Examination Results
                </h2>
                <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                  <Award className="w-6 h-6" />
                </div>
              </div>

              {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <BookOpen className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" />
                  <h3 className="text-xl text-gray-700 dark:text-gray-300 mb-2">No results available yet</h3>
                  <p className="text-gray-500 dark:text-gray-500">Your results will appear here once published by the administration.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {results.map((result) => (
                    <motion.div
                      key={result._id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="p-6 rounded-2xl bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 hover:border-purple-500/50 transition-all group"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">
                            {result.examName}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {new Date(result.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          result.status === 'PASS' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' 
                            : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                        }`}>
                          {result.status}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mb-6">
                        <div className="text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Percentage</p>
                          <p className="text-xl font-bold text-purple-600 dark:text-purple-400">{result.percentage.toFixed(1)}%</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Grade</p>
                          <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{result.grade}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total</p>
                          <p className="text-xl font-bold text-green-600 dark:text-green-400">{result.totalMarks}</p>
                        </div>
                      </div>

                      <AnimatedButton 
                        onClick={() => handleViewResult(result)}
                        className="w-full text-sm"
                        variant="secondary"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Full Details
                      </AnimatedButton>
                    </motion.div>
                  ))}
                </div>
              )}
            </GlassCard>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <GlassCard hover className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Exams Taken</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{results.length}</p>
              </div>
            </div>
          </GlassCard>
          
          <GlassCard hover className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600">
                <Award className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Best Grade</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {results.length > 0 ? [...results].sort((a,b) => b.percentage - a.percentage)[0].grade : 'N/A'}
                </p>
              </div>
            </div>
          </GlassCard>

          <GlassCard hover className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-green-600 to-teal-600">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Avg. Percentage</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {results.length > 0 
                    ? (results.reduce((acc, r) => acc + r.percentage, 0) / results.length).toFixed(1) + '%' 
                    : 'N/A'}
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Result Modal */}
      {showResultModal && selectedResult && (
        <ViewResultModal
          student={selectedResult.studentId}
          result={selectedResult}
          onClose={() => setShowResultModal(false)}
        />
      )}
    </div>
  );
}