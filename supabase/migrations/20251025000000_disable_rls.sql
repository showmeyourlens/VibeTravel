-- Migration: Disable Row Level Security
-- Purpose: Turn off RLS on all tables for development/testing purposes
-- Tables Affected: cities, plans, plan_activities, plan_feedback, llm_error_logs, app_error_logs

-- ============================================================================
-- DISABLE ROW LEVEL SECURITY
-- ============================================================================

-- TODO: Remove this migration after authentication is implemented 

-- Disable RLS on cities table
alter table cities disable row level security;

-- Disable RLS on plans table
alter table plans disable row level security;

-- Disable RLS on plan_activities table
alter table plan_activities disable row level security;

-- Disable RLS on plan_feedback table
alter table plan_feedback disable row level security;

-- Disable RLS on llm_error_logs table
alter table llm_error_logs disable row level security;

-- Disable RLS on app_error_logs table
alter table app_error_logs disable row level security;
