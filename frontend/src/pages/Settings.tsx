import { useState } from 'react';
import { motion } from 'motion/react';
import { Lock, User, Mail, Shield, Loader2, Check } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { AnimatedButton } from '@/components/ui/AnimatedButton';
import { FloatingInput } from '@/components/ui/FloatingInput';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { toast } from 'sonner';
import api from '@/utils/api';
import { useAuth } from '@/context/AuthContext';

export function Settings() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('password');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(false);
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      toast.success('Password changed successfully!');
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 transition-colors duration-500">
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              Manage your account settings and preferences
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab('password')}
            className={`px-6 py-3 rounded-xl transition-all ${
              activeTab === 'password'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white/10 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-white/20'
            }`}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <Lock className="w-5 h-5 inline mr-2" />
            Change Password
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-6 py-3 rounded-xl transition-all ${
              activeTab === 'profile'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                : 'bg-white/10 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-white/20'
            }`}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            <User className="w-5 h-5 inline mr-2" />
            Profile Info
          </button>
        </div>

        {/* Password Change Form */}
        {activeTab === 'password' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <GlassCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Change Password
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Update your password to keep your account secure
                  </p>
                </div>
              </div>

              <form onSubmit={handlePasswordChange} className="space-y-6">
                <FloatingInput
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={setCurrentPassword}
                  icon={Lock}
                  required
                />

                <FloatingInput
                  label="New Password"
                  type="password"
                  value={newPassword}
                  onChange={setNewPassword}
                  icon={Lock}
                  required
                />

                <FloatingInput
                  label="Confirm New Password"
                  type="password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  icon={Lock}
                  required
                />

                {success && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-2 p-4 rounded-xl bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800"
                  >
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-green-700 dark:text-green-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Password changed successfully!
                    </span>
                  </motion.div>
                )}

                <AnimatedButton type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Changing Password...
                    </>
                  ) : (
                    <>
                      <Lock className="w-5 h-5 mr-2" />
                      Change Password
                    </>
                  )}
                </AnimatedButton>
              </form>

              <div className="mt-6 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50">
                <p className="text-sm text-blue-800 dark:text-blue-300" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <strong>Password Requirements:</strong>
                </p>
                <ul className="mt-2 space-y-1 text-xs text-blue-700 dark:text-blue-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                  <li>• At least 6 characters long</li>
                  <li>• Use a mix of letters and numbers</li>
                  <li>• Include special characters for stronger security</li>
                </ul>
              </div>
            </GlassCard>
          </motion.div>
        )}

        {/* Profile Info */}
        {activeTab === 'profile' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl"
          >
            <GlassCard className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-blue-600 shadow-lg">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                    Profile Information
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Your account details
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Name
                      </p>
                      <p className="text-lg text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {user?.name || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Email
                      </p>
                      <p className="text-lg text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {user?.email || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-white/10 dark:bg-white/5 border border-white/20 dark:border-white/10">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                        Role
                      </p>
                      <p className="text-lg text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                        {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </div>
    </div>
  );
}