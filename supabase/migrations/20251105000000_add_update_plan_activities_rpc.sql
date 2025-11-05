-- Migration: Add transactional RPC function for updating plan activities
-- Purpose: Provide atomic updates to plan activities with proper error handling
-- This function ensures data consistency by executing all activity updates within a single transaction

CREATE OR REPLACE FUNCTION public.update_plan_activities(
  p_plan_id uuid,
  p_activities jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_activity record;
  v_plan_exists boolean;
BEGIN
  -- Step 1: Authorize the user - Verify plan exists and belongs to the current authenticated user
  SELECT EXISTS(
    SELECT 1
    FROM public.plans
    WHERE id = p_plan_id AND user_id = auth.uid()
  ) INTO v_plan_exists;

  IF NOT v_plan_exists THEN
    RAISE EXCEPTION 'User is not authorized to update this plan or plan does not exist';
  END IF;

  -- Step 2: Iterate through the provided activities and update them transactionally
  -- The jsonb_to_recordset function unnests the JSON array into rows
  FOR v_activity IN
    SELECT
      (item->>'id')::uuid as id,
      (item->>'dayNumber')::int as day_number,
      (item->>'position')::int as position
    FROM jsonb_array_elements(p_activities) as item
  LOOP
    UPDATE public.plan_activities
    SET
      day_number = v_activity.day_number,
      position = v_activity.position
      -- Note: updated_at is automatically set by the trigger
    WHERE
      id = v_activity.id AND plan_id = p_plan_id;

    -- Verify the activity was actually updated (exists and belongs to the plan)
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Activity % not found or does not belong to this plan', v_activity.id;
    END IF;
  END LOOP;

  -- Step 3: Update the parent plan's timestamp to reflect the change
  UPDATE public.plans
  SET updated_at = now()
  WHERE id = p_plan_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.update_plan_activities(uuid, jsonb) TO authenticated;

