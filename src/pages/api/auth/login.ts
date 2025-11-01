import type { APIRoute } from "astro";

import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { loginRequestSchema } from "../../../lib/schemas/auth.schema";

export const prerender = false;

export const POST: APIRoute = async ({ request, cookies }) => {
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
    });
  }

  let requestData: unknown;
  try {
    requestData = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON in request body" }), { status: 400 });
  }

  // Validate request data
  const validationResult = loginRequestSchema.safeParse(requestData);
  if (!validationResult.success) {
    const errors = validationResult.error.flatten().fieldErrors;
    return new Response(JSON.stringify({ error: "Validation failed", errors }), {
      status: 400,
    });
  }

  const { email, password } = validationResult.data;

  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Map Supabase errors to user-friendly messages
    let userFriendlyMessage = "An error occurred during login. Please try again.";
    if (error.message.includes("Invalid login credentials")) {
      userFriendlyMessage = "Invalid email or password";
    } else if (error.message.includes("Email not confirmed")) {
      userFriendlyMessage = "Please confirm your email before logging in";
    }

    return new Response(JSON.stringify({ error: userFriendlyMessage }), {
      status: 401,
    });
  }

  return new Response(JSON.stringify({ user: data.user }), {
    status: 200,
  });
};
