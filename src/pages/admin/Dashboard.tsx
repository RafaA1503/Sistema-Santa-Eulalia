import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Package, Users, Key } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  roles: number;
  modules: number;
  users: number;
  permissions: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({ roles: 0, modules: 0, users: 0, permissions: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const [rolesRes, modulesRes, permissionsRes] = await Promise.all([
        supabase.from('custom_roles').select('id', { count: 'exact', head: true }),
        supabase.from('modules').select('id', { count: 'exact', head: true }),
        supabase.from('role_permissions').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        roles: rolesRes.count || 0,
        modules: modulesRes.count || 0,
        users: 0,
        permissions: permissionsRes.count || 0,
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  const statCards = [
    { title: 'Roles', value: stats.roles, icon: Shield, color: 'bg-primary' },
    { title: 'Módulos', value: stats.modules, icon: Package, color: 'bg-success' },
    { title: 'Usuarios', value: stats.users, icon: Users, color: 'bg-warning' },
    { title: 'Permisos', value: stats.permissions, icon: Key, color: 'bg-secondary' },
  ];

  return (
    <AdminLayout title="Dashboard" subtitle="Vista general del sistema de roles">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-0 shadow-soft hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <stat.icon className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {loading ? '...' : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle>Bienvenido al Sistema de Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Desde aquí puedes gestionar los roles del sistema, crear nuevos roles personalizados, 
            definir módulos y asignar permisos específicos a cada rol. Utiliza el menú lateral 
            para navegar entre las diferentes secciones.
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/10">
              <Shield className="w-8 h-8 text-primary mb-2" />
              <h3 className="font-semibold mb-1">Gestionar Roles</h3>
              <p className="text-sm text-muted-foreground">Crea y edita roles personalizados</p>
            </div>
            <div className="p-4 rounded-lg bg-success/5 border border-success/10">
              <Package className="w-8 h-8 text-success mb-2" />
              <h3 className="font-semibold mb-1">Configurar Módulos</h3>
              <p className="text-sm text-muted-foreground">Define los módulos del sistema</p>
            </div>
            <div className="p-4 rounded-lg bg-warning/5 border border-warning/10">
              <Key className="w-8 h-8 text-warning mb-2" />
              <h3 className="font-semibold mb-1">Asignar Permisos</h3>
              <p className="text-sm text-muted-foreground">Controla el acceso a cada módulo</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default Dashboard;
