import { baseApi } from '../baseApi'
import type { ChatMessageType } from './chatApi'

export interface MessageSender {
  _id: string
  name: string
  email: string
  image?: string | null
}

export interface MessageItem {
  _id: string
  chatId: string
  sender: string | MessageSender
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
  isPinnedByCurrentUser?: boolean
}

export interface GetMessagesResponse {
  success: boolean
  message: string
  statusCode: number
  data: {
    messages: MessageItem[]
    pinnedMessages: MessageItem[]
  }
}

export interface SendMessageArgs {
  chatId: string
  message?: string
  type: ChatMessageType
  images?: File[]
}

export interface SendMessageResponse {
  success: boolean
  message: string
  statusCode: number
  data: MessageItem
}

const messageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMessageByChatId: builder.query<GetMessagesResponse, string>({
      query: (chatId) => ({
        url: `/messages/${chatId}`,
        method: 'GET',
      }),
      providesTags: (_res, _err, chatId) => [{ type: 'Message', id: chatId }],
    }),

    sendMessage: builder.mutation<SendMessageResponse, SendMessageArgs>({
      query: ({ chatId, message, type, images }) => {
        const formData = new FormData()

        // API expects: images (file), message (text), type (text)
        if (images?.length) {
          images.forEach((file) => formData.append('images', file))
        }
        if (message && message.trim() !== '') {
          formData.append('message', message.trim())
        }
        formData.append('type', type)

        return {
        url: `/messages/send/${chatId}`,
        method: 'POST',
        body: formData,
      }
      },
      invalidatesTags: (_res, _err, args) => [
        { type: 'Message', id: args.chatId },
        'Chat',
      ],
    }),

  }),
})

export const {
    useGetMessageByChatIdQuery,
    useSendMessageMutation,
} = messageApi
       
