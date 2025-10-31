-- Return profiles that are available to start a new direct chat with
-- Excludes the current user and any profile that already shares a direct (is_group = false) chat
-- NOTE: parameter name changed from `current_user` (reserved word) to `p_current_user`.
CREATE OR REPLACE FUNCTION public.get_available_users_for_new_chat(p_current_user UUID)
RETURNS TABLE (id UUID, username TEXT, avatar_url TEXT, status TEXT)
AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.username, p.avatar_url, p.status
  FROM public.profiles p
  WHERE p.id <> p_current_user
    AND NOT EXISTS (
      SELECT 1 FROM public.chats c
      JOIN public.chat_members cm1 ON cm1.chat_id = c.id AND cm1.user_id = p_current_user
      JOIN public.chat_members cm2 ON cm2.chat_id = c.id AND cm2.user_id = p.id
      WHERE c.is_group = false
    )
  ORDER BY p.username;
END;
$$ LANGUAGE plpgsql STABLE;

-- Grant execute to authenticated users (optional depending on your RLS setup)
GRANT EXECUTE ON FUNCTION public.get_available_users_for_new_chat(UUID) TO authenticated;
