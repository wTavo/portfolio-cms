/**
 * @file env.d.ts
 * @description Extensiones de tipado global para Astro.locals.
 */

/// <reference path="../.astro/types.d.ts" />

type SupabaseClient = import('@supabase/supabase-js').SupabaseClient<import('./lib/supabase/types').Database>;
type GuardUser = import('./lib/guards/auth.guard').GuardUser;

declare namespace App {
  interface Locals {
    supabase: SupabaseClient;
    user: GuardUser | null;
  }
}
