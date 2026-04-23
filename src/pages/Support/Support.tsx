import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ImageIcon, Search, SendHorizonal, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useGetChatListUserQuery } from '@/redux/api/chatApi'
import { useGetMessageByChatIdQuery, useSendMessageMutation } from '@/redux/api/messageApi'
import { toast } from 'sonner'
import { useAppSelector } from '@/redux/hooks'
import { imageUrl } from '@/components/common/imageUrl'

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? '' : ''
  return (first + last).toUpperCase()
}

export default function Support() {
  const [search, setSearch] = useState('')
  const [draft, setDraft] = useState('')
  const [activeId, setActiveId] = useState('')
  const [files, setFiles] = useState<File[]>([])

  const authUserId = useAppSelector((state) => state.auth.user?.id ?? '')
  const messagesWrapRef = useRef<HTMLDivElement | null>(null)

  const { data: chatsRes, isLoading: isChatsLoading } = useGetChatListUserQuery({ page: 1, limit: 50 })
  const chats = chatsRes?.data?.chats ?? []

  useEffect(() => {
    if (!activeId && chats.length > 0) {
      setActiveId(chats[0]._id)
    }
  }, [activeId, chats])

  const {
    data: messagesRes,
    isLoading: isMessagesLoading,
    isFetching: isMessagesFetching,
  } = useGetMessageByChatIdQuery(activeId, { skip: !activeId })

  const [sendMessageMutation, { isLoading: isSending }] = useSendMessageMutation()

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return chats
    return chats.filter((c) => {
      const participant = c.participants?.[0]
      const name = participant?.name ?? ''
      const lastText = c.lastMessage?.message ?? ''
      return name.toLowerCase().includes(q) || lastText.toLowerCase().includes(q)
    })
  }, [chats, search])

  const activeConversation = useMemo(() => {
    return chats.find((c) => c._id === activeId) ?? chats[0] ?? null
  }, [chats, activeId])

  const sortedMessages = useMemo(() => {
    const list = messagesRes?.data?.messages ?? []
    return [...list].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
  }, [messagesRes])

  useEffect(() => {
    // Keep view pinned to the bottom so newest appears at bottom.
    const el = messagesWrapRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [activeId, sortedMessages.length])

  const sendMessage = async () => {
    if (!activeConversation?._id) return
    const text = draft.trim()
    const hasFiles = files.length > 0

    if (!text && !hasFiles) return

    const type = hasFiles ? 'image' : 'text'

    try {
      await sendMessageMutation({
        chatId: activeConversation._id,
        message: text ? text : undefined,
        type,
        images: hasFiles ? files : undefined,
      }).unwrap()

      setDraft('')
      setFiles([])
    } catch (e) {
      toast.error('Failed to send message')
    }
  }

  const selectConversation = (id: string) => {
    setActiveId(id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6 bg-white p-8 rounded-2xl"
    >
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#2d2d2d] md:text-3xl">
          Message
        </h1>
        <p className="mt-1 text-sm text-muted-foreground md:text-base">
          Communicate with your guests
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[360px_1fr]">
          {/* Left: conversations */}
          <div className="border-b lg:border-b-0 lg:border-r border-slate-200">
            <div className="p-4 border-b border-slate-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search here"
                  className="pl-9 bg-slate-50"
                />
              </div>
            </div>

            <div className="max-h-[520px] overflow-auto">
              {isChatsLoading ? (
                <div className="p-6 text-sm text-muted-foreground text-center">Loading chats…</div>
              ) : filtered.length === 0 ? (
                <div className="p-6 text-sm text-muted-foreground text-center">
                  No conversations found.
                </div>
              ) : (
                filtered.map((c) => {
                  const isActive = c._id === activeId
                  const participant = c.participants?.[0]
                  const displayName = participant?.name ?? '—'
                  const avatarUrl = participant?.image ? imageUrl(participant.image) : undefined
                  const lastText =
                    c.lastMessage?.type === 'image'
                      ? '📷 Image'
                      : c.lastMessage?.message ?? ''
                  return (
                    <button
                      key={c._id}
                      type="button"
                      onClick={() => selectConversation(c._id)}
                      className={cn(
                        'w-full text-left p-4 border-b border-slate-200 hover:bg-slate-50 transition-colors',
                        isActive && 'bg-[#F2F9EB]'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={avatarUrl} />
                          <AvatarFallback>{getInitials(displayName)}</AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-slate-900 truncate">
                              {displayName}
                            </p>
                            <p className="text-[11px] text-muted-foreground whitespace-nowrap">
                              {c.isMuted ? 'Muted' : ''}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {c.status}
                          </p>
                          <p className="mt-1 text-xs text-slate-600 truncate">
                            {lastText}
                          </p>
                        </div>

                        {c.unreadCount > 0 && (
                          <div className="h-5 w-5 rounded-full bg-slate-900 text-white text-[11px] flex items-center justify-center">
                            {c.unreadCount}
                          </div>
                        )}
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </div>

          {/* Right: chat */}
          <div className="flex flex-col min-h-[640px]">
            <div className="p-4 border-b border-slate-200 flex items-center gap-3">
              {(() => {
                const participant = activeConversation?.participants?.[0]
                const displayName = participant?.name ?? '—'
                const avatarUrl = participant?.image ? imageUrl(participant.image) : undefined
                return (
                  <>
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={avatarUrl} />
                      <AvatarFallback>
                        {activeConversation ? getInitials(displayName) : '—'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-slate-900">{displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {activeConversation?.status ?? ''}
                      </p>
                    </div>
                  </>
                )
              })()}
            </div>

            <div
              ref={messagesWrapRef}
              className="flex-1 p-6 space-y-4 overflow-auto bg-white"
            >
              {!activeId ? (
                <div className="text-sm text-muted-foreground text-center">Select a chat.</div>
              ) : isMessagesLoading || isMessagesFetching ? (
                <div className="text-sm text-muted-foreground text-center">Loading messages…</div>
              ) : sortedMessages.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center">No messages yet.</div>
              ) : (
                sortedMessages.map((m) => {
                const senderId =
                  typeof m.sender === 'string' ? m.sender : (m.sender?._id ?? '')
                const isOwner = !!authUserId && senderId === authUserId
                const time = new Date(m.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
                return (
                  <div
                    key={m._id}
                    className={cn('flex', isOwner ? 'justify-end' : 'justify-start')}
                  >
                    <div
                      className={cn(
                        'max-w-[520px] rounded-lg px-4 py-3 text-sm',
                        isOwner
                          ? 'bg-[#9CCB6B] text-white'
                          : 'bg-slate-100 text-slate-900'
                      )}
                    >
                      {m.type === 'image' && m.images?.length ? (
                        <div className="grid grid-cols-2 gap-2">
                          {m.images.slice(0, 4).map((src) => (
                            <img
                              key={src}
                              src={imageUrl(src)}
                              alt="message"
                              className="h-28 w-40 object-cover rounded-md bg-black/10"
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="leading-relaxed">{m.message ?? ''}</p>
                      )}
                      <p
                        className={cn(
                          'mt-2 text-[11px]',
                          isOwner ? 'text-white/80' : 'text-slate-500'
                        )}
                      >
                        {time}
                      </p>
                    </div>
                  </div>
                )
              })
              )}
            </div>

            <div className="p-4 border-t border-slate-200">
              {files.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {files.map((f) => (
                    <div
                      key={f.name + f.size}
                      className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs"
                    >
                      <ImageIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="max-w-[220px] truncate">{f.name}</span>
                      <button
                        type="button"
                        onClick={() => setFiles((prev) => prev.filter((x) => x !== f))}
                        className="text-muted-foreground hover:text-slate-900"
                        aria-label="Remove file"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3">
                <label className="inline-flex items-center justify-center h-10 w-10 rounded-md border border-slate-200 bg-slate-50 hover:bg-slate-100 cursor-pointer">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const next = Array.from(e.target.files ?? [])
                      setFiles(next)
                      e.target.value = ''
                    }}
                  />
                  <ImageIcon className="h-4 w-4 text-muted-foreground" />
                </label>
                <Input
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  placeholder="Type your Message"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      sendMessage()
                    }
                  }}
                  className="bg-slate-50"
                />
                <Button
                  onClick={sendMessage}
                  className="bg-[#6BBF2D] hover:bg-[#5AA521] text-white px-6"
                  disabled={isSending || (!draft.trim() && files.length === 0) || !activeId}
                >
                  <SendHorizonal className="h-4 w-4 mr-2" />
                  {isSending ? 'Sending…' : 'Send'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

