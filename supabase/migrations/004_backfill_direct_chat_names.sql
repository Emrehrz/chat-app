-- Backfill migration: set chat.name and avatar_url for existing direct chats
-- This will update direct chats (is_group = false) where name IS NULL
-- by using the member usernames concatenated (e.g. "alice, bob").

BEGIN;

-- Update name to "username1, username2" for direct chats with NULL name
UPDATE public.chats
SET name = sub.usernames,
    avatar_url = sub.avatar
FROM (
  SELECT cm.chat_id,
         string_agg(p.username, ', ' ORDER BY p.username) AS usernames,
         -- choose the first non-null avatar (if any) as a simple chat avatar
         (array_remove(array_agg(p.avatar_url ORDER BY p.username), NULL))[1] AS avatar
  FROM public.chat_members cm
  JOIN public.profiles p ON p.id = cm.user_id
  GROUP BY cm.chat_id
) AS sub
WHERE public.chats.id = sub.chat_id
  AND public.chats.is_group = false
  AND public.chats.name IS NULL;

COMMIT;

-- Note: Run this migration in Supabase SQL editor or via CLI. It will set a readable
-- `name` for existing direct chats. If you prefer a different naming (e.g. only the
-- other participant's username relative to the creator), we can adjust the query.
