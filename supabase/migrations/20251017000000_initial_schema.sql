-- Migration: Initial Schema Setup
-- Purpose: Create the complete database schema for VibeTravel application
-- Tables Created: cities, plans, plan_activities, plan_feedback, llm_error_logs, app_error_logs
-- Features: Enum types, RLS policies, indexes, triggers, and seed data
-- Special Considerations: References auth.users from Supabase Auth

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Define trip intensity levels
create type trip_intensity_enum as enum ('full day', 'half day');

-- Define plan workflow statuses
create type plan_status_enum as enum ('draft', 'active', 'archived');

-- Define log severity levels for application error tracking
create type log_severity_enum as enum ('debug', 'info', 'warning', 'error', 'critical');

-- ============================================================================
-- TABLES
-- ============================================================================

-- cities
-- Purpose: Store the predefined list of European cities available for trip planning
-- This table serves as a reference for all travel plans
create table cities (
  id uuid primary key default gen_random_uuid(),
  name text not null unique
);

-- plans
-- Purpose: Store user-generated travel plans with metadata and configuration
-- Each plan belongs to a single user and references one city
-- Supports soft-deletion via is_archived flag
create table plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  city_id uuid not null references cities(id),
  duration_days int not null check (duration_days >= 1 and duration_days <= 5),
  trip_intensity trip_intensity_enum not null,
  wizard_notes text,
  status plan_status_enum not null default 'active',
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- plan_activities
-- Purpose: Store individual activities within a travel plan
-- Activities are organized by day and position within that day
-- Includes optional geolocation data for mapping features
create table plan_activities (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references plans(id) on delete cascade,
  day_number int not null check (day_number >= 1),
  position int not null check (position >= 1),
  name text not null,
  latitude double precision,
  longitude double precision,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  google_maps_url text,
  unique (plan_id, day_number, position)
);

-- plan_feedback
-- Purpose: Collect user feedback on travel plans (helpful/not helpful)
-- Ensures one feedback entry per user per plan via unique constraint
create table plan_feedback (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references plans(id) on delete cascade,
  user_id uuid not null references auth.users(id),
  helpful boolean not null,
  created_at timestamptz not null default now(),
  unique (plan_id, user_id)
);

-- llm_error_logs
-- Purpose: Track errors from LLM API interactions for debugging and monitoring
-- Stores request/response payloads as JSONB for flexible error analysis
-- Only service role can insert; only admins can select
create table llm_error_logs (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  user_id uuid references auth.users(id),
  plan_id uuid references plans(id),
  message text not null,
  request_payload jsonb,
  response_payload jsonb
);

-- app_error_logs
-- Purpose: Centralized application error logging with severity levels
-- Captures stack traces and arbitrary metadata for comprehensive debugging
-- Only service role can insert; only admins can select
create table app_error_logs (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  user_id uuid references auth.users(id),
  plan_id uuid references plans(id),
  severity log_severity_enum not null,
  message text not null,
  stack_trace text,
  payload jsonb
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Optimize queries for user's plans ordered by creation date
create index idx_plans_user_created on plans(user_id, created_at desc);

-- Optimize queries for activities within a plan, ordered by day and position
create index idx_activities_plan_day_pos on plan_activities(plan_id, day_number, position);

-- Optimize queries for LLM error logs by user and time
create index idx_llm_logs_user_time on llm_error_logs(user_id, occurred_at desc);

-- Optimize queries for application error logs by user and time
create index idx_app_logs_user_time on app_error_logs(user_id, occurred_at desc);

-- Optimize queries for application error logs by severity and time
create index idx_app_logs_severity_time on app_error_logs(severity, occurred_at desc);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Trigger function: Validate that activity day_number does not exceed plan duration
-- Prevents creating activities for days beyond the plan's duration_days
create or replace function validate_activity_day_number()
returns trigger as $$
declare
  plan_duration int;
begin
  -- Fetch the duration_days for the referenced plan
  select duration_days into plan_duration
  from plans
  where id = new.plan_id;

  -- Check if day_number exceeds the plan's duration
  if new.day_number > plan_duration then
    raise exception 'day_number (%) cannot exceed plan duration_days (%)', new.day_number, plan_duration;
  end if;

  return new;
end;
$$ language plpgsql;

-- Apply the validation trigger to plan_activities on insert and update
create trigger check_activity_day_number
  before insert or update on plan_activities
  for each row
  execute function validate_activity_day_number();

-- Trigger function: Automatically update the updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at trigger to plans table
create trigger update_plans_updated_at
  before update on plans
  for each row
  execute function update_updated_at_column();

-- Apply updated_at trigger to plan_activities table
create trigger update_plan_activities_updated_at
  before update on plan_activities
  for each row
  execute function update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- cities: Public read access, no write access for regular users
alter table cities enable row level security;

-- Allow anonymous users to view cities
create policy select_cities_anon on cities
  for select
  to anon
  using (true);

-- Allow authenticated users to view cities
create policy select_cities_authenticated on cities
  for select
  to authenticated
  using (true);

-- plans: Users can only manage their own plans
alter table plans enable row level security;

-- Allow authenticated users to view their own plans
create policy select_own_plans on plans
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Allow authenticated users to create plans for themselves
create policy insert_own_plans on plans
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Allow authenticated users to update their own plans
create policy update_own_plans on plans
  for update
  to authenticated
  using (auth.uid() = user_id);

-- Allow authenticated users to delete their own plans
create policy delete_own_plans on plans
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- plan_activities: Users can only manage activities for their own plans
alter table plan_activities enable row level security;

-- Allow authenticated users to view activities for their own plans
create policy select_own_activities on plan_activities
  for select
  to authenticated
  using (auth.uid() = (select user_id from plans where id = plan_activities.plan_id));

-- Allow authenticated users to create activities for their own plans
create policy insert_own_activities on plan_activities
  for insert
  to authenticated
  with check (auth.uid() = (select user_id from plans where id = plan_activities.plan_id));

-- Allow authenticated users to update activities for their own plans
create policy update_own_activities on plan_activities
  for update
  to authenticated
  using (auth.uid() = (select user_id from plans where id = plan_activities.plan_id));

-- Allow authenticated users to delete activities for their own plans
create policy delete_own_activities on plan_activities
  for delete
  to authenticated
  using (auth.uid() = (select user_id from plans where id = plan_activities.plan_id));

-- plan_feedback: Users can only manage their own feedback
alter table plan_feedback enable row level security;

-- Allow authenticated users to view their own feedback
create policy select_own_feedback on plan_feedback
  for select
  to authenticated
  using (auth.uid() = user_id);

-- Allow authenticated users to create their own feedback
create policy insert_own_feedback on plan_feedback
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Allow authenticated users to update their own feedback
create policy update_own_feedback on plan_feedback
  for update
  to authenticated
  using (auth.uid() = user_id);

-- Allow authenticated users to delete their own feedback
create policy delete_own_feedback on plan_feedback
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- llm_error_logs: Restricted to service role for writes, admins for reads
alter table llm_error_logs enable row level security;

-- Allow service role to insert error logs (backend logging only)
create policy insert_llm_errors on llm_error_logs
  for insert
  to service_role
  with check (true);

-- Note: Admin access requires custom Supabase role configuration
-- This policy will need adjustment based on your admin role implementation

-- app_error_logs: Restricted to service role for writes, admins for reads
alter table app_error_logs enable row level security;

-- Allow service role to insert error logs (backend logging only)
create policy insert_app_errors on app_error_logs
  for insert
  to service_role
  with check (true);

-- Note: Admin access requires custom Supabase role configuration
-- This policy will need adjustment based on your admin role implementation

-- ============================================================================
-- SEED DATA
-- ============================================================================

-- Insert the predefined list of 10 European cities
-- These cities are the available destinations for trip planning
insert into cities (name) values
  ('Paris'),
  ('London'),
  ('Rome'),
  ('Barcelona'),
  ('Amsterdam'),
  ('Berlin'),
  ('Vienna'),
  ('Prague'),
  ('Lisbon'),
  ('Warsaw');
