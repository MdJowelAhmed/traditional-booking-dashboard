import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { parseJwtPayload } from '@/utils/jwt'

/** Dashboard access: JWT uses HOST / SERVICE (uppercase). */
export type AuthUserRole = 'host' | 'service'

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  avatar?: string
  role: AuthUserRole
  businessId?: string
  businessName?: string
}

/**
 * Maps API/JWT role to dashboard role. Only HOST and SERVICE are allowed.
 * BUSINESS (and anything else) → null (login / session rejected).
 */
export function normalizeAuthRole(raw: string): AuthUserRole | null {
  const u = raw.trim().toUpperCase()
  if (u === 'HOST') return 'host'
  if (u === 'SERVICE') return 'service'
  const lower = raw.trim().toLowerCase()
  if (lower === 'host') return 'host'
  if (lower === 'service') return 'service'
  return null
}

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  passwordResetEmail: string | null
  verificationEmail: string | null
}

export function buildUserFromAccessToken(token: string): AuthUser | null {
  const claims = parseJwtPayload<{
    id?: string
    email?: string
    role?: string
  }>(token)
  if (!claims) return null
  if (!claims.id && !claims.email) return null

  const role = normalizeAuthRole(String(claims.role ?? ''))
  if (!role) return null

  const email = String(claims.email ?? '')
  const localPart = email.includes('@') ? email.split('@')[0]! : email

  return {
    id: String(claims.id ?? ''),
    email,
    firstName: localPart || 'User',
    lastName: '',
    role,
  }
}

function readTokenFromStorage(): string | null {
  try {
    localStorage.removeItem('user')
    const token = localStorage.getItem('token')
    if (!token) return null
    const user = buildUserFromAccessToken(token)
    if (!user) {
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
      return null
    }
    return token
  } catch {
    return null
  }
}

const storedToken = readTokenFromStorage()

const initialState: AuthState = {
  user: storedToken ? buildUserFromAccessToken(storedToken) : null,
  token: storedToken,
  isAuthenticated: !!storedToken,
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
    loginSuccess: (
      state,
      action: PayloadAction<{
        user: AuthUser
        token: string
        refreshToken?: string
      }>
    ) => {
      state.isLoading = false
      state.isAuthenticated = true
      const role = normalizeAuthRole(action.payload.user.role)
      if (!role) {
        state.isLoading = false
        state.isAuthenticated = false
        state.user = null
        state.token = null
        state.error = 'Only Host and Service accounts can sign in.'
        return
      }
      const user = { ...action.payload.user, role }
      state.user = user
      state.token = action.payload.token
      state.error = null
      localStorage.setItem('token', action.payload.token)
      if (action.payload.refreshToken) {
        localStorage.setItem('refreshToken', action.payload.refreshToken)
      }
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
      localStorage.removeItem('refreshToken')
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
      const token = readTokenFromStorage()
      const user = token ? buildUserFromAccessToken(token) : null
      state.token = token
      state.user = user
      state.isAuthenticated = !!token && !!user
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
