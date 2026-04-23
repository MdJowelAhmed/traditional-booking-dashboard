import { baseApi } from '../baseApi'

export interface CategoryApiDoc {
  _id: string
  name: string
  type: 'category' | 'amenities' | string
  createdAt: string
  updatedAt: string
  __v?: number
}

export interface GetCategoriesResponse {
  success: boolean
  message: string
  statusCode: number
  data: CategoryApiDoc[]
}

export interface GetCategoriesParams {
  type?: 'category' | 'amenities'
}

const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<GetCategoriesResponse, GetCategoriesParams | void>(
      {
        query: (params) => ({
          url: '/categories',
          method: 'GET',
          params: params ?? undefined,
        }),
        providesTags: ['Category'],
      }
    ),
  }),
})

export const { useGetCategoriesQuery } = categoryApi

