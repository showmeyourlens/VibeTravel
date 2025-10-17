# Database Schema Plan

## 1. Tables

### Enum Types
```sql
CREATE TYPE trip_intensity_enum AS ENUM ('full day', 'half day');
CREATE TYPE plan_status_enum AS ENUM ('draft', 'active', 'archived');
CREATE TYPE log_severity_enum AS ENUM ('debug', 'info', 'warning', 'error', 'critical');
```

### cities
- id UUID PRIMARY KEY DEFAULT gen_random_uuid()
- name TEXT NOT NULL UNIQUE

### plans
- id UUID PRIMARY KEY DEFAULT gen_random_uuid()
- user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- city_id UUID NOT NULL REFERENCES cities(id)
- duration_days INT NOT NULL CHECK (duration_days >= 1 AND duration_days <= 5)
- trip_intensity trip_intensity_enum NOT NULL
- wizard_notes TEXT
- status plan_status_enum NOT NULL DEFAULT 'active'
- is_archived BOOLEAN NOT NULL DEFAULT false
- created_at TIMESTAMPTZ NOT NULL DEFAULT now()
- updated_at TIMESTAMPTZ NOT NULL DEFAULT now()

### plan_activities
- id UUID PRIMARY KEY DEFAULT gen_random_uuid()
- plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE
- day_number INT NOT NULL CHECK (day_number >= 1)
- name TEXT NOT NULL
- latitude DOUBLE PRECISION
- longitude DOUBLE PRECISION
- notes TEXT
- created_at TIMESTAMPTZ NOT NULL DEFAULT now()
- updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
- UNIQUE (plan_id, day_number, position)
- [Enforce day_number <= duration_days via trigger]

### plan_feedback
- id UUID PRIMARY KEY DEFAULT gen_random_uuid()
- plan_id UUID NOT NULL REFERENCES plans(id) ON DELETE CASCADE
- user_id UUID NOT NULL REFERENCES auth.users(id)
- helpful BOOLEAN NOT NULL
- created_at TIMESTAMPTZ NOT NULL DEFAULT now()
- UNIQUE (plan_id, user_id)

### llm_error_logs
- id UUID PRIMARY KEY DEFAULT gen_random_uuid()
- occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
- user_id UUID REFERENCES auth.users(id)
- plan_id UUID REFERENCES plans(id)
- message TEXT NOT NULL
- request_payload JSONB
- response_payload JSONB

### app_error_logs
- id UUID PRIMARY KEY DEFAULT gen_random_uuid()
- occurred_at TIMESTAMPTZ NOT NULL DEFAULT now()
- user_id UUID REFERENCES auth.users(id)
- plan_id UUID REFERENCES plans(id)
- severity log_severity_enum NOT NULL
- message TEXT NOT NULL
- stack_trace TEXT
- payload JSONB

## 2. Relationships

- auth.users (1) — (N) plans
- cities (1) — (N) plans
- plans (1) — (N) plan_activities
- plans (1) — (N) plan_feedback
- plans (1) — (N) llm_error_logs
- auth.users (1) — (N) plan_feedback
- auth.users (1) — (N) llm_error_logs, app_error_logs

## 3. Indexes
```sql
CREATE INDEX idx_plans_user_created ON plans(user_id, created_at DESC);
CREATE INDEX idx_activities_plan_day_pos ON plan_activities(plan_id, day_number, position);
CREATE INDEX idx_llm_logs_user_time ON llm_error_logs(user_id, occurred_at DESC);
CREATE INDEX idx_app_logs_user_time ON app_error_logs(user_id, occurred_at DESC);
CREATE INDEX idx_app_logs_severity_time ON app_error_logs(severity, occurred_at DESC);
```

## 4. PostgreSQL Policies (Row-Level Security)
```sql
-- plans
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY select_own_plans ON plans FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY insert_own_plans ON plans FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY update_own_plans ON plans FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY delete_own_plans ON plans FOR DELETE USING (auth.uid() = user_id);

-- plan_activities
ALTER TABLE plan_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY manage_own_activities ON plan_activities
  FOR ALL
  USING (auth.uid() = (SELECT user_id FROM plans WHERE id = plan_activities.plan_id))
  WITH CHECK (auth.uid() = (SELECT user_id FROM plans WHERE id = plan_activities.plan_id));

-- plan_feedback
ALTER TABLE plan_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY manage_own_feedback ON plan_feedback FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- llm_error_logs
ALTER TABLE llm_error_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY insert_llm_errors ON llm_error_logs FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY select_llm_errors ON llm_error_logs FOR SELECT USING (auth.role() = 'admin');

-- app_error_logs
ALTER TABLE app_error_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY insert_app_errors ON app_error_logs FOR INSERT WITH CHECK (auth.role() = 'service_role');
CREATE POLICY select_app_errors ON app_error_logs FOR SELECT USING (auth.role() = 'admin');
```

## 5. Additional Notes

- The `cities` table is seeded via initial migration with the predefined list of 10 European cities.
- A database trigger enforces `plan_activities.day_number <= plans.duration_days`.
- `auth.users` is managed by Supabase; we reference it for all user-related foreign keys.
- `is_archived` flag replaces audit log table for simple soft-deletion of plans.
