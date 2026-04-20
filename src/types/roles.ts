// Auth roles — exactly three
export enum UserRole {
  HOST = 'host',
  BUSINESS = 'business',
}

const ALL_APP_ROLES = [UserRole.HOST, UserRole.BUSINESS]

export interface RoutePermission {
  path: string
  allowedRoles: UserRole[]
  description?: string
}

/** Route → allowed roles (extend as you add routes) */
export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  '/dashboard': ALL_APP_ROLES,
  '/users': [UserRole.HOST],
  '/controller': [UserRole.HOST],
  '/subscription-packages': [UserRole.HOST],
  '/agency-management': [UserRole.HOST],
  '/transactions-history': [UserRole.HOST],
  '/settings/faq': [UserRole.HOST],
  '/settings/terms': ALL_APP_ROLES,
  '/settings/privacy': ALL_APP_ROLES,
  '/settings/about-us': ALL_APP_ROLES,
  '/cars': ALL_APP_ROLES,
  '/booking-management': ALL_APP_ROLES,
  '/my-listing': ALL_APP_ROLES,
  '/calender': ALL_APP_ROLES,
  '/clients': ALL_APP_ROLES,
  '/reviews-ratings': ALL_APP_ROLES,
  '/app-slider': ALL_APP_ROLES,
  '/subscription': ALL_APP_ROLES,
  '/notification': ALL_APP_ROLES,
  '/support': ALL_APP_ROLES,
  '/settings/profile': ALL_APP_ROLES,
  '/settings/password': ALL_APP_ROLES,
}

export const getDefaultRouteForRole = (role: string): string => {
  if (role === UserRole.HOST) return '/booking-management'
  if (role === UserRole.BUSINESS) return '/my-listing'
  return '/booking-management'
}

export const hasRouteAccess = (userRole: string, routePath: string): boolean => {
  if (ROUTE_PERMISSIONS[routePath]) {
    return ROUTE_PERMISSIONS[routePath].includes(userRole as UserRole)
  }

  const matchingRoute = Object.keys(ROUTE_PERMISSIONS).find((route) =>
    routePath.startsWith(route)
  )

  if (matchingRoute) {
    return ROUTE_PERMISSIONS[matchingRoute].includes(userRole as UserRole)
  }

  return false
}

/** Host + Business may see scoped data on these areas */
export const shouldFilterData = (userRole: string, routePath: string): boolean => {
  const sharedRoutes = ['/cars', '/booking-management', '/calender']
  return (
    userRole === UserRole.BUSINESS &&
    sharedRoutes.some((route) => routePath.startsWith(route))
  )
}
