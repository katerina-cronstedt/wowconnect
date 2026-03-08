
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view profiles" ON public.profiles
  FOR SELECT USING (user_id = auth.uid() OR is_hq_level() OR is_hq_admin());
