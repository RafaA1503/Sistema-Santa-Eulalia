-- Drop existing restrictive policies and recreate as permissive

-- custom_roles policies
DROP POLICY IF EXISTS "Admins can manage roles" ON public.custom_roles;
DROP POLICY IF EXISTS "Anyone authenticated can view roles" ON public.custom_roles;

CREATE POLICY "Admins can manage roles" ON public.custom_roles
FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Anyone authenticated can view roles" ON public.custom_roles
FOR SELECT TO authenticated
USING (true);

-- modules policies
DROP POLICY IF EXISTS "Admins can manage modules" ON public.modules;
DROP POLICY IF EXISTS "Anyone authenticated can view modules" ON public.modules;

CREATE POLICY "Admins can manage modules" ON public.modules
FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Anyone authenticated can view modules" ON public.modules
FOR SELECT TO authenticated
USING (true);

-- role_permissions policies
DROP POLICY IF EXISTS "Admins can manage permissions" ON public.role_permissions;
DROP POLICY IF EXISTS "Anyone authenticated can view permissions" ON public.role_permissions;

CREATE POLICY "Admins can manage permissions" ON public.role_permissions
FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Anyone authenticated can view permissions" ON public.role_permissions
FOR SELECT TO authenticated
USING (true);

-- user_custom_roles policies
DROP POLICY IF EXISTS "Admins can manage user custom roles" ON public.user_custom_roles;
DROP POLICY IF EXISTS "Users can view own custom roles" ON public.user_custom_roles;

CREATE POLICY "Admins can manage user custom roles" ON public.user_custom_roles
FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Users can view own custom roles" ON public.user_custom_roles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- user_roles policies
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;

CREATE POLICY "Admins can manage user roles" ON public.user_roles
FOR ALL TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Users can view own role" ON public.user_roles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- profiles policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT TO authenticated
USING (public.is_admin(auth.uid()));

CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);