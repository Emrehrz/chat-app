-- Debug Queries for ChatsView Issue
-- Kullanıcı ID: 278f3971-ebe5-47d8-b513-793e0eb3cecb

-- 1. Kullanıcının tüm chat_members kayıtlarını göster
SELECT 
  cm.id,
  cm.chat_id,
  cm.user_id,
  c.id as chat_table_id,
  c.name,
  c.is_group,
  c.avatar_url,
  c.created_at
FROM public.chat_members cm
LEFT JOIN public.chats c ON c.id = cm.chat_id
WHERE cm.user_id = '278f3971-ebe5-47d8-b513-793e0eb3cecb'
ORDER BY c.created_at DESC;

-- 2. Her bir chat'in üye sayısını kontrol et
SELECT 
  c.id,
  c.name,
  c.is_group,
  COUNT(cm.user_id) as member_count
FROM public.chats c
JOIN public.chat_members cm ON cm.chat_id = c.id
WHERE c.id IN (
  SELECT chat_id FROM public.chat_members 
  WHERE user_id = '278f3971-ebe5-47d8-b513-793e0eb3cecb'
)
GROUP BY c.id, c.name, c.is_group;

-- 3. İkili sohbetlerde diğer kullanıcının profil bilgilerini kontrol et
SELECT 
  c.id as chat_id,
  c.name as chat_name,
  cm.user_id,
  p.username,
  p.avatar_url,
  p.status
FROM public.chats c
JOIN public.chat_members cm ON cm.chat_id = c.id
LEFT JOIN public.profiles p ON p.id = cm.user_id
WHERE c.is_group = false
  AND c.id IN (
    SELECT chat_id FROM public.chat_members 
    WHERE user_id = '278f3971-ebe5-47d8-b513-793e0eb3cecb'
  )
  AND cm.user_id <> '278f3971-ebe5-47d8-b513-793e0eb3cecb'
ORDER BY c.created_at DESC;

-- 4. NULL name olan chat'leri bul
SELECT 
  id,
  name,
  is_group,
  created_at
FROM public.chats
WHERE id IN (
  SELECT chat_id FROM public.chat_members 
  WHERE user_id = '278f3971-ebe5-47d8-b513-793e0eb3cecb'
)
AND name IS NULL;

-- 5. Frontend'in kullandığı exact query'yi test et (nested select)
SELECT 
  cm.chat_id,
  jsonb_build_object(
    'id', c.id,
    'name', c.name,
    'is_group', c.is_group,
    'avatar_url', c.avatar_url,
    'created_at', c.created_at
  ) as chats
FROM public.chat_members cm
LEFT JOIN public.chats c ON c.id = cm.chat_id
WHERE cm.user_id = '278f3971-ebe5-47d8-b513-793e0eb3cecb';
