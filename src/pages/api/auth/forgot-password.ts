import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { forgotPasswordRequestSchema } from "../../../lib/schemas/auth.schema";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const { request, cookies } = context;
  const supabase = createSupabaseServerInstance({ headers: request.headers, cookies });
  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400 });
  }

  const validation = forgotPasswordRequestSchema.safeParse(body);

  if (!validation.success) {
    return new Response(JSON.stringify({ error: validation.error.flatten() }), { status: 400 });
  }

  const { email } = validation.data;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${new URL(request.url).origin}/update-password`,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: "Password recovery email sent" }), { status: 200 });
};
