import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, Edit, Trash2, Mail, Phone, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { toast } from 'sonner';
import { AddStudentModal } from '@/components/common/AddStudentModal';
import api from '@/utils/api'; // Import the API utility
import { useAuth } from '@/context/AuthContext'; // Import useAuth

interface Student {
  _id: string;
  name: string;
  email: string;
  rollNumber: string;
  class: string;
  section?: string; // Assuming section might be part of the student data
}

export function AdminStudents() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth(); // Get user from auth context

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/students');
      setStudents(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch students');
      toast.error(err.response?.data?.message || 'Failed to fetch students');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchStudents();
    } else {
      setError('You are not authorized to view this page.');
      setLoading(false);
    }
  }, [user, fetchStudents]);

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await api.delete(`/students/${id}`);
        toast.success('Student deleted successfully!');
        fetchStudents(); // Refetch students after deletion
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to delete student');
      }
    }
  };

  const handleEdit = (student: Student) => {
    setStudentToEdit(student);
    setShowAddModal(true);
  };

  const handleCloseModal = () => {
    setShowAddModal(false);
    setStudentToEdit(null);
    fetchStudents(); // Refetch students after add/edit
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
        <p className="text-lg text-gray-700 dark:text-gray-300 ml-3">Loading students...</p>
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Students Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              Manage student records and information
            </p>
          </div>
          <div className="flex gap-3">
            <ThemeToggle />
            <AnimatedButton onClick={() => setShowAddModal(true)}>
              <Plus className="w-5 h-5 mr-2 inline" />
              Add Student
            </AnimatedButton>
          </div>
        </div>

        <GlassCard className="p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-purple-500"
              style={{ fontFamily: 'Inter, sans-serif' }}
            />
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student, index) => (
              <GlassCard key={student._id} hover className="p-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white text-lg" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {student.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="text-lg text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                          {student.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                          {student.rollNumber}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="w-4 h-4" />
                      <span style={{ fontFamily: 'Inter, sans-serif' }}>{student.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span style={{ fontFamily: 'Inter, sans-serif' }}>
                        Class: {student.class} {student.section && `- ${student.section}`}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(student)}
                      className="flex-1 px-3 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors text-sm"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      <Edit className="w-4 h-4 inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(student._id, student.name)}
                      className="flex-1 px-3 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      <Trash2 className="w-4 h-4 inline mr-1" />
                      Delete
                    </button>
                  </div>
                </motion.div>
              </GlassCard>
            ))
          ) : (
            <GlassCard className="p-12 col-span-full">
              <div className="text-center">
                <p className="text-gray-500 dark:text-gray-400 text-lg" style={{ fontFamily: 'Inter, sans-serif' }}>
                  No students found
                </p>
              </div>
            </GlassCard>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddStudentModal 
          onClose={handleCloseModal} 
          onSuccess={fetchStudents}
          studentToEdit={studentToEdit}
        />
      )}
    </div>
  );
}
