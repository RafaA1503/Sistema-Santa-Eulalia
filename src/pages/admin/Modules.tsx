import { useEffect, useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit2, Trash2, Package, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Module {
  id: string;
  name: string;
  description: string | null;
  icon: string;
  is_active: boolean;
  created_at: string;
}

const Modules = () => {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', icon: 'box' });
  const [saving, setSaving] = useState(false);

  const fetchModules = async () => {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .order('name');

    if (error) {
      toast.error('Error al cargar módulos');
    } else {
      setModules(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const handleOpenDialog = (mod?: Module) => {
    if (mod) {
      setEditingModule(mod);
      setFormData({ name: mod.name, description: mod.description || '', icon: mod.icon });
    } else {
      setEditingModule(null);
      setFormData({ name: '', description: '', icon: 'box' });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    if (editingModule) {
      const { error } = await supabase
        .from('modules')
        .update({ name: formData.name, description: formData.description, icon: formData.icon })
        .eq('id', editingModule.id);

      if (error) {
        toast.error('Error al actualizar módulo');
      } else {
        toast.success('Módulo actualizado');
        setDialogOpen(false);
        fetchModules();
      }
    } else {
      const { error } = await supabase
        .from('modules')
        .insert({ name: formData.name, description: formData.description, icon: formData.icon });

      if (error) {
        toast.error('Error al crear módulo');
      } else {
        toast.success('Módulo creado');
        setDialogOpen(false);
        fetchModules();
      }
    }

    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este módulo?')) return;

    const { error } = await supabase.from('modules').delete().eq('id', id);

    if (error) {
      toast.error('Error al eliminar módulo');
    } else {
      toast.success('Módulo eliminado');
      fetchModules();
    }
  };

  const toggleActive = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from('modules')
      .update({ is_active: !currentState })
      .eq('id', id);

    if (error) {
      toast.error('Error al actualizar estado');
    } else {
      fetchModules();
    }
  };

  return (
    <AdminLayout title="Gestión de Módulos" subtitle="Define los módulos del sistema a los que se asignarán permisos">
      <Card className="border-0 shadow-soft">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Módulos del Sistema
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Módulo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingModule ? 'Editar Módulo' : 'Crear Nuevo Módulo'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del módulo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Inventario"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe la funcionalidad de este módulo..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="icon">Icono (nombre de Lucide)</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="Ej: package, users, settings"
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {editingModule ? 'Guardar cambios' : 'Crear módulo'}
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
          ) : modules.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No hay módulos creados</h3>
              <p className="text-muted-foreground mb-4">Crea tu primer módulo para comenzar</p>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                Crear módulo
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Activo</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {modules.map((mod) => (
                  <TableRow key={mod.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Package className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium">{mod.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-xs truncate">
                      {mod.description || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={mod.is_active ? 'default' : 'secondary'}>
                        {mod.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={mod.is_active}
                        onCheckedChange={() => toggleActive(mod.id, mod.is_active)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(mod)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(mod.id)}>
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

export default Modules;
