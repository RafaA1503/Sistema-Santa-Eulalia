import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, Trash2, Shield, Loader2, Key } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface CustomRole {
  id: string;
  name: string;
  description: string | null;
  color: string;
  is_active: boolean;
  created_at: string;
}

const colorOptions = [
  { name: 'Azul', value: '#3B82F6' },
  { name: 'Verde', value: '#22C55E' },
  { name: 'Rojo', value: '#EF4444' },
  { name: 'Amarillo', value: '#EAB308' },
  { name: 'Púrpura', value: '#A855F7' },
  { name: 'Rosa', value: '#EC4899' },
  { name: 'Naranja', value: '#F97316' },
  { name: 'Cian', value: '#06B6D4' },
];

const Roles = () => {
  const [roles, setRoles] = useState<CustomRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<CustomRole | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', color: '#3B82F6' });
  const [saving, setSaving] = useState(false);

  const fetchRoles = async () => {
    const { data, error } = await supabase
      .from('custom_roles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error al cargar roles');
    } else {
      setRoles(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const handleOpenDialog = (role?: CustomRole) => {
    if (role) {
      setEditingRole(role);
      setFormData({ name: role.name, description: role.description || '', color: role.color });
    } else {
      setEditingRole(null);
      setFormData({ name: '', description: '', color: '#3B82F6' });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (editingRole) {
      const { error } = await supabase
        .from('custom_roles')
        .update({ name: formData.name, description: formData.description, color: formData.color })
        .eq('id', editingRole.id);

      if (error) {
        toast.error('Error al actualizar rol');
      } else {
        toast.success('Rol actualizado');
        setDialogOpen(false);
        fetchRoles();
      }
    } else {
      const { error } = await supabase
        .from('custom_roles')
        .insert({ name: formData.name, description: formData.description, color: formData.color });

      if (error) {
        toast.error('Error al crear rol');
      } else {
        toast.success('Rol creado');
        setDialogOpen(false);
        fetchRoles();
      }
    }

    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este rol?')) return;

    const { error } = await supabase.from('custom_roles').delete().eq('id', id);

    if (error) {
      toast.error('Error al eliminar rol');
    } else {
      toast.success('Rol eliminado');
      fetchRoles();
    }
  };

  return (
    <AdminLayout title="Gestión de Roles" subtitle="Crea y administra los roles del sistema">
      <Card className="border-0 shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Roles del Sistema
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Rol
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingRole ? 'Editar Rol' : 'Crear Nuevo Rol'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del rol</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Supervisor"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe las responsabilidades de este rol..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="flex flex-wrap gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: color.value })}
                        className={`w-8 h-8 rounded-full transition-all ${
                          formData.color === color.value ? 'ring-2 ring-offset-2 ring-primary' : ''
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingRole ? 'Guardar cambios' : 'Crear rol'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : roles.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay roles creados</h3>
              <p className="text-muted-foreground mb-4">Crea tu primer rol para comenzar</p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Crear rol
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rol</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roles.map((role) => (
                  <TableRow key={role.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: role.color }}
                        />
                        <span className="font-medium">{role.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {role.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={role.is_active ? 'default' : 'secondary'}>
                        {role.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(role.created_at).toLocaleDateString('es')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/admin/roles/${role.id}/permissions`}>
                            <Key className="w-4 h-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(role)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(role.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default Roles;
