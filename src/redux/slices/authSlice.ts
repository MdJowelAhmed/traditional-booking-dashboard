import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export type AuthUserRole = 'host' | 'business'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  role: AuthUserRole
  businessId?: string
  businessName?: string
}

/** Maps legacy stored roles and API values to current AuthUserRole */
export function normalizeAuthRole(role: string): AuthUserRole {
  if (role === 'host') return 'host'
  if (role === 'business') return 'business'
  if (role === 'admin') return 'host'
  if (role === 'employee') return 'business'
  return 'business'
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  passwordResetEmail: string | null
  verificationEmail: string | null
}

function safeParseUser(userStr: string | null): User | null {
  if (!userStr) return null
  try {
    const raw = JSON.parse(userStr) as User
    return { ...raw, role: normalizeAuthRole(raw.role) }
  } catch {
    return null
  }
}

const initialState: AuthState = {
  user: safeParseUser(localStorage.getItem('user')),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token') && !!localStorage.getItem('user'),
  isLoading: false,
  error: null,
  passwordResetEmail: null,
  verificationEmail: null,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true
      state.error = null
    },
    loginSuccess: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.isLoading = false
      state.isAuthenticated = true
      const user = {
        ...action.payload.user,
        role: normalizeAuthRole(action.payload.user.role),
      }
      state.user = user
      state.token = action.payload.token
      state.error = null
      localStorage.setItem('token', action.payload.token)
      localStorage.setItem('user', JSON.stringify(user))
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false
      state.error = action.payload
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    },
    setPasswordResetEmail: (state, action: PayloadAction<string>) => {
      state.passwordResetEmail = action.payload
    },
    setVerificationEmail: (state, action: PayloadAction<string>) => {
      state.verificationEmail = action.payload
    },
    clearError: (state) => {
      state.error = null
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    loadUserFromStorage: (state) => {
      const token = localStorage.getItem('token')
      const userStr = localStorage.getItem('user')
      const user = safeParseUser(userStr)

      if (token && user) {
        state.user = user
        state.token = token
        state.isAuthenticated = true
        return
      }

      state.user = null
      state.token = token
      state.isAuthenticated = false
    },
  },
})

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  setPasswordResetEmail,
  setVerificationEmail,
  clearError,
  setLoading,
  loadUserFromStorage,
} = authSlice.actions

export default authSlice.reducer












