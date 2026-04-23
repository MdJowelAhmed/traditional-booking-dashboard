import { baseApi } from '../baseApi'

/** Counts or percentages per star (1–5), keys as strings from API */
export interface RatingBreakdownMap {
  '1': number
  '2': number
  '3': number
  '4': number
  '5': number
}

export interface SellerRatingStats {
  averageRating: number
  totalReviews: number
  ratingBreakdown: RatingBreakdownMap
  ratingPercentages: RatingBreakdownMap
}

export interface SellerRatingStatsResponse {
  success: boolean
  message: string
  statusCode?: number
  data: SellerRatingStats
}

export interface SellerFeedbackItem {
  _id: string
  rating: number
  comment: string
  createdAt: string
  isResponded: boolean
  reply?: string
  userName: string
  userImage?: string
  productName: string
  createdBy: string
}

export interface SellerFeedbacksMeta {
  page: number
  limit: number
  total: number
  totalPage: number
}

export interface SellerFeedbacksResponse {
  success: boolean
  message: string
  statusCode?: number
  data: SellerFeedbackItem[]
  meta: SellerFeedbacksMeta
}

export interface GetSellerFeedbacksParams {
  page?: number
  limit?: number
}

export interface ReplyToFeedbackArgs {
  id: string
  reply: string
}

export interface ReplyToFeedbackResponse {
  success: boolean
  message: string
  statusCode?: number
  data?: unknown
}

const reviewRatingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getReviewAverageData: builder.query<SellerRatingStatsResponse, void>({
      query: () => ({
        url: '/feedback/seller-stats',
        method: 'GET',
      }),
      providesTags: ['Review'],
    }),

    getReviewAllData: builder.query<SellerFeedbacksResponse, GetSellerFeedbacksParams | void>({
      query: (params) => ({
        url: '/feedback/seller-feedbacks',
        method: 'GET',
        params: {
          page: params?.page ?? 1,
          limit: params?.limit ?? 10,
        },
      }),
      providesTags: ['Review'],
    }),

    replyReview: builder.mutation<ReplyToFeedbackResponse, ReplyToFeedbackArgs>({
      query: ({ id, reply }) => ({
        url: `/feedback/respond/${id}`,
        method: 'POST',
        body: { reply },
      }),
      invalidatesTags: ['Review'],
    }),
  }),
})

export const {
  useGetReviewAverageDataQuery,
  useGetReviewAllDataQuery,
  useReplyReviewMutation,
} = reviewRatingApi
