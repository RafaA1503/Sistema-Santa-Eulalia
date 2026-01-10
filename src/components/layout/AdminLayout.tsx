import { ReactNode } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export const AdminLayout = ({ children, title, subtitle }: AdminLayoutProps) => {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/unauthorized" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="ml-16 lg:ml-64 min-h-screen transition-all duration-300">
        <div className="p-6 lg:p-8">
          <header className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground mt-1">{subtitle}</p>
            )}
          </header>
          <div className="animate-fade-in">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};
