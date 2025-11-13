/**
 * Global Teardown for Playwright E2E Tests
 *
 * This file is executed after all tests have completed.
 * It performs database cleanup to remove test-related data.
 */

import type { Database } from "@/db/database.types";
import { createClient } from "@supabase/supabase-js";

/**
 * Global teardown hook for Playwright
 * This function is called after all tests have completed
 */
export default async function globalTeardown(): Promise<void> {
  const email = process.env.E2E_USERNAME;
  const password = process.env.E2E_PASSWORD;

  if (!email || !password) {
    // eslint-disable-next-line no-console
    console.warn("E2E_USERNAME or E2E_PASSWORD not set, skipping database cleanup");
    return;
  }

  try {
    // eslint-disable-next-line no-console
    console.log("Starting global teardown - cleaning up test data...");

    // Initialize Supabase client
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabasePublicKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl) {
      throw new Error("SUPABASE_URL environment variable is not set");
    }

    if (!supabasePublicKey) {
      throw new Error("SUPABASE_KEY environment variable is not set");
    }

    const client = createClient<Database>(supabaseUrl, supabasePublicKey);

    try {
      // Authenticate with test user credentials
      const { error: authError } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(`Failed to authenticate test user: ${authError.message}`);
      }

      // eslint-disable-next-line no-console
      console.log("Authenticated as test user, starting cleanup...");

      // Get the current authenticated user's ID
      const {
        data: { user },
        error: userError,
      } = await client.auth.getUser();

      if (userError || !user) {
        throw new Error(`Failed to get current user: ${userError?.message || "User not found"}`);
      }

      const userId = user.id;

      // Fetch all plans for the user
      const { data: plans, error: fetchError } = await client.from("plans").select("id").eq("user_id", userId);

      if (fetchError) {
        throw new Error(`Failed to fetch user plans: ${fetchError.message}`);
      }

      if (!plans || plans.length === 0) {
        // eslint-disable-next-line no-console
        console.log("No plans found to delete");
        // eslint-disable-next-line no-console
        console.log("Cleanup completed successfully. Deleted 0 plan(s).");
        return;
      }

      const planIds = plans.map((plan) => plan.id);

      // Delete plan_activities first (to avoid issues even though FK should handle it)
      const { error: activitiesError } = await client.from("plan_activities").delete().in("plan_id", planIds);

      if (activitiesError) {
        throw new Error(`Failed to delete plan activities: ${activitiesError.message}`);
      }

      // Delete plan_feedback
      const { error: feedbackError } = await client.from("plan_feedback").delete().in("plan_id", planIds);

      if (feedbackError) {
        throw new Error(`Failed to delete plan feedback: ${feedbackError.message}`);
      }

      // Delete the plans themselves
      const { error: plansError } = await client.from("plans").delete().in("id", planIds);

      if (plansError) {
        throw new Error(`Failed to delete plans: ${plansError.message}`);
      }

      // eslint-disable-next-line no-console
      console.log(`Successfully deleted ${planIds.length} plan(s) and associated data`);
      // eslint-disable-next-line no-console
      console.log(`Cleanup completed successfully. Deleted ${planIds.length} plan(s).`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Error during cleanup:", error);
      throw error;
    } finally {
      // Sign out to clean up the session
      await client.auth.signOut();
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Global teardown failed:", error);
    // Don't throw - allow tests to pass even if cleanup fails
    process.exit(1);
  }
}
