
-- Remove cities not in the new list
DELETE FROM cities WHERE id IN (
  'dccfb3a6-3f14-4f33-a117-0be97f738b23',
  'e1d58958-0afc-41c5-9bd6-633149772581',
  '7eb935f6-0f41-495e-8f7a-06c2c16c4ec5',
  '12a1e8c2-ce1f-44ac-8f97-fb6ce2988309'
);

-- Add new cities
INSERT INTO cities (name, slug) VALUES
  ('Borås', 'boras'),
  ('Halmstad', 'halmstad'),
  ('Helsingborg', 'helsingborg'),
  ('Karlstad', 'karlstad');
