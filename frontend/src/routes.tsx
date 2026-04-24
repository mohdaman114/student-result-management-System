import { createBrowserRouter, Navigate } from 'react-router';
import { Login } from '@/pages/Login';
import { AdminLayout } from '@/layouts/AdminLayout';
import { AdminDashboard } from '@/pages/AdminDashboard';
import { AdminStudents } from '@/pages/AdminStudents';
import { AdminResults } from '@/pages/AdminResults';
import { Settings } from '@/pages/Settings';
import { StudentPanel } from '@/pages/StudentPanel';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Login />,
  },
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: 'students',
        element: <AdminStudents />,
      },
      {
        path: 'results',
        element: <AdminResults />,
      },
      {
        path: 'analytics',
        element: <AdminDashboard />,
      },
      {
        path: 'settings',
        element: <Settings />,
      },
    ],
  },
  {
    path: '/student',
    element: <StudentPanel />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
