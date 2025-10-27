import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUsersStore = defineStore('users', () => {
  const users = ref([
    {
      id: '1',
      username: 'Ahmet',
      avatar: 'https://ui-avatars.com/api/?name=Ahmet&background=4A90E2',
      status: 'online'
    },
    {
      id: '2',
      username: 'Ayşe',
      avatar: 'https://ui-avatars.com/api/?name=Ayşe&background=E94A90',
      status: 'online'
    },
    {
      id: '3',
      username: 'Mehmet',
      avatar: 'https://ui-avatars.com/api/?name=Mehmet&background=4AE990',
      status: 'offline'
    },
    {
      id: '4',
      username: 'Zeynep',
      avatar: 'https://ui-avatars.com/api/?name=Zeynep&background=E9904A',
      status: 'online'
    }
  ])

  function getUserById(id) {
    return users.value.find(user => user.id === id)
  }

  function getUserByUsername(username) {
    return users.value.find(user => user.username.toLowerCase() === username.toLowerCase())
  }

  return { users, getUserById, getUserByUsername }
})
