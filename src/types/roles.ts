// Role definitions - 3 roles only
export enum UserRole {
  SUPER_ADMIN = 'super-admin',  // Can access /dashboard
  ADMIN = 'admin',              // Goes to /cars
  EMPLOYEE = 'employee',        // Goes to /cars
}

// Route permissions
export interface RoutePermission {
  path: string;
  allowedRoles: UserRole[];
  description?: string;
}

// Define which routes each role can access
export const ROUTE_PERMISSIONS: Record<string, UserRole[]> = {
  // Super Admin only routes
  '/dashboard': [UserRole.SUPER_ADMIN],
  '/users': [UserRole.SUPER_ADMIN],
  '/agency-management': [UserRole.SUPER_ADMIN],
  '/settings/faq': [UserRole.SUPER_ADMIN],
  '/transactions-history': [UserRole.SUPER_ADMIN],
  
  // Shared routes (all can access)
  '/cars': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EMPLOYEE],
  '/booking-management': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EMPLOYEE],
  '/my-listing': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EMPLOYEE],
  '/calender': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EMPLOYEE],
  '/clients': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EMPLOYEE],
  
  // Settings - accessible to all
  '/settings/profile': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EMPLOYEE],
  '/settings/password': [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EMPLOYEE],
};

// Helper function to check if user has access to a route
export const hasRouteAccess = (userRole: string, routePath: string): boolean => {
  // Check exact match first
  if (ROUTE_PERMISSIONS[routePath]) {
    return ROUTE_PERMISSIONS[routePath].includes(userRole as UserRole);
  }
  
  // Check for partial matches (e.g., /users/123 should match /users)
  const matchingRoute = Object.keys(ROUTE_PERMISSIONS).find(route => 
    routePath.startsWith(route)
  );
  
  if (matchingRoute) {
    return ROUTE_PERMISSIONS[matchingRoute].includes(userRole as UserRole);
  }
  
  // Default: deny access if no permission defined
  return false;
};

// Helper to check if route should show filtered data
export const shouldFilterData = (userRole: string, routePath: string): boolean => {
  const sharedRoutes = [
    '/cars',
    '/booking-management',
    '/calender',
  ];
  
  // Admin and Employee see filtered data
  return (userRole === UserRole.ADMIN || userRole === UserRole.EMPLOYEE) && 
         sharedRoutes.some(route => routePath.startsWith(route));
};
