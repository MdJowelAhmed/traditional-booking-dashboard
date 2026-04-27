import { baseApi } from '../baseApi'

export interface ApiMeta {
  page: number
  limit: number
  total: number
  totalPage: number
}

export interface BookingUserApi {
  _id: string
  name: string
  email: string
}

export interface HostBookingPropertyApi {
  _id: string
  price: number
  priceUnit: string
  address: string
}

export interface ServiceBookingServiceApi {
  _id: string
  name: string
  price: number
  scheduleType: string
}

export interface BookingPaymentApi {
  method: string
  stripeSessionId?: string
  paypalApprovalUrl?: string
  paypalOrderId?: string
  amount: number
  currency: string
  status: string
  paidAt?: string
}

export interface HostBookingApiDoc {
  _id: string
  user: BookingUserApi
  property: HostBookingPropertyApi
  owner: string
  startDate: string
  endDate: string
  duration: number
  priceUnit: string
  bookingStatus: string
  payment: BookingPaymentApi
  createdAt: string
  updatedAt: string
  __v?: number
}

export interface ServiceScheduledSlotApi {
  day: string
  date: string
  startTime: string
}

export interface ServiceBookingApiDoc {
  _id: string
  user: BookingUserApi
  service: ServiceBookingServiceApi
  provider: string
  scheduledSlot: ServiceScheduledSlotApi
  bookingStatus: string
  payment: BookingPaymentApi
  isFullDay: boolean
  rescheduleHistory: unknown[]
  createdAt: string
  updatedAt: string
  __v?: number
}

export interface GetMyBookingsParams {
  page?: number
  limit?: number
}

export interface GetMyBookingsResponse {
  success: boolean
  message: string
  statusCode: number
  data: HostBookingApiDoc[]
  meta: ApiMeta
}

export interface GetServiceBookingsParams {
  page?: number
  limit?: number
}

export interface GetServiceBookingsResponse {
  success: boolean
  message: string
  statusCode: number
  data: ServiceBookingApiDoc[]
  meta: ApiMeta
}

export type BookingCancelResponse = { success: boolean; message: string; statusCode?: number }
export type BookingCompletedResponse = { success: boolean; message: string; statusCode?: number }
export type ServiceBookingCancelResponse = { success: boolean; message: string; statusCode?: number }
export type ServiceBookingCompletedResponse = { success: boolean; message: string; statusCode?: number }

export type BookingCancelParams = string
export type BookingCompletedParams = string
export type ServiceBookingCancelParams = string
export type ServiceBookingCompletedParams = string

const myBookingApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getMyBookingsHost: builder.query<GetMyBookingsResponse, GetMyBookingsParams | void>(
            {
                query: (params) => ({
                    url: '/property-bookings/owner-bookings',
                    method: 'GET',
                    params: params ?? undefined,
                }),
                providesTags: ['Bookings'],
            }
        ),

        bookingCancelHost: builder.mutation<BookingCancelResponse, BookingCancelParams>({
            query: (id) => ({
                url: `/property-bookings/${id}/owner-cancel`,
                method: 'PATCH',

            }),
            invalidatesTags: ['Bookings'],
        }),
        bookingCompletedHost: builder.mutation<BookingCompletedResponse, BookingCompletedParams>({
            query: (id) => ({
                url: `/property-bookings/${id}/complete`,
                method: 'PATCH',

            }),
            invalidatesTags: ['Bookings'],
        }),


        getServiceBookingsService: builder.query<GetServiceBookingsResponse, GetServiceBookingsParams | void>(
            {
                query: (params) => ({
                    url: '/service-bookings/provider-bookings',
                    method: 'GET',
                    params: params ?? undefined,
                }),
                providesTags: ['Bookings'],
            }
        ),

        serviceBookingCancelService: builder.mutation<ServiceBookingCancelResponse, ServiceBookingCancelParams>({
            query: (id) => ({
                url: `/service-bookings/${id}/provider-cancel`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Bookings'],
        }),
        serviceBookingCompletedService: builder.mutation<ServiceBookingCompletedResponse, ServiceBookingCompletedParams>({
            query: (id) => ({
                url: `/service-bookings/${id}/complete`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Bookings'],
        }),
    }),
})

export const {
  useGetMyBookingsHostQuery,
  useBookingCancelHostMutation,
  useBookingCompletedHostMutation,
  useGetServiceBookingsServiceQuery,
  useServiceBookingCancelServiceMutation,
  useServiceBookingCompletedServiceMutation,
} = myBookingApi

