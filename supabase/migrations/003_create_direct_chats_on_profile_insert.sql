-- Create direct chats between newly created profile and all existing profiles
-- This uses the existing get_or_create_direct_chat RPC to avoid duplicates.
CREATE OR REPLACE FUNCTION public.create_direct_chats_for_new_profile()
RETURNS TRIGGER AS $$
DECLARE
  other_profile RECORD;
BEGIN
  -- For every existing profile, create (or get) a direct chat between NEW and that profile
  FOR other_profile IN SELECT id FROM public.profiles WHERE id <> NEW.id LOOP
    -- get_or_create_direct_chat already avoids creating duplicates
    PERFORM public.get_or_create_direct_chat(NEW.id, other_profile.id);
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger that fires after a profile is inserted
DROP TRIGGER IF EXISTS on_profile_created_create_chats ON public.profiles;
CREATE TRIGGER on_profile_created_create_chats
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_direct_chats_for_new_profile();
