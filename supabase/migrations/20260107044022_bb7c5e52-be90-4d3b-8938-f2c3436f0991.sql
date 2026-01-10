-- Enum para roles del sistema
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Tabla de perfiles de usuario
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de roles personalizados (creados por admin)
CREATE TABLE public.custom_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT '#3B82F6',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de módulos del sistema
CREATE TABLE public.modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT 'box',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de permisos (relación rol-módulo)
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES public.custom_roles(id) ON DELETE CASCADE NOT NULL,
  module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE NOT NULL,
  can_view BOOLEAN DEFAULT false,
  can_create BOOLEAN DEFAULT false,
  can_edit BOOLEAN DEFAULT false,
  can_delete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(role_id, module_id)
);

-- Tabla de roles de usuario (sistema)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  UNIQUE(user_id, role)
);

-- Tabla de asignación de roles personalizados a usuarios
CREATE TABLE public.user_custom_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  custom_role_id UUID REFERENCES public.custom_roles(id) ON DELETE CASCADE NOT NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, custom_role_id)
);

-- Habilitar RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_custom_roles ENABLE ROW LEVEL SECURITY;

-- Función para verificar si un usuario es admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_custom_roles_updated_at
  BEFORE UPDATE ON public.custom_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para crear perfil automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Políticas RLS para profiles
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

-- Políticas RLS para custom_roles
CREATE POLICY "Anyone authenticated can view roles" ON public.custom_roles
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage roles" ON public.custom_roles
  FOR ALL USING (public.is_admin(auth.uid()));

-- Políticas RLS para modules
CREATE POLICY "Anyone authenticated can view modules" ON public.modules
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage modules" ON public.modules
  FOR ALL USING (public.is_admin(auth.uid()));

-- Políticas RLS para role_permissions
CREATE POLICY "Anyone authenticated can view permissions" ON public.role_permissions
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage permissions" ON public.role_permissions
  FOR ALL USING (public.is_admin(auth.uid()));

-- Políticas RLS para user_roles
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all user roles" ON public.user_roles
  FOR SELECT USING (public.is_admin(auth.uid()));
CREATE POLICY "Admins can manage user roles" ON public.user_roles
  FOR ALL USING (public.is_admin(auth.uid()));

-- Políticas RLS para user_custom_roles
CREATE POLICY "Users can view own custom roles" ON public.user_custom_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage user custom roles" ON public.user_custom_roles
  FOR ALL USING (public.is_admin(auth.uid()));

-- Insertar módulos por defecto
INSERT INTO public.modules (name, description, icon) VALUES
  ('Dashboard', 'Panel principal con estadísticas', 'layout-dashboard'),
  ('Usuarios', 'Gestión de usuarios del sistema', 'users'),
  ('Roles', 'Gestión de roles y permisos', 'shield'),
  ('Reportes', 'Generación de reportes', 'file-text'),
  ('Configuración', 'Ajustes del sistema', 'settings');