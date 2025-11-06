/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    user: import("@supabase/supabase-js").User;
  }
}

interface ImportMetaEnv {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_TEST_URL: string;
  readonly SUPABASE_KEY: string;
  readonly SUPABASE_PUBLIC_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  readonly E2E_USERNAME_ID: string;
  readonly E2E_USERNAME: string;
  readonly E2E_PASSWORD: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
