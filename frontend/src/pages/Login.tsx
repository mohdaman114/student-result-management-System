import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { Mail, Lock, UserCircle, GraduationCap, Shield } from 'lucide-react';
import { FloatingInput } from '@/components/ui/FloatingInput';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { GlassCard } from '@/components/ui/GlassCard';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState<'admin' | 'student'>('student');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    rollNumber: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { login, signup, user } = useAuth(); // Get user from auth context

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!isLogin) {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
      if (role === 'student' && !formData.rollNumber) {
        newErrors.rollNumber = 'Roll number is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    let loggedInUser = null;
    if (isLogin) {
      loggedInUser = await login(formData.email, formData.password);
    } else {
      loggedInUser = await signup(formData.name, formData.email, formData.password, role, formData.rollNumber);
    }

    if (loggedInUser) {
      navigate(loggedInUser.role === 'admin' ? '/admin' : '/student');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 transition-colors duration-500 flex items-center justify-center p-4">
      {/* Background animated circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-blue-400/20 to-transparent rounded-full blur-3xl"
        />
      </div>

      <div className="absolute top-6 right-6 z-50">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <GlassCard className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-600 to-blue-600 mb-4 shadow-lg shadow-purple-500/50"
            >
              <GraduationCap className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl mb-2 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent" style={{ fontFamily: 'Poppins, sans-serif' }}>
              SRMS Portal
            </h1>
            <p className="text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </p>
          </div>

          {/* Role Selection */}
          <div className="flex gap-3 mb-6">
            <button
              type="button"
              onClick={() => setRole('student')}
              className={`
                flex-1 p-3 rounded-xl transition-all duration-300
                ${role === 'student' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50' 
                  : 'bg-white/10 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-white/20 dark:hover:bg-white/10'
                }
              `}
            >
              <UserCircle className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>Student</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className={`
                flex-1 p-3 rounded-xl transition-all duration-300
                ${role === 'admin' 
                  ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg shadow-purple-500/50' 
                  : 'bg-white/10 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-white/20 dark:hover:bg-white/10'
                }
              `}
            >
              <Shield className="w-5 h-5 mx-auto mb-1" />
              <span className="text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>Admin</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <FloatingInput
                label="Full Name"
                value={formData.name}
                onChange={(value) => setFormData({ ...formData, name: value })}
                error={errors.name}
                icon={UserCircle}
                required
              />
            )}

            <FloatingInput
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={(value) => setFormData({ ...formData, email: value })}
              error={errors.email}
              icon={Mail}
              required
            />

            <FloatingInput
              label="Password"
              type="password"
              value={formData.password}
              onChange={(value) => setFormData({ ...formData, password: value })}
              error={errors.password}
              icon={Lock}
              required
            />

            {!isLogin && role === 'student' && (
              <FloatingInput
                label="Roll Number"
                value={formData.rollNumber}
                onChange={(value) => setFormData({ ...formData, rollNumber: value })}
                error={errors.rollNumber}
                icon={GraduationCap}
                required
              />
            )}

            <AnimatedButton type="submit" className="w-full mt-6">
              {isLogin ? 'Sign In' : 'Create Account'}
            </AnimatedButton>
          </form>

          {/* Toggle */}
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}