
CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT public.has_role(auth.uid(), 'hq_admin')
      OR public.has_role(auth.uid(), 'hq_team')
      OR public.has_role(auth.uid(), 'staff')
      OR public.has_role(auth.uid(), 'city_team')
$$;

CREATE OR REPLACE FUNCTION public.is_hq_level()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $$
  SELECT public.has_role(auth.uid(), 'hq_admin')
      OR public.has_role(auth.uid(), 'hq_team')
$$;
