import { baseApi } from '../baseApi'

export interface ApiMeta {
  limit: number
  page: number
  total: number
  totalPage: number
}

export interface ChatParticipant {
  _id: string
  name: string
  email: string
  image?: string | null
}

export type ChatMessageType = 'text' | 'image' | 'icon'

export interface ChatLastMessage {
  _id: string
  chatId: string
  sender: string
  message?: string | null
  images?: string[] | null
  read: boolean
  type: ChatMessageType
  isDeleted: boolean
  isPinned: boolean
  replyTo: unknown
  iconViewed: string[]
  createdAt: string
  pinnedByUsers: string[]
  deletedForUsers: string[]
  reactions: unknown[]
  updatedAt: string
  __v: number
}

export interface ChatItem {
  _id: string
  participants: ChatParticipant[]
  lastMessage: ChatLastMessage | null
  status: 'active' | 'archived' | string
  isDeleted: boolean
  readBy: string[]
  mutedBy: string[]
  deletedByDetails: unknown[]
  blockedUsers: string[]
  userPinnedMessages: unknown[]
  createdAt: string
  updatedAt: string
  __v: number
  lastMessageAt?: string | null
  isRead: boolean
  unreadCount: number
  iconUnreadCount: number
  isMuted: boolean
  isBlocked: boolean
  wasDeletedByUser: boolean
  deletedAt?: string | null
}

export interface GetChatsData {
  chats: ChatItem[]
  unreadChatsCount: number
  totalUnreadMessages: number
  totalIconUnreadMessages: number
}

export interface GetChatsResponse {
  success: boolean
  message: string
  statusCode: number
  data: GetChatsData
  meta: ApiMeta
}

export interface GetChatsParams {
  page?: number
  limit?: number
}

const chatApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getChatListUser: builder.query<GetChatsResponse, GetChatsParams | void>({
      query: (params) => ({
        url: '/chats',
        method: 'GET',
        params: params ?? undefined,
      }),
      providesTags: ['Chat'],
    }),


  }),
})

export const {
    useGetChatListUserQuery,
} = chatApi
       
