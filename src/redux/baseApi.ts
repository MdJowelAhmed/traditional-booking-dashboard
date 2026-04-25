import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

const rawBase = import.meta.env.VITE_API_BASE_URL
const apiBaseUrl =
  rawBase && String(rawBase).trim() !== ''
    ? `${String(rawBase).replace(/\/$/, '')}/api/v1`
    : '/api/v1'

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: apiBaseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as { auth: { token: string | null } }).auth.token
      if (token) {
        headers.set('Authorization', `Bearer ${token}`)
      }
      headers.set('Accept', 'application/json')
      return headers
    },
  }),
  tagTypes: [
    'Auth',
    'User',
    'Product',
    'Category',
    'HostListing',
    'ServiceListing',
    'Dashboard',
    'Review',
    'Setting',
    'Location',
    'ServiceLocation',
    'AppSlider',
    'Controller',
    'Chat',
    'Message',
  ],
  endpoints: () => ({}),
})
