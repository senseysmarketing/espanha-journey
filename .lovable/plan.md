

## Bug Fix + Supabase Setup Plan

### 1. Bug: "Começar" button not clickable

**Root cause:** In `OnboardingFlow.tsx`, the gradient overlay div (line 71) is `absolute inset-0` and sits above the content `motion.div` (line 74) in the stacking context. The content div lacks `relative z-10`, so the overlay intercepts all pointer events.

**Fix:** Add `relative z-10` to the `motion.div` wrapper (line 80) so it renders above the overlay.

### 2. Supabase Database Schema

Create the four core tables via migration:

- **profiles** — `id (uuid PK)`, `user_id (uuid, unique, NOT NULL)`, `citizenship_status (text)`, `entry_date (date)`, `selected_profile (text)`, `created_at`, `updated_at`
- **documents** — `id (uuid PK)`, `user_id (uuid, NOT NULL)`, `type (text)`, `name (text)`, `expiry_date (date)`, `file_url (text)`, `status (text default 'pending')`, `created_at`
- **travel_logs** — `id (uuid PK)`, `user_id (uuid, NOT NULL)`, `departure_date (date)`, `return_date (date)`, `destination (text)`, `created_at`
- **journey_milestones** — `id (uuid PK)`, `user_id (uuid, NOT NULL)`, `milestone_name (text)`, `status (text default 'pending')`, `updated_at`, `created_at`

All tables will have RLS enabled with policies allowing authenticated users to manage only their own rows.

A `handle_new_user` trigger on `auth.users` will auto-create a profile row on signup.

### 3. Storage Bucket

Create a `documents` storage bucket for passport/TIE uploads with RLS policies scoped to the user's folder.

### Technical Details

- Migration SQL will use `gen_random_uuid()` for PKs and `now()` for timestamps
- RLS policies: `auth.uid() = user_id` for all CRUD operations
- The trigger function uses `SECURITY DEFINER` to insert into the profiles table
- No auth UI will be added in this step (just the schema foundation)

