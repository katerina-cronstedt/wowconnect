
-- =============================================
-- ENUMS
-- =============================================
CREATE TYPE public.app_role AS ENUM ('hq_admin', 'staff');
CREATE TYPE public.event_status AS ENUM ('draft', 'published', 'closed');
CREATE TYPE public.event_type AS ENUM ('lunch', 'onegoal', 'gala', 'other');
CREATE TYPE public.rsvp_response AS ENUM ('yes', 'no');
CREATE TYPE public.rsvp_source AS ENUM ('rsvp_link', 'admin', 'manual');
CREATE TYPE public.attendance_status AS ENUM ('arrived', 'late', 'no_show');
CREATE TYPE public.attendance_source AS ENUM ('rsvp', 'walk_in');
CREATE TYPE public.swedish_level_simple AS ENUM ('Native', 'Fluent', 'Intermediate', 'Beginner', 'None', 'PreferNotToSay');
CREATE TYPE public.swedish_level_status AS ENUM ('SelfReported', 'PendingTest', 'Tested');
CREATE TYPE public.cefr_level AS ENUM ('A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2');
CREATE TYPE public.consent_source AS ENUM ('website_signup', 'event_walkin', 'import');
CREATE TYPE public.custom_field_type AS ENUM ('text', 'number', 'boolean', 'single_select', 'multi_select', 'date');
CREATE TYPE public.custom_field_entity AS ENUM ('person', 'event');
CREATE TYPE public.language_test_status AS ENUM ('invited', 'in_progress', 'completed');

-- =============================================
-- USER ROLES (for CRM admin/staff)
-- =============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PROFILES (for CRM users)
-- =============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  display_name TEXT,
  email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CITIES
-- =============================================
CREATE TABLE public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.cities ENABLE ROW LEVEL SECURITY;

-- =============================================
-- STAFF CITIES (which cities a staff user manages)
-- =============================================
CREATE TABLE public.staff_cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, city_id)
);
ALTER TABLE public.staff_cities ENABLE ROW LEVEL SECURITY;

-- =============================================
-- LANGUAGES
-- =============================================
CREATE TABLE public.languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PEOPLE (Members)
-- =============================================
CREATE TABLE public.people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  linkedin_url TEXT,
  profession TEXT,
  allergies TEXT,
  birth_year INTEGER,
  birth_month INTEGER,
  birth_day INTEGER,
  country_of_origin TEXT,
  citizenship TEXT,
  heard_about_wow TEXT,
  heard_about_wow_other_text TEXT,
  languages_other_text TEXT,
  -- Swedish proficiency
  swedish_level_simple_self_reported public.swedish_level_simple,
  swedish_level_cefr_result public.cefr_level,
  swedish_level_status public.swedish_level_status DEFAULT 'SelfReported',
  swedish_test_score NUMERIC(5,2),
  swedish_test_completed_at TIMESTAMPTZ,
  -- Roles/tags
  roles TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  -- Engagement (computed/cached)
  engagement_status TEXT DEFAULT 'Inactive',
  last_event_attended_at TIMESTAMPTZ,
  last_rsvp_yes_at TIMESTAMPTZ,
  -- Mailchimp
  mailchimp_last_open_at TIMESTAMPTZ,
  mailchimp_last_click_at TIMESTAMPTZ,
  mailchimp_audience_id TEXT,
  mailchimp_member_id TEXT,
  -- GDPR
  consent_opt_in BOOLEAN DEFAULT false,
  consent_source public.consent_source DEFAULT 'website_signup',
  consent_timestamp TIMESTAMPTZ,
  media_consent BOOLEAN,
  media_consent_timestamp TIMESTAMPTZ,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.people ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PERSON CITIES (many-to-many)
-- =============================================
CREATE TABLE public.person_cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID REFERENCES public.people(id) ON DELETE CASCADE NOT NULL,
  city_id UUID REFERENCES public.cities(id) ON DELETE CASCADE NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (person_id, city_id)
);
ALTER TABLE public.person_cities ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PERSON LANGUAGES (many-to-many)
-- =============================================
CREATE TABLE public.person_languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID REFERENCES public.people(id) ON DELETE CASCADE NOT NULL,
  language_id UUID REFERENCES public.languages(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (person_id, language_id)
);
ALTER TABLE public.person_languages ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CUSTOM FIELDS
-- =============================================
CREATE TABLE public.custom_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  field_type public.custom_field_type NOT NULL DEFAULT 'text',
  options_json JSONB,
  applies_to public.custom_field_entity NOT NULL DEFAULT 'person',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.custom_fields ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CUSTOM FIELD VALUES
-- =============================================
CREATE TABLE public.custom_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  custom_field_id UUID REFERENCES public.custom_fields(id) ON DELETE CASCADE NOT NULL,
  entity_type public.custom_field_entity NOT NULL,
  entity_id UUID NOT NULL,
  value_json JSONB,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by_user_id UUID REFERENCES auth.users(id)
);
ALTER TABLE public.custom_field_values ENABLE ROW LEVEL SECURITY;

-- =============================================
-- EVENTS
-- =============================================
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
  location TEXT,
  start_datetime TIMESTAMPTZ NOT NULL,
  end_datetime TIMESTAMPTZ,
  capacity INTEGER,
  status public.event_status NOT NULL DEFAULT 'draft',
  event_type public.event_type NOT NULL DEFAULT 'other',
  created_by_user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- =============================================
-- EVENT INVITES
-- =============================================
CREATE TABLE public.event_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  person_id UUID REFERENCES public.people(id) ON DELETE CASCADE NOT NULL,
  sent_at TIMESTAMPTZ,
  rsvp_token TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  mailchimp_campaign_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (event_id, person_id)
);
ALTER TABLE public.event_invites ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RSVPS
-- =============================================
CREATE TABLE public.rsvps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  person_id UUID REFERENCES public.people(id) ON DELETE CASCADE NOT NULL,
  response public.rsvp_response NOT NULL,
  responded_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  source public.rsvp_source NOT NULL DEFAULT 'rsvp_link',
  UNIQUE (event_id, person_id)
);
ALTER TABLE public.rsvps ENABLE ROW LEVEL SECURITY;

-- =============================================
-- ATTENDANCE
-- =============================================
CREATE TABLE public.attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  person_id UUID REFERENCES public.people(id) ON DELETE CASCADE NOT NULL,
  attendance_status public.attendance_status NOT NULL DEFAULT 'arrived',
  checked_in_at TIMESTAMPTZ DEFAULT now(),
  checked_in_by_user_id UUID REFERENCES auth.users(id),
  source public.attendance_source NOT NULL DEFAULT 'rsvp',
  UNIQUE (event_id, person_id)
);
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

-- =============================================
-- LANGUAGE TESTS (V2-ready scaffolding)
-- =============================================
CREATE TABLE public.language_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id UUID REFERENCES public.people(id) ON DELETE CASCADE NOT NULL,
  language TEXT NOT NULL DEFAULT 'Swedish',
  status public.language_test_status NOT NULL DEFAULT 'invited',
  token TEXT NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex') UNIQUE,
  invited_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  score NUMERIC(5,2),
  level_result_cefr public.cefr_level,
  answers_json JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.language_tests ENABLE ROW LEVEL SECURITY;

-- =============================================
-- AUDIT LOG
-- =============================================
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action TEXT NOT NULL,
  target_table TEXT,
  target_id UUID,
  old_data JSONB,
  new_data JSONB,
  performed_by UUID REFERENCES auth.users(id),
  performed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTIONS (SECURITY DEFINER)
-- =============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_hq_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'hq_admin')
$$;

CREATE OR REPLACE FUNCTION public.is_staff_or_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'hq_admin') OR public.has_role(auth.uid(), 'staff')
$$;

CREATE OR REPLACE FUNCTION public.get_staff_city_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT city_id FROM public.staff_cities WHERE user_id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.can_access_city(_city_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_hq_admin() OR EXISTS (
    SELECT 1 FROM public.staff_cities
    WHERE user_id = auth.uid() AND city_id = _city_id
  )
$$;

-- =============================================
-- TRIGGER: auto-create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- TRIGGER: updated_at
-- =============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_people_updated_at BEFORE UPDATE ON public.people FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- RLS POLICIES
-- =============================================

-- user_roles: only admins can read, no direct modification
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT TO authenticated USING (public.is_hq_admin() OR user_id = auth.uid());
CREATE POLICY "HQ admins can manage roles" ON public.user_roles FOR ALL TO authenticated USING (public.is_hq_admin()) WITH CHECK (public.is_hq_admin());

-- profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_hq_admin());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- cities: readable by all authenticated, writable by hq_admin
CREATE POLICY "Authenticated can read cities" ON public.cities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anon can read cities" ON public.cities FOR SELECT TO anon USING (true);
CREATE POLICY "HQ admins manage cities" ON public.cities FOR ALL TO authenticated USING (public.is_hq_admin()) WITH CHECK (public.is_hq_admin());

-- staff_cities
CREATE POLICY "Staff can see own assignments" ON public.staff_cities FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_hq_admin());
CREATE POLICY "HQ admins manage staff cities" ON public.staff_cities FOR ALL TO authenticated USING (public.is_hq_admin()) WITH CHECK (public.is_hq_admin());

-- languages: readable by all, writable by hq_admin
CREATE POLICY "Anyone can read languages" ON public.languages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "HQ admins manage languages" ON public.languages FOR ALL TO authenticated USING (public.is_hq_admin()) WITH CHECK (public.is_hq_admin());

-- people: anon can insert (public signup), staff/admin can read/update by city
CREATE POLICY "Anon can create people" ON public.people FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Staff can read people in their cities" ON public.people FOR SELECT TO authenticated
  USING (public.is_hq_admin() OR EXISTS (
    SELECT 1 FROM public.person_cities pc WHERE pc.person_id = people.id AND pc.city_id IN (SELECT public.get_staff_city_ids())
  ));
CREATE POLICY "Staff can update people in their cities" ON public.people FOR UPDATE TO authenticated
  USING (public.is_hq_admin() OR EXISTS (
    SELECT 1 FROM public.person_cities pc WHERE pc.person_id = people.id AND pc.city_id IN (SELECT public.get_staff_city_ids())
  ));
CREATE POLICY "HQ admins can delete people" ON public.people FOR DELETE TO authenticated USING (public.is_hq_admin());
CREATE POLICY "Authenticated can insert people" ON public.people FOR INSERT TO authenticated WITH CHECK (public.is_staff_or_admin());

-- person_cities: anon can insert (signup), staff/admin manage
CREATE POLICY "Anon can create person_cities" ON public.person_cities FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Staff can read person_cities" ON public.person_cities FOR SELECT TO authenticated USING (public.is_staff_or_admin());
CREATE POLICY "Staff can insert person_cities for their cities" ON public.person_cities FOR INSERT TO authenticated WITH CHECK (public.is_hq_admin() OR city_id IN (SELECT public.get_staff_city_ids()));
CREATE POLICY "Staff can update person_cities for their cities" ON public.person_cities FOR UPDATE TO authenticated USING (public.is_hq_admin() OR city_id IN (SELECT public.get_staff_city_ids()));
CREATE POLICY "HQ admins can delete person_cities" ON public.person_cities FOR DELETE TO authenticated USING (public.is_hq_admin());

-- person_languages: anon can insert (signup), staff/admin manage
CREATE POLICY "Anon can create person_languages" ON public.person_languages FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Staff can read person_languages" ON public.person_languages FOR SELECT TO authenticated USING (public.is_staff_or_admin());
CREATE POLICY "Staff can manage person_languages" ON public.person_languages FOR ALL TO authenticated USING (public.is_staff_or_admin()) WITH CHECK (public.is_staff_or_admin());

-- custom_fields
CREATE POLICY "Staff can read custom_fields" ON public.custom_fields FOR SELECT TO authenticated USING (public.is_staff_or_admin());
CREATE POLICY "HQ admins manage custom_fields" ON public.custom_fields FOR ALL TO authenticated USING (public.is_hq_admin()) WITH CHECK (public.is_hq_admin());

-- custom_field_values
CREATE POLICY "Staff can read custom_field_values" ON public.custom_field_values FOR SELECT TO authenticated USING (public.is_staff_or_admin());
CREATE POLICY "Staff can manage custom_field_values" ON public.custom_field_values FOR ALL TO authenticated USING (public.is_staff_or_admin()) WITH CHECK (public.is_staff_or_admin());

-- events: staff see events in their cities
CREATE POLICY "Staff can read events in their cities" ON public.events FOR SELECT TO authenticated
  USING (public.is_hq_admin() OR public.can_access_city(city_id));
CREATE POLICY "Staff can create events in their cities" ON public.events FOR INSERT TO authenticated
  WITH CHECK (public.is_hq_admin() OR public.can_access_city(city_id));
CREATE POLICY "Staff can update events in their cities" ON public.events FOR UPDATE TO authenticated
  USING (public.is_hq_admin() OR public.can_access_city(city_id));
CREATE POLICY "HQ admins can delete events" ON public.events FOR DELETE TO authenticated USING (public.is_hq_admin());

-- event_invites
CREATE POLICY "Staff can read invites for accessible events" ON public.event_invites FOR SELECT TO authenticated
  USING (public.is_hq_admin() OR event_id IN (SELECT id FROM public.events WHERE public.can_access_city(city_id)));
CREATE POLICY "Staff can manage invites" ON public.event_invites FOR ALL TO authenticated
  USING (public.is_staff_or_admin()) WITH CHECK (public.is_staff_or_admin());

-- rsvps: anon can insert/update (public RSVP link), staff can read
CREATE POLICY "Anon can upsert rsvps" ON public.rsvps FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Anon can update rsvps" ON public.rsvps FOR UPDATE TO anon USING (true);
CREATE POLICY "Anon can read own rsvp" ON public.rsvps FOR SELECT TO anon USING (true);
CREATE POLICY "Staff can read rsvps" ON public.rsvps FOR SELECT TO authenticated USING (public.is_staff_or_admin());
CREATE POLICY "Staff can manage rsvps" ON public.rsvps FOR ALL TO authenticated USING (public.is_staff_or_admin()) WITH CHECK (public.is_staff_or_admin());

-- attendance
CREATE POLICY "Staff can read attendance" ON public.attendance FOR SELECT TO authenticated USING (public.is_staff_or_admin());
CREATE POLICY "Staff can manage attendance" ON public.attendance FOR ALL TO authenticated USING (public.is_staff_or_admin()) WITH CHECK (public.is_staff_or_admin());

-- language_tests
CREATE POLICY "Staff can read language_tests" ON public.language_tests FOR SELECT TO authenticated USING (public.is_staff_or_admin());
CREATE POLICY "Staff can manage language_tests" ON public.language_tests FOR ALL TO authenticated USING (public.is_staff_or_admin()) WITH CHECK (public.is_staff_or_admin());
CREATE POLICY "Anon can read own test by token" ON public.language_tests FOR SELECT TO anon USING (true);
CREATE POLICY "Anon can update own test" ON public.language_tests FOR UPDATE TO anon USING (true);

-- audit_log
CREATE POLICY "Staff can read audit_log" ON public.audit_log FOR SELECT TO authenticated USING (public.is_staff_or_admin());
CREATE POLICY "System can insert audit_log" ON public.audit_log FOR INSERT TO authenticated WITH CHECK (true);

-- =============================================
-- SEED: Initial cities and languages
-- =============================================
INSERT INTO public.cities (name, slug) VALUES
  ('Stockholm', 'stockholm'),
  ('Göteborg', 'goteborg'),
  ('Malmö', 'malmo'),
  ('Uppsala', 'uppsala'),
  ('Linköping', 'linkoping'),
  ('Örebro', 'orebro');

INSERT INTO public.languages (name) VALUES
  ('Svenska'), ('Engelska'), ('Arabiska'), ('Ukrainska'), ('Ryska'),
  ('Persiska'), ('Somaliska'), ('Spanska'), ('Franska'), ('Tigrinja'),
  ('Dari'), ('Pashto'), ('Kurdiska'), ('Turkiska'), ('Polska'),
  ('Tyska'), ('Portugisiska'), ('Italienska');
