import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users as UsersIcon, Loader2, User, Shield, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
}

interface CustomRole {
  id: string;
  name: string;
  color: string;
}

interface UserCustomRole {
  user_id: string;
  custom_role_id: string;
}

const Users = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<Map<string, string>>(new Map());
  const [customRoles, setCustomRoles] = useState<CustomRole[]>([]);
  const [userCustomRoles, setUserCustomRoles] = useState<Map<string, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [saving, setSaving] = useState(false);

  const fetchData = async () => {
    // Fetch profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (profilesError) {
      toast.error('Error al cargar usuarios');
    } else {
      setProfiles(profilesData || []);
    }

    // Fetch user roles (admin/user)
    const { data: rolesData } = await supabase
      .from('user_roles')
      .select('user_id, role');

    const rolesMap = new Map<string, string>();
    (rolesData || []).forEach((r: { user_id: string; role: string }) => {
      rolesMap.set(r.user_id, r.role);
    });
    setUserRoles(rolesMap);

    // Fetch custom roles
    const { data: customRolesData } = await supabase
      .from('custom_roles')
      .select('id, name, color')
      .eq('is_active', true)
      .order('name');
    
    setCustomRoles(customRolesData || []);

    // Fetch user custom role assignments
    const { data: userCustomRolesData } = await supabase
      .from('user_custom_roles')
      .select('user_id, custom_role_id');

    const userCustomRolesMap = new Map<string, string>();
    (userCustomRolesData || []).forEach((r: UserCustomRole) => {
      userCustomRolesMap.set(r.user_id, r.custom_role_id);
    });
    setUserCustomRoles(userCustomRolesMap);

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenDialog = (profile: Profile) => {
    setSelectedUser(profile);
    setSelectedRoleId(userCustomRoles.get(profile.user_id) || 'none');
    setDialogOpen(true);
  };

  const handleAssignRole = async () => {
    if (!selectedUser) return;
    setSaving(true);

    const currentRoleId = userCustomRoles.get(selectedUser.user_id);

    try {
      if (selectedRoleId === 'none') {
        // Remove role assignment
        if (currentRoleId) {
          const { error } = await supabase
            .from('user_custom_roles')
            .delete()
            .eq('user_id', selectedUser.user_id);
          
          if (error) throw error;
        }
        toast.success('Rol removido correctamente');
      } else if (currentRoleId) {
        // Update existing role
        const { error } = await supabase
          .from('user_custom_roles')
          .update({ custom_role_id: selectedRoleId })
          .eq('user_id', selectedUser.user_id);
        
        if (error) throw error;
        toast.success('Rol actualizado correctamente');
      } else {
        // Insert new role
        const { error } = await supabase
          .from('user_custom_roles')
          .insert({ user_id: selectedUser.user_id, custom_role_id: selectedRoleId });
        
        if (error) throw error;
        toast.success('Rol asignado correctamente');
      }

      setDialogOpen(false);
      fetchData();
    } catch (error) {
      toast.error('Error al asignar rol');
    }

    setSaving(false);
  };

  const getRoleName = (userId: string) => {
    const roleId = userCustomRoles.get(userId);
    if (!roleId) return null;
    return customRoles.find(r => r.id === roleId);
  };

  return (
    <AdminLayout title="Gestión de Usuarios" subtitle="Administra usuarios y asigna roles personalizados">
      <Card className="border-0 shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="w-5 h-5" />
            Usuarios Registrados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : profiles.length === 0 ? (
            <div className="text-center py-12">
              <UsersIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay usuarios registrados</h3>
              <p className="text-muted-foreground">Los usuarios aparecerán aquí cuando se registren</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Rol del Sistema</TableHead>
                  <TableHead>Rol Personalizado</TableHead>
                  <TableHead>Registrado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => {
                  const customRole = getRoleName(profile.user_id);
                  return (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{profile.full_name || 'Sin nombre'}</p>
                            <p className="text-xs text-muted-foreground">{profile.user_id.slice(0, 8)}...</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {profile.email || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={userRoles.get(profile.user_id) === 'admin' ? 'default' : 'secondary'}>
                          {userRoles.get(profile.user_id) === 'admin' ? 'Admin' : 'Usuario'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {customRole ? (
                          <Badge 
                            style={{ backgroundColor: customRole.color, color: 'white' }}
                          >
                            {customRole.name}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Sin asignar</span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(profile.created_at).toLocaleDateString('es')}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(profile)}
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Asignar Rol
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Asignar Rol a Usuario
            </DialogTitle>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedUser.full_name || 'Sin nombre'}</p>
                <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Rol Personalizado</label>
                <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar rol..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin rol asignado</SelectItem>
                    {customRoles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: role.color }}
                          />
                          {role.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  El rol determina qué módulos puede acceder este usuario
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAssignRole} disabled={saving}>
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Guardar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Users;