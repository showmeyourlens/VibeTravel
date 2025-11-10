/**
 * Global Teardown for Playwright E2E Tests
 *
 * This file is executed after all tests have completed.
 * It performs database cleanup to remove test-related data.
 */

import type { Database } from "@/db/database.types";
import { SupabaseClient, createClient } from "@supabase/supabase-js";

function initializeSupabaseClient(): SupabaseClient<Database> {
  const supabaseUrl = process.env.SUPABASE_TEST_URL;
  const supabasePublicKey = process.env.SUPABASE_PUBLIC_KEY;

  if (!supabaseUrl) {
    throw new Error("SUPABASE_TEST_URL environment variable is not set");
  }

  if (!supabasePublicKey) {
    throw new Error("SUPABASE_PUBLIC_KEY environment variable is not set");
  }

  return createClient<Database>(supabaseUrl, supabasePublicKey);
}

/**
 * Authenticate with test user credentials
 * This sets the user session so that RLS policies allow data access
 */
async function authenticateTestUser(client: SupabaseClient<Database>, email: string, password: string): Promise<void> {
  const { error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(`Failed to authenticate test user: ${error.message}`);
  }
}

/**
 * Get the current authenticated user's ID
 */
async function getCurrentUserId(client: SupabaseClient<Database>): Promise<string> {
  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error || !user) {
    throw new Error(`Failed to get current user: ${error?.message || "User not found"}`);
  }

  return user.id;
}

/**
 * Delete all plans and their associated activities for the current user
 * This will cascade delete plan_activities due to foreign key constraints
 */
async function deleteAllUserPlans(client: SupabaseClient<Database>): Promise<number> {
  try {
    // Get current user
    const userId = await getCurrentUserId(client);

    // Fetch all plans for the user
    const { data: plans, error: fetchError } = await client.from("plans").select("id").eq("user_id", userId);

    if (fetchError) {
      throw new Error(`Failed to fetch user plans: ${fetchError.message}`);
    }

    if (!plans || plans.length === 0) {
      // eslint-disable-next-line no-console
      console.log("No plans found to delete");
      return 0;
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
    return planIds.length;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error during plan deletion:", error);
    throw error;
  }
}

/**
 * Clean up all test data for the current user
 * This is the main entry point for cleanup
 */
export async function cleanupTestData(email: string, password: string): Promise<void> {
  const client = initializeSupabaseClient();

  try {
    // Authenticate as the test user
    await authenticateTestUser(client, email, password);

    // eslint-disable-next-line no-console
    console.log("Authenticated as test user, starting cleanup...");

    // Delete all user plans and related data
    const deletedCount = await deleteAllUserPlans(client);

    // eslint-disable-next-line no-console
    console.log(`Cleanup completed successfully. Deleted ${deletedCount} plan(s).`);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Database cleanup failed:", error);
    throw error;
  } finally {
    // Sign out to clean up the session
    await client.auth.signOut();
  }
}

/**
 * Global teardown hook for Playwright
 * This function is called after all tests have completed
 */
export async function globalTeardown(): Promise<void> {
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
    await cleanupTestData(email, password);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Global teardown failed:", error);
    // Don't throw - allow tests to pass even if cleanup fails
    process.exit(1);
  }
}
