-- 1. Sign up as the owner using the website's student registration form.
-- 2. In Supabase Dashboard -> Authentication -> Users, copy your user UUID.
-- 3. Replace the UUID below and run this SQL once. Do not expose the owner account.
insert into public.admin_users(user_id,role)
values ('PASTE_AUTH_USER_UUID_HERE','owner')
on conflict(user_id) do update set role='owner';
