'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Message = {
  id: string
  sender_id: string
  content: string
  created_at: string
}

type Conversation = {
  id: string
  family_id: string
  provider_id: string
  last_message: string
  last_message_at: string
  family_unread: number
  provider_unread: number
  provider_profiles: {
    id: string
    display_name: string
    location_city: string
    location_state: string
  }
}

export default function MessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const providerId = searchParams.get('provider')
  const supabase = createClient()

  const [userId, setUserId] = useState('')
  const [familyProfileId, setFamilyProfileId] = useState('')
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeConversation, setActiveConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)

      const { data: family } = await supabase
        .from('family_profiles')
        .select('id')
        .eq('user_id', user.id)
        .single()

      if (family) {
        setFamilyProfileId(family.id)
        await loadConversations(family.id)

        // If coming from search with a provider, start conversation
        if (providerId) {
          await startOrOpenConversation(family.id, providerId, user.id)
        }
      }
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function loadConversations(familyId: string) {
    const { data } = await supabase
      .from('conversations')
      .select(`
        *,
        provider_profiles (
          id, display_name, location_city, location_state
        )
      `)
      .eq('family_id', familyId)
      .order('last_message_at', { ascending: false })

    if (data) setConversations(data)
  }

  async function startOrOpenConversation(familyId: string, provId: string, uid: string) {
    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('family_id', familyId)
      .eq('provider_id', provId)
      .single()

    if (existing) {
      setActiveConversation(existing.id)
      await loadMessages(existing.id)
      return
    }

    // Create new conversation
    const { data: newConv } = await supabase
      .from('conversations')
      .insert({ family_id: familyId, provider_id: provId })
      .select()
      .single()

    if (newConv) {
      setActiveConversation(newConv.id)
      await loadConversations(familyId)
    }
  }

  async function loadMessages(conversationId: string) {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (data) setMessages(data)
  }

  async function selectConversation(convId: string) {
    setActiveConversation(convId)
    await loadMessages(convId)
  }

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !activeConversation || sending) return

    setSending(true)
    const { error } = await supabase
      .from('messages')
      .insert({
        conversation_id: activeConversation,
        sender_id: userId,
        content: newMessage.trim(),
      })

    if (!error) {
      setNewMessage('')
      await loadMessages(activeConversation)
      await loadConversations(familyProfileId)
    }
    setSending(false)
  }

  const activeConv = conversations.find(c => c.id === activeConversation)

  if (loading) return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center">
      <div className="animate-spin w-6 h-6 border-2 border-[#C8372D] border-t-transparent rounded-full"/>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col">

      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">NiHao Care</span>
          <span className="text-xs bg-[#C8372D] text-white px-2 py-0.5 rounded">你好</span>
        </Link>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900">
          ← Dashboard
        </Link>
      </nav>

      <div className="flex flex-1 max-w-5xl mx-auto w-full px-6 py-6 gap-4">

        {/* Conversations list */}
        <div className="w-72 flex-shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900">Messages</h2>
            </div>

            {conversations.length === 0 ? (
              <div className="p-6 text-center">
                <div className="text-3xl mb-2">💬</div>
                <div className="text-sm text-gray-500">No conversations yet</div>
                <Link href="/search"
                  className="mt-3 block text-xs text-[#C8372D] hover:underline">
                  Find a caregiver →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {conversations.map(conv => (
                  <button key={conv.id}
                    onClick={() => selectConversation(conv.id)}
                    className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                      activeConversation === conv.id ? 'bg-red-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C8372D] to-[#E8B84B] flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {conv.provider_profiles?.display_name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {conv.provider_profiles?.display_name}
                        </div>
                        {conv.last_message && (
                          <div className="text-xs text-gray-400 truncate mt-0.5">
                            {conv.last_message}
                          </div>
                        )}
                      </div>
                      {conv.family_unread > 0 && (
                        <span className="w-5 h-5 bg-[#C8372D] text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                          {conv.family_unread}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col">
          {!activeConversation ? (
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-3">💬</div>
                <div className="text-gray-500">Select a conversation</div>
                <div className="text-gray-400 text-sm mt-1">or find a caregiver to message</div>
                <Link href="/search"
                  className="mt-4 inline-block px-4 py-2 bg-[#C8372D] text-white text-sm rounded-xl hover:bg-[#E85045] transition-colors">
                  Browse Caregivers
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex-1 bg-white rounded-2xl border border-gray-100 flex flex-col">

              {/* Chat header */}
              <div className="p-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#C8372D] to-[#E8B84B] flex items-center justify-center text-white font-bold text-sm">
                  {activeConv?.provider_profiles?.display_name?.charAt(0)}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {activeConv?.provider_profiles?.display_name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {activeConv?.provider_profiles?.location_city}, {activeConv?.provider_profiles?.location_state}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 text-sm">
                      Say hello to {activeConv?.provider_profiles?.display_name}!
                    </div>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMe = msg.sender_id === userId
                    return (
                      <div key={msg.id}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                          isMe
                            ? 'bg-[#C8372D] text-white rounded-br-sm'
                            : 'bg-gray-100 text-gray-900 rounded-bl-sm'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef}/>
              </div>

              {/* Input */}
              <form onSubmit={sendMessage}
                className="p-4 border-t border-gray-100 flex gap-2">
                <input
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#C8372D] text-gray-900"
                />
                <button type="submit" disabled={sending || !newMessage.trim()}
                  className="px-4 py-2 bg-[#C8372D] text-white rounded-xl text-sm font-medium hover:bg-[#E85045] transition-colors disabled:opacity-50">
                  Send
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}