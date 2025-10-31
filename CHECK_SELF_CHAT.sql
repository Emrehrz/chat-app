-- Check if user has a chat with themselves
-- Kullanıcı ID: 278f3971-ebe5-47d8-b513-793e0eb3cecb

-- Find chats where user appears twice (self-chat)
SELECT 
  c.id as chat_id,
  c.name,
  c.is_group,
  COUNT(cm.user_id) as member_count,
  array_agg(cm.user_id) as member_ids
FROM public.chats c
JOIN public.chat_members cm ON cm.chat_id = c.id
WHERE c.id IN (
  SELECT chat_id FROM public.chat_members 
  WHERE user_id = '278f3971-ebe5-47d8-b513-793e0eb3cecb'
)
GROUP BY c.id, c.name, c.is_group
HAVING COUNT(cm.user_id) = 1;  -- Only one member means self-chat

-- Alternative: Check if user_id appears twice in same chat
SELECT 
  chat_id,
  COUNT(*) as occurrence_count
FROM public.chat_members
WHERE user_id = '278f3971-ebe5-47d8-b513-793e0eb3cecb'
GROUP BY chat_id
HAVING COUNT(*) > 1;
