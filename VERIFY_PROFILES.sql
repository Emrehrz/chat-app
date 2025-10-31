-- Verify that all chat members have valid profiles
-- Kullanıcı ID: 278f3971-ebe5-47d8-b513-793e0eb3cecb

-- Check if all chat members have profiles
SELECT 
  cm.chat_id,
  cm.user_id,
  p.username,
  p.avatar_url,
  CASE 
    WHEN p.id IS NULL THEN 'PROFILE MISSING'
    WHEN p.username IS NULL THEN 'USERNAME NULL'
    ELSE 'OK'
  END as status
FROM public.chat_members cm
LEFT JOIN public.profiles p ON p.id = cm.user_id
WHERE cm.chat_id IN (
  SELECT chat_id FROM public.chat_members 
  WHERE user_id = '278f3971-ebe5-47d8-b513-793e0eb3cecb'
)
ORDER BY cm.chat_id, cm.user_id;

-- Count profiles by status
SELECT 
  CASE 
    WHEN p.id IS NULL THEN 'PROFILE MISSING'
    WHEN p.username IS NULL THEN 'USERNAME NULL'
    ELSE 'OK'
  END as status,
  COUNT(*) as count
FROM public.chat_members cm
LEFT JOIN public.profiles p ON p.id = cm.user_id
WHERE cm.chat_id IN (
  SELECT chat_id FROM public.chat_members 
  WHERE user_id = '278f3971-ebe5-47d8-b513-793e0eb3cecb'
)
GROUP BY status;
