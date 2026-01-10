import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, Loader2, Save, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Module {
  id: string;
  name: string;
  description: string | null;
  icon: string;
}

interface Permission {
  module_id: string;
  can_view: boolean;
  can_create: boolean;
  can_edit: boolean;
  can_delete: boolean;
}

interface CustomRole {
  id: string;
  name: string;
  color: string;
}

const RolePermissions = () => {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState<CustomRole | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [permissions, setPermissions] = useState<Map<string, Permission>>(new Map());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Fetch role
      const { data: roleData } = await supabase
        .from('custom_roles')
        .select('id, name, color')
        .eq('id', roleId)
        .single();

      if (!roleData) {
        navigate('/admin/roles');
        return;
      }
      setRole(roleData);

      // Fetch modules
      const { data: modulesData } = await supabase
        .from('modules')
        .select('*')
        .eq('is_active', true)
        .order('name');
      setModules(modulesData || []);

      // Fetch existing permissions
      const { data: permissionsData } = await supabase
        .from('role_permissions')
        .select('*')
        .eq('role_id', roleId);

      const permMap = new Map<string, Permission>();
      (permissionsData || []).forEach((p) => {
        permMap.set(p.module_id, {
          module_id: p.module_id,
          can_view: p.can_view,
          can_create: p.can_create,
          can_edit: p.can_edit,
          can_delete: p.can_delete,
        });
      });

      // Initialize permissions for all modules
      (modulesData || []).forEach((m) => {
        if (!permMap.has(m.id)) {
          permMap.set(m.id, {
            module_id: m.id,
            can_view: false,
            can_create: false,
            can_edit: false,
            can_delete: false,
          });
        }
      });

      setPermissions(permMap);
      setLoading(false);
    };

    if (roleId) {
      fetchData();
    }
  }, [roleId, navigate]);

  const togglePermission = (moduleId: string, permType: keyof Omit<Permission, 'module_id'>) => {
    setPermissions((prev) => {
      const newMap = new Map(prev);
      const current = newMap.get(moduleId);
      if (current) {
        newMap.set(moduleId, { ...current, [permType]: !current[permType] });
      }
      return newMap;
    });
  };

  const toggleAllForModule = (moduleId: string, value: boolean) => {
    setPermissions((prev) => {
      const newMap = new Map(prev);
      newMap.set(moduleId, {
        module_id: moduleId,
        can_view: value,
        can_create: value,
        can_edit: value,
        can_delete: value,
      });
      return newMap;
    });
  };

  const handleSave = async () => {
    if (!roleId) return;
    setSaving(true);

    // Delete existing permissions
    await supabase.from('role_permissions').delete().eq('role_id', roleId);

    // Insert new permissions
    const permissionsToInsert = Array.from(permissions.values())
      .filter((p) => p.can_view || p.can_create || p.can_edit || p.can_delete)
      .map((p) => ({
        role_id: roleId,
        module_id: p.module_id,
        can_view: p.can_view,
        can_create: p.can_create,
        can_edit: p.can_edit,
        can_delete: p.can_delete,
      }));

    if (permissionsToInsert.length > 0) {
      const { error } = await supabase.from('role_permissions').insert(permissionsToInsert);

      if (error) {
        toast.error('Error al guardar permisos');
        setSaving(false);
        return;
      }
    }

    toast.success('Permisos guardados');
    setSaving(false);
  };

  if (loading) {
    return (
      <AdminLayout title="Cargando..." subtitle="">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title={`Permisos: ${role?.name}`}
      subtitle="Configura los permisos de acceso a cada módulo"
    >
      <div className="mb-6 flex items-center justify-between">
        <Button variant="outline" onClick={() => navigate('/admin/roles')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a roles
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Guardar permisos
        </Button>
      </div>

      <Card className="border-0 shadow-soft">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full" style={{ backgroundColor: role?.color }} />
            <div>
              <CardTitle>Matriz de Permisos</CardTitle>
              <CardDescription>
                Selecciona los permisos que tendrá este rol en cada módulo
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Módulo</th>
                  <th className="text-center py-3 px-4 font-medium">Ver</th>
                  <th className="text-center py-3 px-4 font-medium">Crear</th>
                  <th className="text-center py-3 px-4 font-medium">Editar</th>
                  <th className="text-center py-3 px-4 font-medium">Eliminar</th>
                  <th className="text-center py-3 px-4 font-medium">Todos</th>
                </tr>
              </thead>
              <tbody>
                {modules.map((module) => {
                  const perm = permissions.get(module.id);
                  const allChecked = perm?.can_view && perm?.can_create && perm?.can_edit && perm?.can_delete;

                  return (
                    <tr key={module.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <Shield className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{module.name}</p>
                            <p className="text-sm text-muted-foreground">{module.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-4 px-4">
                        <Checkbox
                          checked={perm?.can_view || false}
                          onCheckedChange={() => togglePermission(module.id, 'can_view')}
                        />
                      </td>
                      <td className="text-center py-4 px-4">
                        <Checkbox
                          checked={perm?.can_create || false}
                          onCheckedChange={() => togglePermission(module.id, 'can_create')}
                        />
                      </td>
                      <td className="text-center py-4 px-4">
                        <Checkbox
                          checked={perm?.can_edit || false}
                          onCheckedChange={() => togglePermission(module.id, 'can_edit')}
                        />
                      </td>
                      <td className="text-center py-4 px-4">
                        <Checkbox
                          checked={perm?.can_delete || false}
                          onCheckedChange={() => togglePermission(module.id, 'can_delete')}
                        />
                      </td>
                      <td className="text-center py-4 px-4">
                        <Checkbox
                          checked={allChecked || false}
                          onCheckedChange={(checked) => toggleAllForModule(module.id, !!checked)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default RolePermissions;
