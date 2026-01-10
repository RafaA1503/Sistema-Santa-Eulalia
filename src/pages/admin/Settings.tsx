import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings as SettingsIcon, Shield, Database, Bell } from 'lucide-react';

const Settings = () => {
  return (
    <AdminLayout title="Configuración" subtitle="Ajustes generales del sistema">
      <div className="grid gap-6">
        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="w-5 h-5" />
              Configuración General
            </CardTitle>
            <CardDescription>
              Gestiona los ajustes generales del sistema de roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <Shield className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-1">Seguridad</h3>
                <p className="text-sm text-muted-foreground">
                  Configuración de políticas de seguridad y acceso
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <Database className="w-8 h-8 text-success mb-3" />
                <h3 className="font-semibold mb-1">Base de datos</h3>
                <p className="text-sm text-muted-foreground">
                  Estado y mantenimiento de la base de datos
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-card hover:shadow-md transition-shadow">
                <Bell className="w-8 h-8 text-warning mb-3" />
                <h3 className="font-semibold mb-1">Notificaciones</h3>
                <p className="text-sm text-muted-foreground">
                  Preferencias de notificaciones del sistema
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-soft">
          <CardHeader>
            <CardTitle>Acerca del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Versión</span>
                <span className="font-medium">1.0.0</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-muted-foreground">Sistema</span>
                <span className="font-medium">RoleAdmin</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Estado</span>
                <span className="text-success font-medium">Activo</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default Settings;
