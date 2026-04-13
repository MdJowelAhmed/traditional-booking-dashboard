import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import DashboardLayout from '@/components/layout/DashboardLayout'
import AuthLayout from '@/components/layout/AuthLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { RoleBasedRoute } from '@/components/auth/RoleBasedRoute'
import { UserRole, getDefaultRouteForRole } from '@/types/roles'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { loadUserFromStorage } from '@/redux/slices/authSlice'

// Auth Pages
import {
  Login,
  ForgotPassword,
  VerifyEmail,
  ResetPassword,
  BusinessProviderRegister,
  HostProviderRegister,
} from '@/pages/Auth'

// Dashboard Pages
import Dashboard from '@/pages/Dashboard'
import UserList from '@/pages/Users/UserList'
import UserDetails from '@/pages/Users/UserDetails'
import ProductList from '@/pages/Products/ProductList'
import CategoryList from '@/pages/Categories/CategoryList'
import ProfileSettings from '@/pages/Settings/Profile/ProfileSettings'
import ChangePassword from '@/pages/Settings/ChangePassword/ChangePassword'
import TermsSettings from '@/pages/Settings/Terms/TermsSettings'
import PrivacySettings from '@/pages/Settings/Privacy/PrivacySettings'
import AboutUsSettings from '@/pages/Settings/AboutUs/AboutUsSettings'
import BookingManagement from './pages/Booking/BookingManagement'
import Calender from './pages/calender/Calender'
import TransactionsHistory from './pages/transictions-history/TransactionsHistory'
import ReviewsRatings from './pages/ReviewsRatings/ReviewsRatings'
import AppSlider from './pages/AppSlider/AppSlider'
import Subscription from './pages/Subscription/Subscription'
import NotificationPage from './pages/Notification/NotificationPage'
import ControllerPage from './pages/Controller/ControllerPage'
import SubscriptionPackagePage from './pages/SubscriptionPackage/SubscriptionPackagePage'
import Support from './pages/Support/Support'
import FAQ from './pages/FAQ/FAQ'
import NotFound from './pages/NotFound/NotFound'
import MyListingPage from './pages/MyListing/MyListingPage'
import { MyListingEditPage, MyListingNewPage } from './pages/MyListing/MyListingFormRoutes'

// Component to redirect based on user role
function RoleBasedRedirect() {
  const { user } = useAppSelector((state) => state.auth)
  
  // 🔍 Console log for debugging
  console.log('🔄 RoleBasedRedirect Debug:')
  console.log('User:', user)
  console.log('User Role:', user?.role)
  
  if (!user) {
    console.log('❌ No user, redirecting to /auth/login')
    return <Navigate to="/auth/login" replace />
  }

  const home = getDefaultRouteForRole(user.role)
  console.log('✅ Redirecting by role to:', home)
  return <Navigate to={home} replace />
}

function App() {
  const dispatch = useAppDispatch()

  // Load user from storage on app mount
  useEffect(() => {
    dispatch(loadUserFromStorage())
  }, [dispatch])

  return (
    <TooltipProvider>
      <Routes>
        {/* Auth Routes - No sidebar/header */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route index element={<Navigate to="/auth/login" replace />} />
          <Route path="login" element={<Login />} />
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="verify-email" element={<VerifyEmail />} />
          <Route path="reset-password" element={<ResetPassword />} />
          <Route path="business-provider" element={<BusinessProviderRegister />} />
          <Route path="host-provider" element={<HostProviderRegister />} />
        </Route>

        {/* Protected Dashboard Routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<RoleBasedRedirect />} />
          
          {/* Dashboard — all authenticated app roles */}
          <Route
            path="dashboard"
            element={
              <RoleBasedRoute
                allowedRoles={[UserRole.SUPER_ADMIN, UserRole.HOST, UserRole.BUSINESS]}
              >
                <Dashboard />
              </RoleBasedRoute>
            }
          />
          
          {/* User Management - Super Admin Only */}
          <Route 
            path="users" 
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                <UserList />
              </RoleBasedRoute>
            } 
          />
          <Route 
            path="users/:id" 
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                <UserDetails />
              </RoleBasedRoute>
            } 
          />
          
      
          
          {/* Transactions History - Super Admin Only */}
          <Route 
            path="transactions-history" 
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                <TransactionsHistory />
              </RoleBasedRoute>
            } 
          />

          <Route
            path="controller"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                <ControllerPage />
              </RoleBasedRoute>
            }
          />

          <Route
            path="subscription-packages"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                <SubscriptionPackagePage />
              </RoleBasedRoute>
            }
          />
          
          {/* Shared Routes - All roles can access */}
          <Route 
            path="booking-management" 
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.HOST, UserRole.BUSINESS]}>
                <BookingManagement />
              </RoleBasedRoute>
            } 
          />

          <Route
            path="reviews-ratings"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.HOST, UserRole.BUSINESS]}>
                <ReviewsRatings />
              </RoleBasedRoute>
            }
          />

          <Route
            path="app-slider"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.HOST, UserRole.BUSINESS]}>
                <AppSlider />
              </RoleBasedRoute>
            }
          />

          <Route
            path="subscription"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.HOST, UserRole.BUSINESS]}>
                <Subscription />
              </RoleBasedRoute>
            }
          />

          <Route
            path="notification"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.HOST, UserRole.BUSINESS]}>
                <NotificationPage />
              </RoleBasedRoute>
            }
          />

          <Route
            path="support"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.HOST, UserRole.BUSINESS]}>
                <Support />
              </RoleBasedRoute>
            }
          />

          <Route
            path="my-listing/new"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.HOST, UserRole.BUSINESS]}>
                <MyListingNewPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="my-listing/:id/edit"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.HOST, UserRole.BUSINESS]}>
                <MyListingEditPage />
              </RoleBasedRoute>
            }
          />
          <Route
            path="my-listing"
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.HOST, UserRole.BUSINESS]}>
                <MyListingPage />
              </RoleBasedRoute>
            }
          />
     
          
          {/* Calendar - All roles can access */}
          <Route 
            path="calender" 
            element={
              <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN, UserRole.HOST, UserRole.BUSINESS]}>
                <Calender />
              </RoleBasedRoute>
            } 
          />
          
          
          {/* Product Management */}
          <Route path="products" element={<ProductList />} />
          
          {/* Category Management */}
          <Route path="categories" element={<CategoryList />} />
          
          {/* Settings */}
          <Route path="settings">
            <Route path="profile" element={<ProfileSettings />} />
            <Route path="password" element={<ChangePassword />} />
            <Route path="terms" element={<TermsSettings />} />
            <Route path="privacy" element={<PrivacySettings />} />
            <Route path="about-us" element={<AboutUsSettings />} />
            <Route 
              path="faq" 
              element={
                <RoleBasedRoute allowedRoles={[UserRole.SUPER_ADMIN]}>
                  <FAQ />
                </RoleBasedRoute>
              } 
            />
          </Route>
        </Route>

        {/* Catch all - 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" richColors closeButton />
    </TooltipProvider>
  )
}

export default App
