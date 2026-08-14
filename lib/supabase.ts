import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ydvkfwxybyzswokpknim.supabase.co";

const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_DwoyWJMwWBZnyi75Wc_lJQ_RehhhXRA";

export const supabase = createClient(supabaseUrl, supabasePublishableKey);
