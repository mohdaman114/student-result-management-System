import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Edit, Trash2, Download, Eye, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { toast } from 'sonner';
import { AddResultModal } from '@/components/common/AddResultModal';
import { ViewResultModal } from '@/components/common/ViewResultModal';
import api from '@/utils/api'; // Import the API utility
import { useAuth } from '@/context/AuthContext'; // Import useAuth

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
  studentId: Student; // Populated student object
  examName: string;
  subjects: Subject[];
  totalMarks: number;
  percentage: number;
  grade: string;
  status: 'PASS' | 'FAIL';
  createdAt: string;
}

export function AdminResults() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [resultToEdit, setResultToEdit] = useState<Result | null>(null); // For editing results
  const [selectedResult, setSelectedResult] = useState<Result | null>(null); // For viewing results
  const [showViewModal, setShowViewModal] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth(); // Get user from auth context

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/results');
      setResults(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch results');
      toast.error(err.response?.data?.message || 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchResults();
    } else {
      setError('You are not authorized to view this page.');
      setLoading(false);
    }
  }, [user, fetchResults]);

  const filteredResults = results.filter(item =>
    item.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.studentId?.rollNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.examName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string, studentName: string) => {
    if (window.confirm(`Are you sure you want to delete result for ${studentName}?`)) {
      try {
        await api.delete(`/results/${id}`);
        toast.success('Result deleted successfully!');
        fetchResults(); // Refetch results after deletion
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to delete result');
      }
    }
  };

  const handleEdit = (result: Result) => {
    setResultToEdit(result);
    setShowAddModal(true);
  };

  const handleView = (result: Result) => {
    setSelectedResult(result);
    setShowViewModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setResultToEdit(null);
    fetchResults(); // Refetch results after add/edit
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setSelectedResult(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
        <p className="text-lg text-gray-700 dark:text-gray-300 ml-3">Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
        <p className="text-lg text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 transition-colors duration-500">
      <div className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Results Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              Manage and view student examination results
            </p>
          </div>
          <div className="flex gap-3">
            <ThemeToggle />
            <AnimatedButton onClick={() => setShowAddModal(true)}>
              <Plus className="w-5 h-5 mr-2 inline" />
              Add Result
            </AnimatedButton>
          </div>
        </div>

        {/* Search Bar */}
        <GlassCard className="p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, roll number, or exam..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-purple-500"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>
        </GlassCard>

        {/* Results Table */}
        <GlassCard className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/20 dark:border-white/10">
                  <th className="text-left py-4 px-4 text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Student
                  </th>
                  <th className="text-left py-4 px-4 text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Roll No.
                  </th>
                  <th className="text-left py-4 px-4 text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Exam
                  </th>
                  <th className="text-left py-4 px-4 text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Percentage
                  </th>
                  <th className="text-left py-4 px-4 text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Grade
                  </th>
                  <th className="text-left py-4 px-4 text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Status
                  </th>
                  <th className="text-right py-4 px-4 text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.length > 0 ? (
                  filteredResults.map((item, index) => (
                    <motion.tr
                      key={item._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-white/10 dark:border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-gray-900 dark:text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {item.studentId?.name || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {item.studentId?.class || 'N/A'} {item.studentId?.section && `- ${item.studentId.section}`}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-900 dark:text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {item.studentId?.rollNumber || 'N/A'}
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <p className="text-gray-900 dark:text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {item.examName}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${item.percentage}%` }}
                              transition={{ duration: 1, delay: index * 0.05 }}
                              className={`h-full ${
                                item.percentage >= 80 ? 'bg-gradient-to-r from-green-500 to-teal-500' :
                                item.percentage >= 60 ? 'bg-gradient-to-r from-blue-500 to-cyan-500' :
                                item.percentage >= 40 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                                'bg-gradient-to-r from-red-500 to-pink-500'
                              }`}
                            />
                          </div>
                          <span className="text-gray-900 dark:text-white min-w-[50px]" style={{ fontFamily: 'Inter, sans-serif' }}>
                            {item.percentage.toFixed(2)}%
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`
                          px-3 py-1 rounded-lg text-sm
                          ${item.grade === 'A+' || item.grade === 'A' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                            item.grade === 'B' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                            item.grade === 'C' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                            'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}
                        `} style={{ fontFamily: 'Inter, sans-serif' }}>
                          {item.grade}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`
                          px-3 py-1 rounded-lg text-sm
                          ${item.status === 'PASS' 
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                            : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'}
                        `} style={{ fontFamily: 'Inter, sans-serif' }}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleView(item)}
                            className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item._id, item.studentId?.name || 'Unknown Student')}
                            className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr className="col-span-full">
                    <td colSpan={7} className="text-center py-12">
                      <p className="text-gray-500 dark:text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                        No results found
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddResultModal 
          onClose={handleCloseAddModal} 
          onSuccess={fetchResults}
          resultToEdit={resultToEdit}
        />
      )}
      {showViewModal && selectedResult && (
        <ViewResultModal 
          student={selectedResult.studentId} 
          result={selectedResult} 
          onClose={handleCloseViewModal} 
        />
      )}
    </div>
  );
}
