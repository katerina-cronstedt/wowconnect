
ALTER TYPE public.attendance_status ADD VALUE IF NOT EXISTS 'excused';

ALTER TABLE public.people ADD COLUMN IF NOT EXISTS pending_signup boolean NOT NULL DEFAULT false;
