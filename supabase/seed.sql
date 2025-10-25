-- Insert 3 plans for the user "e0000000-0000-0000-0000-00000000000e" (city_id will be fetched from Warsaw above)
-- For reproducibility, we'll fetch the city_id for Warsaw.
do $$
declare
  warsaw_id uuid;
begin
  select id into warsaw_id from cities where name = 'Warsaw' limit 1;
  if warsaw_id is null then
    raise exception 'Warsaw city not found in cities table';
  end if;

  insert into plans (id, user_id, city_id, duration_days, trip_intensity, wizard_notes, status, is_archived, created_at, updated_at) values
    (
      '10000000-0000-0000-0000-000000000001',
      'e0000000-0000-0000-0000-00000000000e',
      warsaw_id,
      2,
      'full day',
      'First time in Warsaw, want to see the sights.',
      'active',
      false,
      now() - interval '10 days',
      now() - interval '10 days'
    ),
    (
      '10000000-0000-0000-0000-000000000002',
      'e0000000-0000-0000-0000-00000000000e',
      warsaw_id,
      1,
      'half day',
      'Short stopover before flight. Prefer museums.',
      'draft',
      false,
      now() - interval '5 days',
      now() - interval '3 days'
    );
end
$$;

-- Insert some activities for the above 3 plans

-- Activities for Plan 1 ("10000000-0000-0000-0000-000000000001"): 2 days, each with 2 activities
insert into plan_activities (id, plan_id, day_number, position, name, notes, latitude, longitude, created_at, updated_at) values
  (
    '20000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    1,
    1,
    'Visit Old Town Market Square',
    'Explore historic center with guided walking tour.',
    52.2494, 21.0122,
    now() - interval '10 days', now() - interval '10 days'
  ),
  (
    '20000000-0000-0000-0000-000000000002',
    '10000000-0000-0000-0000-000000000001',
    1,
    2,
    'Lunch at Zapiecek',
    'Try traditional Polish pierogi.',
    52.2479, 21.0125,
    now() - interval '10 days', now() - interval '10 days'
  ),
  (
    '20000000-0000-0000-0000-000000000003',
    '10000000-0000-0000-0000-000000000001',
    2,
    1,
    'Walk in Łazienki Park',
    'See the palace and peacocks, relax in gardens.',
    52.2167, 21.0344,
    now() - interval '9 days', now() - interval '9 days'
  ),
  (
    '20000000-0000-0000-0000-000000000004',
    '10000000-0000-0000-0000-000000000001',
    2,
    2,
    'Visit POLIN Museum',
    'Learn about Polish Jewish history (afternoon).',
    52.2517, 20.9848,
    now() - interval '9 days', now() - interval '9 days'
  );

-- Activities for Plan 2 ("10000000-0000-0000-0000-000000000002"): 1 day (half-day), focus on museums
insert into plan_activities (id, plan_id, day_number, position, name, notes, latitude, longitude, created_at, updated_at) values
  (
    '20000000-0000-0000-0000-000000000005',
    '10000000-0000-0000-0000-000000000002',
    1,
    1,
    'Chopin Museum',
    'Quick visit before other museums.',
    52.2322, 21.0230,
    now() - interval '5 days', now() - interval '3 days'
  ),
  (
    '20000000-0000-0000-0000-000000000006',
    '10000000-0000-0000-0000-000000000002',
    1,
    2,
    'National Museum in Warsaw',
    'Focus on modern art section, short visit.',
    52.2301, 21.0276,
    now() - interval '5 days', now() - interval '3 days'
  );

