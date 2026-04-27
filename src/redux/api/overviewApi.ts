import { baseApi } from "../baseApi"

export type DashboardStatChangeType = 'increase' | 'decrease' | 'neutral'

export interface DashboardStatMetric {
  value: number
  change: number
  changeType: DashboardStatChangeType
}

export interface HostDashboardStatsData {
  activeListings: DashboardStatMetric
  upcomingBookings: DashboardStatMetric
  totalOrders: DashboardStatMetric
  totalSales: DashboardStatMetric
  cancelledBookings: DashboardStatMetric
  totalRefunds: DashboardStatMetric
}

export interface ServiceDashboardStatsData {
  activeServices: DashboardStatMetric
  upcomingBookings: DashboardStatMetric
  totalOrders: DashboardStatMetric
  totalSales: DashboardStatMetric
  cancelledBookings: DashboardStatMetric
  totalRefunds: DashboardStatMetric
}

export interface DashboardStatsResponse<T> {
  success: boolean
  message: string
  statusCode: number
  data: T
}

export interface SalesOverviewRow {
  month: string
  monthIndex: number
  totalRevenue: number
  totalBookings: number
}

export interface SalesOverviewResponse {
  success: boolean
  message: string
  statusCode: number
  data: SalesOverviewRow[]
}

export interface ApiMeta {
  page: number
  limit: number
  total: number
  totalPage: number
}

export interface RecentBookingsUser {
  _id: string
  name: string
  email: string
  image?: string
}

export interface RecentBookingsProperty {
  _id: string
  name: string
  category?: string
}

export interface RecentBookingsPayment {
  method: string
  amount: number
  currency: string
  status: string
  paypalApprovalUrl?: string
  paypalOrderId?: string
  stripeSessionId?: string
}

export interface RecentBookingItem {
  _id: string
  user: RecentBookingsUser
  property: RecentBookingsProperty
  owner: string
  startDate: string
  endDate: string
  duration: number
  priceUnit: string
  bookingStatus: string
  payment: RecentBookingsPayment
  createdAt: string
  updatedAt: string
}

export interface RecentBookingsResponse {
  success: boolean
  message: string
  statusCode: number
  data: {
    data: RecentBookingItem[]
    meta: ApiMeta
  }
}

export interface GetSalesOverviewParams {
  year?: string
}

const dashboardOverviewApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        //Host Overview
        getHostOverviewStats: builder.query<DashboardStatsResponse<HostDashboardStatsData>, void>({
            query: () => '/dashboard/host-stats',
            providesTags: ['Dashboard'],
        }),
        getHostSalesOverview: builder.query<SalesOverviewResponse, GetSalesOverviewParams | void>({
            query: (params) => ({
                url: '/dashboard/property-sales-overview',
                params: params ?? undefined,
            }),
            providesTags: ['Dashboard'],
        }),
        getHostRecentBookings: builder.query<RecentBookingsResponse, void>({
            query: () => '/dashboard/property-recent-bookings',
            providesTags: ['Dashboard'],
        }),

        //Service Overview
        getServiceOverviewStats: builder.query<DashboardStatsResponse<ServiceDashboardStatsData>, void>({
            query: () => '/dashboard/service-stats',
            providesTags: ['Dashboard'],
        }),
        getServiceSalesOverview: builder.query<SalesOverviewResponse, GetSalesOverviewParams | void>({
            query: (params) => ({
                url: '/dashboard/service-sales-overview',
                params: params ?? undefined,
            }),
            providesTags: ['Dashboard'],
        }),
        getServiceRecentBookings: builder.query<RecentBookingsResponse, void>({
            query: () => '/dashboard/service-recent-bookings',
            providesTags: ['Dashboard'],
        }),
    }), 
})

export const {
        useGetHostOverviewStatsQuery,
        useGetHostSalesOverviewQuery,
        useGetHostRecentBookingsQuery,
        useGetServiceOverviewStatsQuery,
        useGetServiceSalesOverviewQuery,
        useGetServiceRecentBookingsQuery,
} = dashboardOverviewApi
