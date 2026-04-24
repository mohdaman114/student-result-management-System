import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X, Plus, Trash2, Loader2 } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { FloatingInput } from '@/components/ui/FloatingInput';
import { toast } from 'sonner';
import api from '@/utils/api';

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  class: string;
}

interface Subject {
  subjectName: string;
  marks: number;
}

interface Result {
  _id?: string; // Optional for new results
  studentId: string | Student; // Can be student ID or populated object
  examName: string;
  subjects: Subject[];
}

interface AddResultModalProps {
  onClose: () => void;
  onSuccess: () => void;
  resultToEdit?: any; // Use any to avoid complex type conflicts between populated and non-populated results
}

export function AddResultModal({ onClose, onSuccess, resultToEdit }: AddResultModalProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [errorStudents, setErrorStudents] = useState<string | null>(null);

  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [examName, setExamName] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([
    { subjectName: '', marks: 0 }
  ]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await api.get('/students');
        setStudents(response.data);
      } catch (err: any) {
        setErrorStudents(err.response?.data?.message || 'Failed to fetch students');
        toast.error(err.response?.data?.message || 'Failed to fetch students');
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, []);

  useEffect(() => {
    if (resultToEdit) {
      // Handle both populated and non-populated student field
      const studentId = typeof resultToEdit.studentId === 'string' 
        ? resultToEdit.studentId 
        : resultToEdit.studentId?._id || '';
      
      setSelectedStudentId(studentId);
      setExamName(resultToEdit.examName);
      setSubjects(resultToEdit.subjects);
    } else {
      setSelectedStudentId('');
      setExamName('');
      setSubjects([{ subjectName: '', marks: 0 }]);
    }
  }, [resultToEdit]);

  const addSubject = () => {
    setSubjects([...subjects, { subjectName: '', marks: 0 }]);
  };

  const removeSubject = (index: number) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const updateSubject = (index: number, field: keyof Subject, value: string | number) => {
    const updated = [...subjects];
    updated[index] = { ...updated[index], [field]: value };
    setSubjects(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!selectedStudentId || !examName || subjects.length === 0 || subjects.some(s => !s.subjectName || s.marks === undefined || s.marks < 0)) {
      toast.error('Please fill all required fields and ensure marks are valid');
      setLoading(false);
      return;
    }

    try {
      const resultData = {
        studentId: selectedStudentId,
        examName,
        subjects,
      };

      if (resultToEdit && resultToEdit._id) {
        await api.put(`/results/${resultToEdit._id}`, resultData);
        toast.success('Result updated successfully!');
      } else {
        await api.post('/results', resultData);
        toast.success('Result added successfully!');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  if (loadingStudents) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
        <p className="text-lg text-gray-700 dark:text-gray-300 ml-3">Loading students...</p>
      </div>
    );
  }

  if (errorStudents) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <p className="text-lg text-red-600 dark:text-red-400">{errorStudents}</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-3xl max-h-[90vh] overflow-auto"
      >
        <GlassCard className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {resultToEdit ? 'Edit Result' : 'Add New Result'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Selection */}
            <div>
              <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2" style={{ fontFamily: 'Inter, sans-serif' }}>
                Select Student *
              </label>
              <select
                value={selectedStudentId}
                onChange={(e) => setSelectedStudentId(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:border-purple-500"
                style={{ fontFamily: 'Inter, sans-serif' }}
                disabled={!!resultToEdit} // Disable student selection when editing
              >
                <option value="">Choose a student...</option>
                {students.map(student => (
                  <option key={student._id} value={student._id}>
                    {student.name} ({student.rollNumber})
                  </option>
                ))}
              </select>
            </div>

            {/* Exam Details */}
            <FloatingInput
              label="Exam Name *"
              type="text"
              value={examName}
              onChange={(val) => setExamName(val)}
              required
            />

            {/* Subjects */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <label className="text-sm text-gray-700 dark:text-gray-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Subjects & Marks *
                </label>
                <button
                  type="button"
                  onClick={addSubject}
                  className="flex items-center gap-2 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  <Plus className="w-4 h-4" />
                  Add Subject
                </button>
              </div>

              <div className="space-y-3">
                {subjects.map((subject, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <input
                      type="text"
                      placeholder="Subject name"
                      value={subject.subjectName}
                      onChange={(e) => updateSubject(index, 'subjectName', e.target.value)}
                      required
                      className="flex-1 px-4 py-2.5 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                    <input
                      type="number"
                      placeholder="Marks"
                      value={subject.marks}
                      onChange={(e) => updateSubject(index, 'marks', Number(e.target.value))}
                      required
                      min="0"
                      max="100" // Assuming max marks is 100 for each subject
                      className="w-28 px-4 py-2.5 bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    />
                    {subjects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSubject(index)}
                        className="p-2.5 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <AnimatedButton type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Processing...' : (resultToEdit ? 'Update Result' : 'Add Result')}
              </AnimatedButton>
              <AnimatedButton type="button" variant="secondary" onClick={onClose} className="flex-1" disabled={loading}>
                Cancel
              </AnimatedButton>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );
}
