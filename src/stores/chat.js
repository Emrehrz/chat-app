import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useChatStore = defineStore('chat', () => {
  const chats = ref({})
  const activeChat = ref(null)

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

  function initializeChats(currentUserId) {
    // Tek bir grup sohbete geçiş: Ekip Sohbeti
    if (Object.keys(chats.value).length === 0) {
      chats.value = {
        group: {
          id: 'group',
          isGroup: true,
          userName: 'Ekip Sohbeti',
          userAvatar:
            'https://ui-avatars.com/api/?name=Ekip+Sohbeti&background=00a884&color=ffffff&format=svg',
          currentUserId,
          createdAt: new Date().toISOString(),
          messages: [
            { id: 'm1', senderId: '1', senderName: 'Ahmet', text: 'Günaydın ekip! Kahve makinesi yine nazlı, kim çalıştırdı? ☕️', timestamp: new Date(Date.now() - 240 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm2', senderId: '2', senderName: 'Ayşe', text: 'Günaydın! Ben filtreyi yıkadım, şimdi akıyor. İlk bardak benden. 🙂', timestamp: new Date(Date.now() - 236 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm3', senderId: currentUserId, senderName: 'Ben', text: 'Süper, kahvemi alıp geliyorum. Bu arada kim ofiste, kim evde?', timestamp: new Date(Date.now() - 232 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm4', senderId: '3', senderName: 'Mehmet', text: 'Ben ofisteyim. İnternette sabah kısa bir dalgalanma oldu ama düzeldi.', timestamp: new Date(Date.now() - 228 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm5', senderId: '4', senderName: 'Zeynep', text: 'Evdeyim, kedim klavyeyi ele geçirmeye çalışıyor. 😺', timestamp: new Date(Date.now() - 224 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm6', senderId: '1', senderName: 'Ahmet', text: 'Dünkü maç nasıldı bu arada, izleyen oldu mu?', timestamp: new Date(Date.now() - 220 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm7', senderId: '2', senderName: 'Ayşe', text: 'İzledim, ikinci yarı güzeldi. Hakem biraz sahnedeydi ama neyse. 😂', timestamp: new Date(Date.now() - 216 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm8', senderId: currentUserId, senderName: 'Ben', text: 'Gol sevincinde kahveyi döküyordum, zor tuttum. �', timestamp: new Date(Date.now() - 212 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm9', senderId: '3', senderName: 'Mehmet', text: 'Bugün öğlen ne yapıyoruz? Makarna mı, çorba mı, dürüm mü?', timestamp: new Date(Date.now() - 208 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm10', senderId: '4', senderName: 'Zeynep', text: 'Ben dürüm diyorum. Ama yürüyüşlü bir rota olsun, hava güzel. 🌤️', timestamp: new Date(Date.now() - 204 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm11', senderId: currentUserId, senderName: 'Ben', text: 'O zaman Ofis önünden 12:30’da çıkalım. Dürümcüye yürüyelim.', timestamp: new Date(Date.now() - 200 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm12', senderId: '1', senderName: 'Ahmet', text: 'Tamam. Bu arada stand-up 10:15’te, 10 dk sonra Meet’te buluşalım.', timestamp: new Date(Date.now() - 196 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm13', senderId: '2', senderName: 'Ayşe', text: 'Geleceğim, kamerayı açmam ama saçlar felaket. 🙃', timestamp: new Date(Date.now() - 192 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm14', senderId: '3', senderName: 'Mehmet', text: 'Sorun değil, ses yeter. Zaten hızlı tur yapacağız.', timestamp: new Date(Date.now() - 188 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm15', senderId: '4', senderName: 'Zeynep', text: 'Ben 1-2 dk geç kalabilirim, kurye kapıda.', timestamp: new Date(Date.now() - 184 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm16', senderId: currentUserId, senderName: 'Ben', text: 'Tamam, 10:17 gibi başlatırım. Kim başlamak ister?', timestamp: new Date(Date.now() - 180 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm17', senderId: '1', senderName: 'Ahmet', text: 'Ben başlarım: Dün ufak refactor yaptım, testler yeşil. Bugün ufak temizlik.', timestamp: new Date(Date.now() - 176 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm18', senderId: '2', senderName: 'Ayşe', text: 'Ben de UI’daki spacing’i düzelttim. Mobil görünüm daha ferah.', timestamp: new Date(Date.now() - 172 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm19', senderId: '3', senderName: 'Mehmet', text: 'Ben logları toparladım, konsol artık gürültü yapmıyor. 🎧', timestamp: new Date(Date.now() - 168 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm20', senderId: '4', senderName: 'Zeynep', text: 'Ben onboarding için küçük bir metin turu yazdım. İlk açılışta çıkıyor.', timestamp: new Date(Date.now() - 164 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm21', senderId: currentUserId, senderName: 'Ben', text: 'Ben de bildirimlerin kayma sorununu çözdüm. Kaydırma daha akıcı.', timestamp: new Date(Date.now() - 160 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm22', senderId: '1', senderName: 'Ahmet', text: 'Öğleden sonra minik bir demo yaparız. 15:00 uygun mu?', timestamp: new Date(Date.now() - 156 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm23', senderId: '2', senderName: 'Ayşe', text: 'Uygun bende. 14:50’de linki atarım.', timestamp: new Date(Date.now() - 152 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm24', senderId: '3', senderName: 'Mehmet', text: 'Ben o zamana kadar küçük bir temizlik daha yaparım.', timestamp: new Date(Date.now() - 148 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm25', senderId: '4', senderName: 'Zeynep', text: 'Bu arada kimse printer’ı görmesin, yine trip atıyor. 😅', timestamp: new Date(Date.now() - 144 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm26', senderId: currentUserId, senderName: 'Ben', text: 'Printer’la konuşursan çalışıyor, nazlı biraz. “Hadi yaparsın.”', timestamp: new Date(Date.now() - 140 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm27', senderId: '1', senderName: 'Ahmet', text: 'Klasik ofis ekipmanı. Su ısıtıcısı bile daha stabil. 😄', timestamp: new Date(Date.now() - 136 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm28', senderId: '2', senderName: 'Ayşe', text: '12:30 yürüyüşü kesinleştirdik bu arada, kimler geliyor?', timestamp: new Date(Date.now() - 132 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm29', senderId: '3', senderName: 'Mehmet', text: 'Ben gelirim. Dürümcüye giden arka sokak daha sakin.', timestamp: new Date(Date.now() - 128 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm30', senderId: '4', senderName: 'Zeynep', text: 'Ben de geliyorum. Dönüşte bubble tea isteyen?', timestamp: new Date(Date.now() - 124 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm31', senderId: currentUserId, senderName: 'Ben', text: 'Ben alırım, yarım şekerli lütfen. 🙏', timestamp: new Date(Date.now() - 120 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm32', senderId: '1', senderName: 'Ahmet', text: 'Toplantıdan önce son bir tur; herkes iyi mi?', timestamp: new Date(Date.now() - 116 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm33', senderId: '2', senderName: 'Ayşe', text: 'İyiyim ben. Bir de “caps lock”u kapatmayı öğrendim. 😌', timestamp: new Date(Date.now() - 112 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm34', senderId: '3', senderName: 'Mehmet', text: 'Ben de monitörü silince renkler açıldı. Tavsiye ederim. 🤓', timestamp: new Date(Date.now() - 108 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm35', senderId: '4', senderName: 'Zeynep', text: 'Ofiste bitki sulama nöbeti kimdeydi? Benim fikuslar susamış gibi.', timestamp: new Date(Date.now() - 104 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm36', senderId: currentUserId, senderName: 'Ben', text: 'Bende. Öğleden önce ilgilenirim, fikuslar bizim ekipten. 🌿', timestamp: new Date(Date.now() - 100 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm37', senderId: '1', senderName: 'Ahmet', text: 'Tamamdır. Ben stand-up linkini açıyorum, 2 dk sonra gelin.', timestamp: new Date(Date.now() - 96 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm38', senderId: '2', senderName: 'Ayşe', text: 'Geliyoruz. Bu arada gitar odası bugün boş mu bilen var mı?', timestamp: new Date(Date.now() - 92 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm39', senderId: '3', senderName: 'Mehmet', text: 'Boş görünüyor. Akşam bir “Ofis Akustik” yapılır. 🎸', timestamp: new Date(Date.now() - 88 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm40', senderId: '4', senderName: 'Zeynep', text: 'Harika, ben de vokal olurum ama sadece nakaratta. 😅', timestamp: new Date(Date.now() - 84 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm41', senderId: currentUserId, senderName: 'Ben', text: 'Anlaştık, ofis içi konseri ajandaya ekliyorum. 🎶', timestamp: new Date(Date.now() - 80 * 60 * 1000).toISOString(), read: true, type: 'text' },
            { id: 'm42', senderId: '1', senderName: 'Ahmet', text: 'Tamamdır ekip, stand-up’ta görüşürüz. 🙌', timestamp: new Date(Date.now() - 76 * 60 * 1000).toISOString(), read: true, type: 'text' }
          ]
        }
      }
    }
  }

  function sendMessage(chatId, message) {
    if (!chats.value[chatId]) {
      return
    }

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
  }

  function setActiveChat(chatId) {
    activeChat.value = chatId
    if (chats.value[chatId]) {
      // Mark messages as read
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

  function createOrGetChat(userId, userName, userAvatar, currentUserId) {
    const existingChat = Object.values(chats.value).find(chat => chat.userId === userId)
    if (existingChat) {
      return existingChat.id
    }

    const newChatId = userId
    chats.value[newChatId] = {
      id: newChatId,
      userId,
      userName,
      userAvatar,
      currentUserId,
      createdAt: new Date().toISOString(),
      messages: []
    }
    return newChatId
  }

  return {
    chats,
    activeChat,
    chatList,
    initializeChats,
    sendMessage,
    setActiveChat,
    getChatById,
    createOrGetChat
  }
})
