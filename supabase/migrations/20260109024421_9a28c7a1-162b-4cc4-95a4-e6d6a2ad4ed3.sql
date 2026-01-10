-- Drop existing restrictive policies on user_roles
DROP POLICY IF EXISTS "Admins can manage user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;

-- Create permissive policies (default behavior)
CREATE POLICY "Admins can manage user roles" 
ON public.user_roles 
FOR ALL 
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Users can view own role" 
ON public.user_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Also fix user_custom_roles policies
DROP POLICY IF EXISTS "Admins can manage user custom roles" ON public.user_custom_roles;
DROP POLICY IF EXISTS "Users can view own custom roles" ON public.user_custom_roles;

CREATE POLICY "Admins can manage user custom roles" 
ON public.user_custom_roles 
FOR ALL 
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

CREATE POLICY "Users can view own custom roles" 
ON public.user_custom_roles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);