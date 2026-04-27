import { baseApi } from "../baseApi"


export interface ApiMeta {
  limit: number
  page: number
  total: number
  totalPage: number
}

export interface PropertyLocationApi {
  type: "Point"
  coordinates: [number, number] // [lng, lat]
  _id?: string
}

export interface PropertyApiDoc {
  _id: string
  name: string
  category?: string
  categoryId: string
  size: number
  price: number
  priceUnit: string
  location: PropertyLocationApi
  address: string
  facilities: string[]
  description: string
  images: string[]
  createdBy?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface GetMyPropertiesResponse {
  success: boolean
  message: string
  statusCode: number
  data: PropertyApiDoc[]
  meta?: ApiMeta
}

export interface PropertyResponse {
  success: boolean
  message: string
  statusCode: number
  data: PropertyApiDoc
}

export interface GetMyPropertiesParams {
  page?: number
  limit?: number
}

const hostMyLisitngApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getAllMyHostList: builder.query<GetMyPropertiesResponse, GetMyPropertiesParams | void>({
            query: (params) => ({
                url: '/properties/my-listing',
                method: 'GET',
                params: params ?? undefined,
            }),
            providesTags: (result) =>
                result?.data?.length
                    ? [
                        { type: 'HostListing' as const, id: 'LIST' },
                        ...result.data.map((x) => ({ type: 'HostListing' as const, id: x._id })),
                    ]
                    : [{ type: 'HostListing' as const, id: 'LIST' }],
        }),

        createMyHostListing: builder.mutation<PropertyResponse, FormData>({
            query: (body) => ({
                url: '/properties/create',
                method: 'POST',
                body,
            }),
            invalidatesTags: [{ type: 'HostListing', id: 'LIST' }],
        }),

        updateMyHostListing: builder.mutation<PropertyResponse, { id: string; body: FormData }>({
            query: ({ id, body }) => ({
                url: `/properties/update/${id}`,
                method: 'PATCH',
                body,
            }),
            invalidatesTags: (_r, _e, arg) => [
                { type: 'HostListing', id: 'LIST' },
                { type: 'HostListing', id: arg.id },
            ],
        }),

        deleteMyHostListing: builder.mutation<{ success: boolean; message: string }, string>({
            query: (id) => ({
                url: `/properties/delete/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_r, _e, id) => [
                { type: 'HostListing', id: 'LIST' },
                { type: 'HostListing', id },
            ],
        }),
    }),
})

export const {
    useGetAllMyHostListQuery,
    useCreateMyHostListingMutation,
    useUpdateMyHostListingMutation,
    useDeleteMyHostListingMutation,
} = hostMyLisitngApi
