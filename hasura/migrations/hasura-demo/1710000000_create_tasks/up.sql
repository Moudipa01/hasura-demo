CREATE TABLE public.tasks (
  id serial PRIMARY KEY,
  title text NOT NULL,
  is_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
