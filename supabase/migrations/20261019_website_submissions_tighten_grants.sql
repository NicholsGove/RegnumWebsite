-- Hide the tables from signed-out visitors entirely and limit signed-in users
-- to reading and updating (row level security still decides which rows).
revoke all on public.submissions from anon;
revoke all on public.website_admins from anon;
revoke insert, delete, truncate, references, trigger on public.submissions from authenticated;
revoke insert, update, delete, truncate, references, trigger on public.website_admins from authenticated;
revoke execute on function public.is_website_admin() from public, anon;
