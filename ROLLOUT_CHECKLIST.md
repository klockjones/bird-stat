# Bird Stat Rollout Checklist

This document is the staged rollout guide for migrating the current MVP to:

- Supabase (Auth + Postgres + Storage)
- Next.js
- GitHub
- Vercel

The rollout rule is strict:

1. Complete one step.
2. Cross-check it.
3. Only move to the next step if the current step is confirmed healthy.

---

## Step 1. Create Supabase project

### Do
- Create a new Supabase project dedicated to this app.
- Choose a region close to the real users.
- Save the database password somewhere safe.
- Open Project Settings and locate:
  - Project URL
  - Publishable/Anon key
- Decide whether email auth is enabled.

### Do not
- Do not share account password.
- Do not share service role / secret key.
- Do not mix this project with another existing production database.
- Do not choose a random region without thinking about your users.

### Cross-check
- Project opens normally in Supabase dashboard.
- Project URL is visible.
- Publishable/Anon key is visible.
- Email auth setting is understood.

### Required handoff to continue
- Project URL
- Publishable/Anon key
- Region used
- Auth mode decision

---

## Step 2. Create SQL schema and RLS

### Do
- Create `profiles`, `entries`, and `entry_photos`.
- Enable RLS on all application tables.
- Apply policies for:
  - authenticated users can read all entries
  - users can insert only with `user_id = auth.uid()`
  - users can update/delete only their own records
- Add `updated_at` trigger.

### Do not
- Do not leave insert/update/delete broadly open.
- Do not store user ownership from client-entered values.
- Do not skip testing with a real logged-in user.

### Cross-check
- Authenticated select works.
- Own insert works.
- Other-user update/delete is blocked.

---

## Step 3. Create Storage bucket and policies

### Do
- Create private bucket `entry-photos`.
- Use file path pattern `{user_id}/{yyyy-mm}/{uuid}.jpg`.
- Allow upload/delete only in the user's own folder.
- Decide photo access style:
  - authenticated read for all
  - or signed URLs

### Do not
- Do not use public bucket unless you intentionally want public images.
- Do not keep original phone filenames.
- Do not upload full-resolution originals by default.

### Cross-check
- User can upload to own folder.
- User cannot upload to another user's folder.
- Image retrieval method is confirmed.

---

## Step 4. Create Next.js app

### Do
- Use Next.js App Router.
- Use TypeScript.
- Add `.env.local` with:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Create shared Supabase client utilities.
- Create basic routes:
  - `/login`
  - `/dashboard`
  - `/entries/new`

### Do not
- Do not put secret keys in `NEXT_PUBLIC_*` variables.
- Do not mix App Router and old Pages Router examples carelessly.
- Do not add many UI libraries before auth/data flow works.

### Cross-check
- App starts locally.
- Env values load correctly.
- Supabase client initializes without runtime errors.

---

## Step 5. Connect Supabase Auth

### Do
- Start with email auth.
- Confirm login and logout work.
- Read `auth.uid()` after login.
- Auto-create `profiles` row after signup.
- Redirect unauthenticated users away from protected routes.

### Do not
- Do not trust client-provided `user_id`.
- Do not allow protected writes without session checks.
- Do not skip testing a brand-new user signup path.

### Cross-check
- Signup works.
- Login works.
- Session persists.
- `profiles` row exists.

---

## Step 6. Build record create/list screens

### Do
- Create records with `user_id = auth.uid()`.
- Compute `end_stock` from inputs.
- Show all entries to authenticated users.
- Show writer display name.
- Group by date.
- Compress images before upload.
- Limit images per entry (recommended: 3 max).

### Do not
- Do not upload original mobile images without compression.
- Do not let the UI decide ownership arbitrarily.
- Do not couple image upload success and DB save without error handling.

### Cross-check
- Record create works.
- All authenticated users can view records.
- Only owner can edit/delete.
- Photos upload and render correctly.

---

## Step 7. Connect GitHub

### Do
- Create or connect repository.
- Confirm `.env.local` is ignored.
- Add README and basic scripts.
- Keep branch strategy simple.
- Add light CI only if needed (lint/build).

### Do not
- Do not commit secrets.
- Do not overbuild CI before the app is stable.
- Do not store Supabase secret keys in repo.

### Cross-check
- Code pushed to GitHub.
- No secret files tracked.
- Local build still passes.

---

## Step 8. Deploy to Vercel

### Do
- Import GitHub repo into Vercel.
- Add environment variables in Vercel.
- Set production branch intentionally.
- Test preview deployment first.
- Test mobile login, create, list, and photo upload.

### Do not
- Do not deploy without env configuration.
- Do not expose service role keys.
- Do not treat first successful build as final validation.

### Cross-check
- Preview deployment works.
- Production deployment works.
- Auth works in deployed environment.
- CRUD works in deployed environment.
- Image upload works in deployed environment.
