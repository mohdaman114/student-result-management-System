import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { FloatingInput } from '@/components/ui/FloatingInput';
import { toast } from 'sonner';
import api from '@/utils/api'; // Import the API utility

interface Student {
  _id?: string;
  name: string;
  rollNumber: string;
  email: string;
  password?: string; // Add password field
  class: string;
  section?: string;
}

interface AddStudentModalProps {
  onClose: () => void;
  onSuccess: () => void;
  studentToEdit?: Student | null;
}

export function AddStudentModal({ onClose, onSuccess, studentToEdit }: AddStudentModalProps) {
  const [formData, setFormData] = useState<Student>({
    name: '',
    rollNumber: '',
    email: '',
    password: '',
    class: '',
    section: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (studentToEdit) {
      setFormData({
        name: studentToEdit.name,
        rollNumber: studentToEdit.rollNumber,
        email: studentToEdit.email,
        password: '', // Don't prefill password for editing
        class: studentToEdit.class,
        section: studentToEdit.section || '',
      });
    } else {
      setFormData({
        name: '',
        rollNumber: '',
        email: '',
        password: '',
        class: '',
        section: '',
      });
    }
  }, [studentToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!formData.name || !formData.rollNumber || !formData.email || !formData.class) {
      toast.error('Please fill all required fields');
      setLoading(false);
      return;
    }

    try {
      if (studentToEdit && studentToEdit._id) {
        await api.put(`/students/${studentToEdit._id}`, formData);
        toast.success('Student updated successfully!');
      } else {
        const response = await api.post('/students', formData);
        toast.success('Student added successfully! Password: ' + (response.data.generatedPassword || 'Use roll number as password'));
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-xl"
      >
        <GlassCard className="p-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {studentToEdit ? 'Edit Student' : 'Add New Student'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
            >
              <X className="w-6 h-6 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <FloatingInput
                label="Full Name *"
                value={formData.name}
                onChange={(val) => handleValueChange('name', val)}
                required
              />
              <FloatingInput
                label="Roll Number *"
                value={formData.rollNumber}
                onChange={(val) => handleValueChange('rollNumber', val)}
                required
              />
              <FloatingInput
                label="Email Address *"
                type="email"
                value={formData.email}
                onChange={(val) => handleValueChange('email', val)}
                required
              />
              {!studentToEdit && (
                <FloatingInput
                  label="Password"
                  type="password"
                  value={formData.password || ''}
                  onChange={(val) => handleValueChange('password', val)}
                />
              )}
              <div className="grid grid-cols-2 gap-4">
                <FloatingInput
                  label="Class *"
                  value={formData.class}
                  onChange={(val) => handleValueChange('class', val)}
                  required
                />
                <FloatingInput
                  label="Section"
                  value={formData.section || ''}
                  onChange={(val) => handleValueChange('section', val)}
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <AnimatedButton type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Processing...' : (studentToEdit ? 'Update Student' : 'Add Student')}
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
