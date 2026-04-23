import { baseApi } from "../baseApi"


/** Single platform settings document from GET/PATCH /settings */
export interface PlatformSettings {
    _id: string
    aboutUs: string
    privacyPolicy: string
    termsOfService: string
    support: string
    createdAt: string
    updatedAt: string
    __v?: number
}

/**
 * GET /settings?key=… — `data` is the HTML string for that key.
 */
export interface GetSettingByKeyResponse {
    success: boolean
    message: string
    statusCode?: number
    data: string
}

/** PUT /settings response (adjust if your API returns a different shape). */
export type UpdatePlatformSettingsResponse = GetSettingByKeyResponse

/** Only include keys for the section you are saving; other fields stay unchanged on the server. */
export type UpdatePlatformSettingsPayload = Partial<
    Pick<PlatformSettings, 'aboutUs' | 'privacyPolicy' | 'termsOfService'>
>

/** GET /settings?key=… — must match backend query param values. */
export type SettingsQueryKey =
    | 'aboutUs'
    | 'privacyPolicy'
    | 'termsOfService'
    

const settingApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        getPlatformSettings: builder.query<
            GetSettingByKeyResponse,
            SettingsQueryKey
        >({
            query: (key) => ({
                url: `/settings?key=${encodeURIComponent(key)}`,
                method: 'GET',
            }),
            providesTags: (_result, _err, key) => [{ type: 'Setting', id: key }],
        }),
    
    }),
})

export const { useGetPlatformSettingsQuery } =
    settingApi
