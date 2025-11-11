import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../db/supabase.client";
import { updatePasswordRequestSchema } from "../../../lib/schemas/auth.schema";

export const prerender = false;

export const POST: APIRoute = async (context) => {
  const { request, cookies } = context;
  const supabase = createSupabaseServerInstance({ headers: request.headers, cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), { status: 400 });
  }

  const validation = updatePasswordRequestSchema.safeParse(body);

  if (!validation.success) {
    const { fieldErrors: errors } = validation.error.flatten();
    return new Response(JSON.stringify({ errors }), { status: 400 });
  }

  const { newPassword } = validation.data;

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: "Password updated successfully" }), { status: 200 });
};
