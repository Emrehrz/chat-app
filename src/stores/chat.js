import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

export const useChatStore = defineStore('chat', () => {
  const chats = ref({})
  const activeChat = ref(null)
  const loading = ref(false)
  const error = ref(null)
  const messageSubscriptions = ref({})

  const chatList = computed(() => {
    return Object.values(chats.value).map(chat => {
      const messages = chat.messages || []
      const lastMessage = messages[messages.length - 1]
      return {
        ...chat,
        lastMessage: lastMessage ? lastMessage.text : 'Henüz mesaj yok',
        lastMessageTime: lastMessage ? lastMessage.timestamp : chat.createdAt,
        unreadCount: messages.filter(m => !m.read && m.senderId !== chat.currentUserId).length
      }
    }).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime))
  })

  async function initializeChats(currentUserId) {
    if (!currentUserId) return

    loading.value = true
    error.value = null

    try {
      if (!isSupabaseConfigured()) {
        initializeMockChats(currentUserId)
        return
      }

      const { data: chatMembers, error: fetchError } = await supabase
        .from('chat_members')
        .select('chat_id, chats(id, name, is_group, avatar_url, created_at)')
        .eq('user_id', currentUserId)

      if (fetchError) {
        console.error('Chats fetch error:', fetchError)
        initializeMockChats(currentUserId)
        return
      }

      for (const member of chatMembers) {
        if (!member.chats) continue

        const chat = member.chats
        const chatId = chat.id

        if (!chat.is_group) {
          const { data: members } = await supabase
            .from('chat_members')
            .select('user_id, profiles(username, avatar_url, status)')
            .eq('chat_id', chatId)
            .neq('user_id', currentUserId)
            .limit(1)

          if (members && members[0]?.profiles) {
            const otherUser = members[0].profiles
            chats.value[chatId] = {
              id: chatId,
              isGroup: false,
              userId: members[0].user_id,
              userName: otherUser.username,
              userAvatar: otherUser.avatar_url,
              currentUserId,
              createdAt: chat.created_at,
              messages: []
            }
          }
        } else {
          chats.value[chatId] = {
            id: chatId,
            isGroup: true,
            userName: chat.name || 'Grup Sohbeti',
            userAvatar: chat.avatar_url || 'https://ui-avatars.com/api/?name=Grup&background=00a884',
            currentUserId,
            createdAt: chat.created_at,
            messages: []
          }
        }

        await fetchChatMessages(chatId, currentUserId)
      }
    } catch (err) {
      console.error('Initialize chats error:', err)
      initializeMockChats(currentUserId)
    } finally {
      loading.value = false
    }
  }

  async function fetchChatMessages(chatId, currentUserId) {
    try {
      const { data: messages, error: messagesError } = await supabase
        .from('messages')
        .select('id, content, message_type, image_url, created_at, sender_id, profiles(username)')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true })

      if (messagesError) {
        console.error('Messages fetch error:', messagesError)
        return
      }

      if (chats.value[chatId]) {
        chats.value[chatId].messages = messages.map(msg => ({
          id: msg.id,
          senderId: msg.sender_id,
          senderName: msg.profiles?.username || 'Unknown',
          text: msg.content,
          timestamp: msg.created_at,
          read: msg.sender_id === currentUserId,
          type: msg.message_type || 'text',
          imageUrl: msg.image_url
        }))
      }
    } catch (err) {
      console.error('Fetch messages error:', err)
    }
  }

  async function sendMessage(chatId, message) {
    if (!chats.value[chatId]) return

    try {
      if (!isSupabaseConfigured()) {
        const newMessage = {
          id: `m${Date.now()}`,
          senderId: message.senderId,
          senderName: message.senderName || 'Bilinmeyen',
          text: message.text,
          timestamp: new Date().toISOString(),
          read: false,
          type: message.type || 'text',
          imageUrl: message.imageUrl || null
        }
        chats.value[chatId].messages.push(newMessage)
        return
      }

      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: message.senderId,
          content: message.text,
          message_type: message.type || 'text',
          image_url: message.imageUrl || null
        })

      if (insertError) {
        console.error('Send message error:', insertError)
      }
    } catch (err) {
      console.error('Send message error:', err)
    }
  }

  function subscribeToChat(chatId, currentUserId) {
    if (!isSupabaseConfigured() || messageSubscriptions.value[chatId]) return

    const channel = supabase
      .channel(`messages:${chatId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`
      }, async (payload) => {
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('id', payload.new.sender_id)
          .single()

        const newMessage = {
          id: payload.new.id,
          senderId: payload.new.sender_id,
          senderName: profile?.username || 'Unknown',
          text: payload.new.content,
          timestamp: payload.new.created_at,
          read: payload.new.sender_id === currentUserId,
          type: payload.new.message_type || 'text',
          imageUrl: payload.new.image_url
        }

        if (chats.value[chatId]) {
          const exists = chats.value[chatId].messages.some(m => m.id === newMessage.id)
          if (!exists) {
            chats.value[chatId].messages.push(newMessage)
          }
        }
      })
      .subscribe()

    messageSubscriptions.value[chatId] = channel
  }

  async function createOrGetChat(userId, userName, userAvatar, currentUserId) {
    try {
      if (!isSupabaseConfigured()) {
        const existingChat = Object.values(chats.value).find(chat => chat.userId === userId)
        if (existingChat) return existingChat.id

        const newChatId = userId
        chats.value[newChatId] = {
          id: newChatId,
          isGroup: false,
          userId,
          userName,
          userAvatar,
          currentUserId,
          createdAt: new Date().toISOString(),
          messages: []
        }
        return newChatId
      }

      const { data, error: rpcError } = await supabase
        .rpc('get_or_create_direct_chat', {
          user_id_1: currentUserId,
          user_id_2: userId
        })

      if (rpcError) {
        console.error('Create/get chat error:', rpcError)
        return null
      }

      const chatId = data

      if (!chats.value[chatId]) {
        chats.value[chatId] = {
          id: chatId,
          isGroup: false,
          userId,
          userName,
          userAvatar,
          currentUserId,
          createdAt: new Date().toISOString(),
          messages: []
        }
        await fetchChatMessages(chatId, currentUserId)
        subscribeToChat(chatId, currentUserId)
      }

      return chatId
    } catch (err) {
      console.error('Create chat error:', err)
      return null
    }
  }

  function setActiveChat(chatId) {
    activeChat.value = chatId
    if (chats.value[chatId]) {
      chats.value[chatId].messages.forEach(msg => {
        if (msg.senderId !== chats.value[chatId].currentUserId) {
          msg.read = true
        }
      })
    }
  }

  function getChatById(chatId) {
    return chats.value[chatId]
  }

  function initializeMockChats(currentUserId) {
    if (Object.keys(chats.value).length > 0) return

    chats.value = {
      group: {
        id: 'group',
        isGroup: true,
        userName: 'Ekip Sohbeti',
        userAvatar: 'https://ui-avatars.com/api/?name=Ekip+Sohbeti&background=00a884',
        currentUserId,
        createdAt: new Date().toISOString(),
        messages: [
          { id: 'm1', senderId: '1', senderName: 'Ahmet', text: 'Günaydın ekip! Bugün toplantı var mı?', timestamp: new Date(Date.now() - 120 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'm2', senderId: '2', senderName: 'Ayşe', text: 'Günaydın! Evet, saat 14:00\'de tasarım review var.', timestamp: new Date(Date.now() - 115 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'm3', senderId: currentUserId, senderName: 'Ben', text: 'Tamam, katılacağım. Sunum hazır mı?', timestamp: new Date(Date.now() - 110 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'm4', senderId: '3', senderName: 'Mehmet', text: 'Ben hazırladım, slides\'ları paylaşayım mı?', timestamp: new Date(Date.now() - 105 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'm5', senderId: '2', senderName: 'Ayşe', text: 'Evet lütfen, önceden bakıp hazırlanmak isterim 🙏', timestamp: new Date(Date.now() - 100 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'm6', senderId: '4', senderName: 'Zeynep', text: 'Ben de baktım, harika olmuş! Sadece 3. slide\'da küçük bir düzeltme yapabiliriz.', timestamp: new Date(Date.now() - 90 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'm7', senderId: '1', senderName: 'Ahmet', text: 'Bu arada yeni feature\'lar için API dokümantasyonunu günceller misiniz?', timestamp: new Date(Date.now() - 80 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'm8', senderId: '3', senderName: 'Mehmet', text: 'Tabii, bugün akşama kadar hallederim.', timestamp: new Date(Date.now() - 75 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'm9', senderId: currentUserId, senderName: 'Ben', text: 'Süper, teşekkürler! 👍', timestamp: new Date(Date.now() - 70 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'm10', senderId: '4', senderName: 'Zeynep', text: 'Öğlen yemeğine kim gelecek? 🍕', timestamp: new Date(Date.now() - 30 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'm11', senderId: '2', senderName: 'Ayşe', text: 'Ben varım! Nereye gidelim?', timestamp: new Date(Date.now() - 25 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'm12', senderId: '1', senderName: 'Ahmet', text: 'Yeni açılan İtalyan restoranı deneyelim mi?', timestamp: new Date(Date.now() - 20 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'm13', senderId: currentUserId, senderName: 'Ben', text: 'Olur, 12:30\'da lobby\'de buluşalım!', timestamp: new Date(Date.now() - 15 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'm14', senderId: '3', senderName: 'Mehmet', text: 'Ben de geliyorum, rezervasyon yapayım mı?', timestamp: new Date(Date.now() - 10 * 60000).toISOString(), read: false, type: 'text' },
          { id: 'm15', senderId: '4', senderName: 'Zeynep', text: 'İyi olur, 5 kişi için yapalım! 😊', timestamp: new Date(Date.now() - 5 * 60000).toISOString(), read: false, type: 'text' }
        ]
      },
      '1': {
        id: '1',
        isGroup: false,
        userId: '1',
        userName: 'Ahmet',
        userAvatar: 'https://ui-avatars.com/api/?name=Ahmet&background=4A90E2',
        currentUserId,
        createdAt: new Date(Date.now() - 180 * 60000).toISOString(),
        messages: [
          { id: 'p1', senderId: '1', senderName: 'Ahmet', text: 'Selam! Bugünkü sprint planning için notların hazır mı?', timestamp: new Date(Date.now() - 180 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'p2', senderId: currentUserId, senderName: 'Ben', text: 'Evet hazır! User story\'leri öncelik sırasına göre düzenledim.', timestamp: new Date(Date.now() - 175 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'p3', senderId: '1', senderName: 'Ahmet', text: 'Harika! Öğleden sonra gözden geçirelim mi?', timestamp: new Date(Date.now() - 170 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'p4', senderId: currentUserId, senderName: 'Ben', text: 'Tamam, 15:00\'te müsaitim.', timestamp: new Date(Date.now() - 165 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'p5', senderId: '1', senderName: 'Ahmet', text: 'Perfect, o zaman görüşürüz! 👋', timestamp: new Date(Date.now() - 160 * 60000).toISOString(), read: true, type: 'text' }
        ]
      },
      '2': {
        id: '2',
        isGroup: false,
        userId: '2',
        userName: 'Ayşe',
        userAvatar: 'https://ui-avatars.com/api/?name=Ayşe&background=E94A90',
        currentUserId,
        createdAt: new Date(Date.now() - 240 * 60000).toISOString(),
        messages: [
          { id: 'a1', senderId: '2', senderName: 'Ayşe', text: 'Merhaba! Yeni tasarım mockup\'larına baktın mı?', timestamp: new Date(Date.now() - 240 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'a2', senderId: currentUserId, senderName: 'Ben', text: 'Evet baktım, çok başarılı olmuş! Özellikle renk paleti harika. 🎨', timestamp: new Date(Date.now() - 235 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'a3', senderId: '2', senderName: 'Ayşe', text: 'Teşekkürler! Mobil görünümde bir sorun var mı sence?', timestamp: new Date(Date.now() - 230 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'a4', senderId: currentUserId, senderName: 'Ben', text: 'Yok, mobilde de mükemmel duruyor. Sadece button spacing\'i biraz artırabilirsin.', timestamp: new Date(Date.now() - 225 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'a5', senderId: '2', senderName: 'Ayşe', text: 'Güzel öneri! Şimdi düzeltiyorum. 😊', timestamp: new Date(Date.now() - 220 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'a6', senderId: '2', senderName: 'Ayşe', text: 'Bu arada yeni icon setini de paylaştım, bakar mısın?', timestamp: new Date(Date.now() - 45 * 60000).toISOString(), read: false, type: 'text' },
          { id: 'a7', senderId: '2', senderName: 'Ayşe', text: 'Figma linki: figma.com/file/abc123', timestamp: new Date(Date.now() - 40 * 60000).toISOString(), read: false, type: 'text' }
        ]
      },
      '3': {
        id: '3',
        isGroup: false,
        userId: '3',
        userName: 'Mehmet',
        userAvatar: 'https://ui-avatars.com/api/?name=Mehmet&background=4AE990',
        currentUserId,
        createdAt: new Date(Date.now() - 300 * 60000).toISOString(),
        messages: [
          { id: 'me1', senderId: currentUserId, senderName: 'Ben', text: 'Mehmet, backend API hazır mı?', timestamp: new Date(Date.now() - 300 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'me2', senderId: '3', senderName: 'Mehmet', text: 'Evet hazır! Authentication endpoint\'leri de test ettim.', timestamp: new Date(Date.now() - 295 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'me3', senderId: currentUserId, senderName: 'Ben', text: 'Süper! Dokümantasyonu da yazdın mı?', timestamp: new Date(Date.now() - 290 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'me4', senderId: '3', senderName: 'Mehmet', text: 'Tabii, Swagger\'da tüm endpoint\'leri görebilirsin.', timestamp: new Date(Date.now() - 285 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'me5', senderId: currentUserId, senderName: 'Ben', text: 'Mükemmel, teşekkürler! 🙏', timestamp: new Date(Date.now() - 280 * 60000).toISOString(), read: true, type: 'text' }
        ]
      },
      '4': {
        id: '4',
        isGroup: false,
        userId: '4',
        userName: 'Zeynep',
        userAvatar: 'https://ui-avatars.com/api/?name=Zeynep&background=E9904A',
        currentUserId,
        createdAt: new Date(Date.now() - 90 * 60000).toISOString(),
        messages: [
          { id: 'z1', senderId: '4', senderName: 'Zeynep', text: 'Selam! Test senaryolarını çalıştırdım.', timestamp: new Date(Date.now() - 90 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'z2', senderId: currentUserId, senderName: 'Ben', text: 'Nasıl geçti? Hata var mı?', timestamp: new Date(Date.now() - 85 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'z3', senderId: '4', senderName: 'Zeynep', text: 'Çoğu geçti ama login sayfasında küçük bir bug buldum.', timestamp: new Date(Date.now() - 80 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'z4', senderId: currentUserId, senderName: 'Ben', text: 'Detayları Jira\'ya yazar mısın?', timestamp: new Date(Date.now() - 75 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'z5', senderId: '4', senderName: 'Zeynep', text: 'Elbette, hemen ekliyorum. 📝', timestamp: new Date(Date.now() - 70 * 60000).toISOString(), read: true, type: 'text' },
          { id: 'z6', senderId: '4', senderName: 'Zeynep', text: 'Bu arada keyboard navigation testi de yaptım, accessibility harika! ♿', timestamp: new Date(Date.now() - 35 * 60000).toISOString(), read: false, type: 'text' },
          { id: 'z7', senderId: '4', senderName: 'Zeynep', text: 'Tebrikler ekip! 🎉', timestamp: new Date(Date.now() - 30 * 60000).toISOString(), read: false, type: 'text' }
        ]
      }
    }
  }

  return {
    chats,
    activeChat,
    chatList,
    loading,
    error,
    initializeChats,
    sendMessage,
    setActiveChat,
    getChatById,
    createOrGetChat,
    subscribeToChat
  }
})
