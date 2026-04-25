import { baseApi } from "../baseApi"


export interface ApiMeta {
  limit: number
  page: number
  total: number
  totalPage: number
}

export interface ServiceScheduleApi {
  day: string
  timeSlots?: string[]
}

export interface ServiceCreatedByApi {
  _id: string
  name: string
  email: string
  image?: string
}

export interface ServiceApiDoc {
  _id: string
  name: string
  price: number
  discount: number
  description: string
  images: string[]
  scheduleType: 'DAILY' | 'HOURLY' | string
  schedules: ServiceScheduleApi[]
  isActive: boolean
  createdBy: ServiceCreatedByApi
  createdAt: string
  updatedAt: string
}

export interface GetMyServicesResponse {
  success: boolean
  message: string
  statusCode: number
  data: ServiceApiDoc[]
  meta?: ApiMeta
}

export interface ServiceResponse {
  success: boolean
  message: string
  statusCode: number
  data: ServiceApiDoc
}

export interface GetMyServicesParams {
  page?: number
  limit?: number
}

const serviceMyLisitngApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllMyServiceList: builder.query<GetMyServicesResponse, GetMyServicesParams | void>({
            query: (params) => ({
                url: '/services/my-services',
                method: 'GET',
                params: params ?? undefined,
            }),
            providesTags: (result) =>
                result?.data?.length
                    ? [
                        { type: 'ServiceListing' as const, id: 'LIST' },
                        ...result.data.map((x) => ({ type: 'ServiceListing' as const, id: x._id })),
                    ]
                    : [{ type: 'ServiceListing' as const, id: 'LIST' }],
        }),

        createMyServiceListing: builder.mutation<ServiceResponse, FormData>({
            query: (body) => ({
                url: '/services/create',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'ServiceListing', id: 'LIST' }],
        }),

        updateMyServiceListing: builder.mutation<ServiceResponse, { id: string; body: FormData }>({
            query: ({ id, body }) => ({
                url: `/services/update/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: (_r, _e, arg) => [
                { type: 'ServiceListing', id: 'LIST' },
                { type: 'ServiceListing', id: arg.id },
            ],
        }),

        deleteMyServiceListing: builder.mutation<{ success: boolean; message: string }, string>({
            query: (id) => ({
                url: `/services/delete/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_r, _e, id) => [
                { type: 'ServiceListing', id: 'LIST' },
                { type: 'ServiceListing', id },
            ],
        }),
    }),
})

export const {
    useGetAllMyServiceListQuery,
    useCreateMyServiceListingMutation,
    useUpdateMyServiceListingMutation,
    useDeleteMyServiceListingMutation,
} = serviceMyLisitngApi
