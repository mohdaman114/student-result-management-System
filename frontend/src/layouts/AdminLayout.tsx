import { Outlet } from 'react-router';
import { AdminSidebar } from '@/components/common/AdminSidebar';

export function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
}
