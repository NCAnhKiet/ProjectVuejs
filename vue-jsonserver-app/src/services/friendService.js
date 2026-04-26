import api from './api'

export default {
  async sendFriendRequest(senderId, receiverId) {
    // Check if exists
    const existing = await api.get(`/friendRequests?senderId=${senderId}&receiverId=${receiverId}`)
    if (existing.data.length > 0) return existing.data[0]

    const response = await api.post('/friendRequests', {
      senderId,
      receiverId,
      status: 'pending',
      createdAt: new Date().toISOString()
    })
    return response.data
  },

  async getPendingRequests(userId) {
    const response = await api.get(`/friendRequests?receiverId=${userId}&status=pending`)
    return response.data
  },

  async getSentRequests(userId) {
    const response = await api.get(`/friendRequests?senderId=${userId}&status=pending`)
    return response.data
  },

  async acceptRequest(requestId) {
    return await api.patch(`/friendRequests/${requestId}`, { status: 'accepted' })
  },

  async rejectRequest(requestId) {
    return await api.patch(`/friendRequests/${requestId}`, { status: 'rejected' })
  },

  async getFriends(userId) {
    const [sent, received] = await Promise.all([
      api.get(`/friendRequests?senderId=${userId}&status=accepted`),
      api.get(`/friendRequests?receiverId=${userId}&status=accepted`)
    ])
    
    const friendIds = [
      ...sent.data.map(r => r.receiverId),
      ...received.data.map(r => r.senderId)
    ]
    
    const users = await api.get('/users')
    return users.data.filter(u => friendIds.includes(String(u.id)))
  },

  async checkFriendship(user1Id, user2Id) {
    const response = await api.get(`/friendRequests`)
    const data = response.data
    const request = data.find(r => 
      (String(r.senderId) === String(user1Id) && String(r.receiverId) === String(user2Id)) ||
      (String(r.senderId) === String(user2Id) && String(r.receiverId) === String(user1Id))
    )
    return request || null
  }
}
