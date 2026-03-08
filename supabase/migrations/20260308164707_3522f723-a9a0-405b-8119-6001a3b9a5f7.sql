
-- Update user_roles SELECT policy to allow hq_team to see all roles
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;
CREATE POLICY "Admins can view all roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (is_hq_level() OR user_id = auth.uid());
