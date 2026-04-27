import { baseApi } from "../baseApi"


export type PaymentType = 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly'

export interface PackageFeatureApi {
    name?: string
    description: string
    limit: number | null
    isUnlimited: boolean
}

export interface SubscriptionPackageApiDoc {
    _id: string
    title: string
    description: string
    price: number
    priceId?: string
    productId?: string
    duration: string
    paymentType: PaymentType | string
    features: PackageFeatureApi[]
    subscriptionType?: string
    status?: string
    isDeleted?: boolean
    createdAt: string
    updatedAt: string
}

export interface SubscriptionPackageListResponse {
    success: boolean
    message: string
    statusCode?: number
    data: SubscriptionPackageApiDoc[]
    meta?: {
        page: number
        limit: number
        total: number
        totalPage: number
    }
}

export interface GetSubscriptionPackagesParams {
    page?: number
    limit?: number
}

export interface SubscriptionPackagePayload {
    title: string
    description: string
    price: number
    duration: string
    paymentType: PaymentType
    features: Array<{
        description: string
        limit: number | null
        isUnlimited: boolean
        name?: string
    }>
}

const subscriptionPackageApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getSubscriptionPackages: builder.query<
            SubscriptionPackageListResponse,
            GetSubscriptionPackagesParams | void
        >({
            query: (params) => ({
                url: '/packages/public',
                method: 'GET',
                params: params ? { page: params.page, limit: params.limit } : {},
            }),
            providesTags: ['SubscriptionPackage'],
        }),

        purchasePackage: builder.mutation<
            {
                success: boolean
                message: string
                statusCode: number
                data: { sessionId: string; url: string }
            },
            { packageId: string }
        >({
            query: ({ packageId }) => ({
                url: `/subscriptions/create-checkout-session`,
                method: 'POST',
                body: { packageId },
            }),
            invalidatesTags: ['SubscriptionPackage'],
        }),

    }),
})

export const {
    useGetSubscriptionPackagesQuery,
    usePurchasePackageMutation,
} = subscriptionPackageApi
