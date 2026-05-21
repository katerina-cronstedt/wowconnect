-- =============================================
-- ONEGOAL PROGRAM COLUMNS
-- =============================================
ALTER TABLE public.people ADD COLUMN IF NOT EXISTS is_onegoal_candidate BOOLEAN DEFAULT false;
ALTER TABLE public.people ADD COLUMN IF NOT EXISTS is_onegoal_agent BOOLEAN DEFAULT false;

-- =============================================
-- TRIGGER: LINK AUTHENTICATED MEMBERS TO PEOPLE TABLE
-- =============================================
-- When a user logs in via Google (or any other provider), we check if their email matches a record in the `people` table.
-- Currently, `people` DOES NOT have an `auth_user_id` column explicitly mapped, but we can rely on `profiles` 
-- which gets auto-created by the existing `on_auth_user_created` trigger. 
-- Wait, the existing trigger `handle_new_user()` creates a `profiles` record. 
-- The `profiles` table has `user_id` and `email`. 
-- To formally link members to the `people` table in terms of RLS, we can add `auth_user_id` to `people`.

ALTER TABLE public.people ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- Create a function to link an auth user to a person by email if the person exists.
-- It can run after the `profiles` trigger.
CREATE OR REPLACE FUNCTION public.link_auth_user_to_person()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If a person with this email exists, update their auth_user_id
  UPDATE public.people
  SET auth_user_id = NEW.id
  WHERE email = NEW.email AND auth_user_id IS NULL;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS link_auth_user_to_person_trigger ON auth.users;
CREATE TRIGGER link_auth_user_to_person_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.link_auth_user_to_person();

-- =============================================
-- MEMBER RLS ON PEOPLE
-- =============================================
-- Members should be able to view and update their own people record using the newly added auth_user_id column.
CREATE POLICY "Members can view own person record" ON public.people 
  FOR SELECT TO authenticated 
  USING (auth_user_id = auth.uid());

CREATE POLICY "Members can update own person record" ON public.people 
  FOR UPDATE TO authenticated 
  USING (auth_user_id = auth.uid());

-- =============================================
-- VOLUNTEER RLS POLICIES FOR EVENTS AND ATTENDANCE
-- =============================================
-- Ensure volunteers can view events they are assigned to
DROP POLICY IF EXISTS "Volunteers can view assigned events" ON public.events;
CREATE POLICY "Volunteers can view assigned events" ON public.events 
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.event_volunteers ev 
      WHERE ev.event_id = events.id AND ev.user_id = auth.uid()
    )
  );

-- Ensure volunteers can read and manage attendance for their assigned events
DROP POLICY IF EXISTS "Volunteers can read attendance for assigned events" ON public.attendance;
CREATE POLICY "Volunteers can read attendance for assigned events" ON public.attendance 
  FOR SELECT TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.event_volunteers ev 
      WHERE ev.event_id = attendance.event_id AND ev.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Volunteers can insert attendance for assigned events" ON public.attendance;
CREATE POLICY "Volunteers can insert attendance for assigned events" ON public.attendance 
  FOR INSERT TO authenticated 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.event_volunteers ev 
      WHERE ev.event_id = attendance.event_id AND ev.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Volunteers can update attendance for assigned events" ON public.attendance;
CREATE POLICY "Volunteers can update attendance for assigned events" ON public.attendance 
  FOR UPDATE TO authenticated 
  USING (
    EXISTS (
      SELECT 1 FROM public.event_volunteers ev 
      WHERE ev.event_id = attendance.event_id AND ev.user_id = auth.uid()
    )
  );

-- =============================================
-- ONE-TIME BACKFILL FOR EXISTING USERS
-- =============================================
UPDATE public.people p
SET auth_user_id = u.id
FROM auth.users u
WHERE p.email = u.email AND p.auth_user_id IS NULL;
