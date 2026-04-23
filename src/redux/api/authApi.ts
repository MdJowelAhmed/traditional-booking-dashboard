import { baseApi } from "../baseApi";



export interface LoginResponse {
    success: boolean;
    message: string;
    statusCode?: number;
    data?: {
        accessToken?: string;
        refreshToken?: string;
    };
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface ChangePasswordPayload {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export interface ChangePasswordResponse {
    success: boolean;
    message: string;
    statusCode?: number;
}

export interface ForgotPasswordPayload {
    email: string;
}

export interface ForgotPasswordResponse {
    success: boolean;
    message: string;
    statusCode?: number;
}

export interface VerifyEmailPayload {
    email: string;
    oneTimeCode: number;
}

export interface VerifyEmailResponse {
    success: boolean;
    message: string;
    statusCode?: number;
    data?: {
        verifyToken: string;
    };
}

export interface ResetPasswordPayload {
    newPassword: string;
    confirmPassword: string;
}

export interface ResetPasswordResponse {
    success: boolean;
    message: string;
    statusCode?: number;
}

/** localStorage key for OTP verify token used by `/auth/reset-password`. */
export const PASSWORD_RESET_VERIFY_TOKEN_KEY = 'verifyToken';

/** User document from GET/PATCH /users/profile */
export interface MyProfileEntity {
    _id: string;
    name: string;
    email: string;
    role: string;
    image?: string;
    /** Some APIs return this key instead of `image` */
    profileImage?: string;
    status: string;
    isVerified: boolean;
    isPhoneVerified: boolean;
    isEmailVerified: boolean;
    isDeleted: boolean;
    authProviders: string[];
    createdAt: string;
    updatedAt: string;
    __v: number;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    bio?: string;
}

export interface GetMyProfileResponse {
    success: boolean;
    message: string;
    data: MyProfileEntity;
}

export interface UpdateMyProfileResponse {
    success: boolean;
    message: string;
    data: MyProfileEntity;
}

/**
 * Profile PATCH: multipart body with JSON `data` and optional file field `image`.
 */
export interface UpdateMyProfilePayload {
    data: Record<string, unknown>;
    image?: File | null;
}

export function buildProfileUpdateFormData(
    data: Record<string, unknown>,
    image?: File | null
): FormData {
    const formData = new FormData();
    formData.append("data", JSON.stringify(data));
    if (image) {
        // Third argument sets filename; some backends require it for multipart parsing.
        formData.append("image", image, image.name);
    }
    return formData;
}

/** Populated owner on GET /business/my-business */
export interface BusinessOwnerSummary {
    _id: string;
    name: string;
    email: string;
    image?: string;
    isVerified: boolean;
}

export interface MyBusinessProfileEntity {
    _id: string;
    ownerId: BusinessOwnerSummary;
    name: string;
    location: string;
    cityState: string;
    zipCode: string;
    description: string;
    phoneNumber: string;
    officeAddress: string;
    email: string;
    website?: string;
    image?: string;
    roleType: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    __v?: number;
}

export interface GetMyBusinessProfileResponse {
    success: boolean;
    message: string;
    statusCode?: number;
    data: MyBusinessProfileEntity;
}

/** JSON body for PATCH /business/my-business (no multipart). */
export interface UpdateMyBusinessProfilePayload {
    name: string;
    location: string;
    cityState: string;
    zipCode: string;
    description: string;
    phoneNumber: string;
    officeAddress: string;
    email: string;
    website?: string;
}

export interface UpdateMyBusinessProfileResponse {
    success: boolean;
    message: string;
    statusCode?: number;
    data: MyBusinessProfileEntity;
}

const authApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation<LoginResponse, LoginCredentials>({
            query: ({ email, password }) => ({
                url: '/auth/login',
                method: 'POST',
                body: {
                    email: email.trim(),
                    password,
                },
            }),
            invalidatesTags: ['Auth'],
        }),
        register: builder.mutation({
            query: (credentials) => ({
                url: '/auth/register',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        logout: builder.mutation({
            query: () => ({
                url: '/auth/logout',
                method: 'POST',
            }),
            invalidatesTags: ['Auth'],
        }),
        getCurrentUser: builder.query({
            query: () => ({
                url: '/auth/current-user',
                method: 'GET',
            }),
            providesTags: ['Auth'],
        }),
        /** Authenticated user; Bearer token added by baseApi `prepareHeaders`. */
        changePassword: builder.mutation<ChangePasswordResponse, ChangePasswordPayload>({
            query: (body) => ({
                url: '/auth/change-password',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Auth'],
        }),
        forgotPassword: builder.mutation<ForgotPasswordResponse, ForgotPasswordPayload>({
            query: ({ email }) => ({
                url: '/auth/forget-password',
                method: 'POST',
                body: { email: email.trim() },
            }),
            invalidatesTags: ['Auth'],
        }),
        resentOtp: builder.mutation({
            query: (credentials) => ({
                url: '/auth/resend-otp',
                method: 'POST',
                body: credentials,
            }),
            invalidatesTags: ['Auth'],
        }),
        verifyEmail: builder.mutation<VerifyEmailResponse, VerifyEmailPayload>({
            query: ({ email, oneTimeCode }) => ({
                url: '/auth/verify-otp',
                method: 'POST',
                body: { email: email.trim(), oneTimeCode },
            }),
            invalidatesTags: ['Auth'],
        }),
        resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordPayload>({
            query: (body) => {
                let verifyToken: string | null = null;
                try {
                    verifyToken =
                        typeof localStorage !== 'undefined'
                            ? localStorage.getItem(PASSWORD_RESET_VERIFY_TOKEN_KEY)
                            : null;
                } catch {
                    verifyToken = null;
                }

                const headers: Record<string, string> = {};
                if (verifyToken) {
                    headers.token = verifyToken;
                }

                return {
                    url: '/auth/reset-password',
                    method: 'POST',
                    body,
                    headers,
                };
            },
            invalidatesTags: ['Auth'],
        }),

        getMyProfile: builder.query<GetMyProfileResponse, void>({
            query: () => ({
                url: '/users/profile',
                method: 'GET',
            }),
            providesTags: ['Auth'],
        }),

        updateMyProfile: builder.mutation<UpdateMyProfileResponse, UpdateMyProfilePayload>({
            query: ({ data, image }) => ({
                url: '/users/profile',
                method: 'PATCH',
                body: buildProfileUpdateFormData(data, image ?? undefined),
            }),
            invalidatesTags: ['Auth'],
        }),

        getMyBusinessProfile: builder.query<GetMyBusinessProfileResponse, void>({
            query: () => ({
                url: '/business/my-business',
                method: 'GET',
            }),
            providesTags: ['Auth'],
        }),
        updateMyBusinessProfile: builder.mutation<
            UpdateMyBusinessProfileResponse,
            UpdateMyBusinessProfilePayload
        >({
            query: (body) => ({
                url: '/business/my-business',
                method: 'PATCH',
                body,
            }),
            invalidatesTags: ['Auth'],
        }),


    }),

})

export const {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useGetCurrentUserQuery,
    useChangePasswordMutation,
    useForgotPasswordMutation,
    useVerifyEmailMutation,
    useResetPasswordMutation,
    useResentOtpMutation,
    useGetMyProfileQuery,
    useUpdateMyProfileMutation,
    useGetMyBusinessProfileQuery,
    useUpdateMyBusinessProfileMutation,
 } =
    authApi