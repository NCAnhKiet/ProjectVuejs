import api from './api'

export default {
  // Get all messages between current user and another user
  async getChatHistory(userId, otherUserId) {
    if (!userId || !otherUserId) return []
    const response = await api.get(`/messages`)
    const data = Array.isArray(response.data) ? response.data : []
    
    const filtered = data.filter(m => 
      (String(m.senderId) === String(userId) && String(m.receiverId) === String(otherUserId)) || 
      (String(m.senderId) === String(otherUserId) && String(m.receiverId) === String(userId))
    )
    
    // Sort by createdAt asc
    return filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
  },

  // Get list of conversations for a user
  async getConversations(userId) {
    if (!userId) return []
    const response = await api.get(`/messages`)
    const data = Array.isArray(response.data) ? response.data : []
    
    // Group messages by conversation (otherId)
    const groups = {}
    data.forEach(m => {
      const isSender = String(m.senderId) === String(userId)
      const isReceiver = String(m.receiverId) === String(userId)
      
      if (isSender || isReceiver) {
        const otherId = isSender ? m.receiverId : m.senderId
        if (!groups[otherId]) {
          groups[otherId] = {
            otherId,
            messages: [],
            unreadCount: 0
          }
        }
        groups[otherId].messages.push(m)
        if (isReceiver && !m.isRead) {
          groups[otherId].unreadCount++
        }
      }
    })
    
    // Transform to array and find last message for each
    const conversations = Object.values(groups).map(group => {
      const sortedMsgs = group.messages.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      return {
        otherId: group.otherId,
        lastMessage: sortedMsgs[0],
        unreadCount: group.unreadCount
      }
    })
    
    // Sort conversations by last message time DESC
    return conversations.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt))
  },

  // Send a new message
  async sendMessage(messageData) {
    const response = await api.post('/messages', {
      ...messageData,
      createdAt: new Date().toISOString(),
      isRead: false
    })
    return response.data
  },

  // Edit a message
  async editMessage(messageId, newContent) {
    return await api.patch(`/messages/${messageId}`, { 
      content: newContent,
      isEdited: true 
    })
  },

  // Unsend a message (Messenger style)
  async unsendMessage(messageId) {
    return await api.patch(`/messages/${messageId}`, { 
      content: 'Tin nhắn đã được thu hồi',
      isUnsent: true 
    })
  },

  // Delete a message (Physical delete - optional, we'll use unsend mostly)
  async deleteMessage(messageId) {
    return await api.delete(`/messages/${messageId}`)
  },

  // Mark message as read
  async markAsRead(messageId) {
    return await api.patch(`/messages/${messageId}`, { isRead: true })
  },

  // Get all messages for a user (for notifications)
  async getAllMessages(userId) {
    if (!userId) return []
    const response = await api.get(`/messages`)
    const data = Array.isArray(response.data) ? response.data : []
    return data.filter(m => String(m.senderId) === String(userId) || String(m.receiverId) === String(userId))
  }
}
