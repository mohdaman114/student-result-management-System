import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Users, FileText, TrendingUp, TrendingDown, Loader2, Trophy, Clock } from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import api from '@/utils/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  class: string;
}

interface Result {
  _id: string;
  studentId: Student;
  grade: string;
  status: 'PASS' | 'FAIL';
  percentage: number;
  examName: string;
  createdAt: string;
}

export function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [studentsRes, resultsRes] = await Promise.all([
          api.get('/students'),
          api.get('/results')
        ]);
        setStudents(studentsRes.data);
        setResults(resultsRes.data);
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const totalStudents = students.length;
  const totalResults = results.length;
  const passCount = results.filter(r => r.status === 'PASS').length;
  const failCount = results.filter(r => r.status === 'FAIL').length;
  const passPercentage = totalResults > 0 ? (passCount / totalResults) * 100 : 0;

  const stats = [
    { 
      label: 'Total Students', 
      value: totalStudents, 
      icon: Users, 
      color: 'from-blue-600 to-cyan-600',
      change: '+12%',
      trend: 'up'
    },
    { 
      label: 'Total Results', 
      value: totalResults, 
      icon: FileText, 
      color: 'from-purple-600 to-pink-600',
      change: '+8%',
      trend: 'up'
    },
    { 
      label: 'Pass Rate', 
      value: `${passPercentage.toFixed(1)}%`, 
      icon: TrendingUp, 
      color: 'from-green-600 to-teal-600',
      change: '+5%',
      trend: 'up'
    },
    { 
      label: 'Fail Rate', 
      value: `${(100 - passPercentage).toFixed(1)}%`, 
      icon: TrendingDown, 
      color: 'from-red-600 to-orange-600',
      change: '-3%',
      trend: 'down'
    },
  ];

  // Chart data
  const gradeDistribution = [
    { name: 'A+', value: results.filter(r => r.grade === 'A+').length },
    { name: 'A', value: results.filter(r => r.grade === 'A').length },
    { name: 'B', value: results.filter(r => r.grade === 'B').length },
    { name: 'C', value: results.filter(r => r.grade === 'C').length },
  ];

  const passFailData = [
    { name: 'Pass', value: passCount, fill: '#10b981' },
    { name: 'Fail', value: failCount, fill: '#ef4444' },
  ];

  const topStudents = [...results]
    .sort((a, b) => b.percentage - a.percentage)
    .slice(0, 5);

  const recentActivity = results
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)
    .map(r => ({
      action: `Result added for ${r.studentId?.name || 'N/A'}`,
      time: new Date(r.createdAt).toLocaleDateString(),
      icon: FileText
    }));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
        <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
        <p className="text-lg text-gray-700 dark:text-gray-300 ml-3">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 transition-colors duration-500">
      {/* Background animated circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-purple-400/20 to-transparent rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl text-gray-900 dark:text-white mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
              Welcome back! Here's your overview
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <GlassCard key={stat.label} hover className="p-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color} shadow-lg`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className={`flex items-center gap-1 text-sm ${stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {stat.trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span style={{ fontFamily: 'Inter, sans-serif' }}>{stat.change}</span>
                  </div>
                </div>
                <h3 className="text-3xl text-gray-900 dark:text-white mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {stat.value}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
                  {stat.label}
                </p>
              </motion.div>
            </GlassCard>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Grade Distribution */}
          <GlassCard className="p-6">
            <h2 className="text-xl text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Grade Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                <XAxis dataKey="name" stroke="#9ca3af" style={{ fontFamily: 'Inter, sans-serif' }} />
                <YAxis stroke="#9ca3af" style={{ fontFamily: 'Inter, sans-serif' }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    fontFamily: 'Inter, sans-serif'
                  }} 
                />
                <Legend wrapperStyle={{ fontFamily: 'Inter, sans-serif' }} />
                <Bar dataKey="value" fill="url(#colorGradient)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          {/* Pass/Fail Ratio */}
          <GlassCard className="p-6">
            <h2 className="text-xl text-gray-900 dark:text-white mb-4" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Pass/Fail Ratio
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={passFailData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {passFailData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    fontFamily: 'Inter, sans-serif'
                  }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </GlassCard>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Students */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Trophy className="w-6 h-6 text-yellow-500" />
              <h2 className="text-xl text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Top Performers
              </h2>
            </div>
            <div className="space-y-4">
              {topStudents.map((item, index) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center text-white
                    ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600' : 
                      index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-600' : 
                      'bg-gradient-to-br from-orange-400 to-orange-600'}
                  `}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-gray-900 dark:text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {item.studentId?.name || 'N/A'}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {item.studentId?.rollNumber || 'N/A'} • {item.studentId?.class || 'N/A'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {item.percentage.toFixed(1)}%
                    </p>
                    <p className="text-sm text-purple-600 dark:text-purple-400" style={{ fontFamily: 'Inter, sans-serif' }}>
                      Grade {item.grade}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>

          {/* Recent Activity */}
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl text-gray-900 dark:text-white" style={{ fontFamily: 'Poppins, sans-serif' }}>
                Recent Activity
              </h2>
            </div>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-600 to-blue-600">
                    <activity.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-900 dark:text-white" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                      {activity.time}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
