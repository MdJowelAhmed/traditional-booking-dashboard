import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Settings,
  User,
  Lock,
  FileText,
  Shield,
  Info,
  ListOrdered,
 
  Star,
  LifeBuoy,
  ImageIcon,
  Crown,
  Gamepad2,
  Package,
  ListChecksIcon,
  LogOut,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { toggleSidebar } from '@/redux/slices/uiSlice'
import { cn } from '@/utils/cn'
import { UserRole } from '@/types/roles'
import { UserRoleIndicator } from '@/components/layout/UserRoleIndicator'
import { Button } from '../ui/button'
import { logout } from '@/redux/slices/authSlice'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  children?: NavItem[]
  allowedRoles?: UserRole[] // If not specified, accessible to all
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.HOST, UserRole.BUSINESS], 
  },

  {
    title: 'My Listing',
    href: '/my-listing',
    icon: ListChecksIcon,
    allowedRoles: [ UserRole.HOST, UserRole.BUSINESS],
  },
  
  {
    title: 'Booking Management',
    href: '/booking-management',
    icon: ListOrdered,
    allowedRoles: [ UserRole.HOST, UserRole.BUSINESS],
  },

  // {
  //   title: 'Calendar',
  //   href: '/calender',
  //   icon: Calendar,
  //   allowedRoles: [UserRole.SUPER_ADMIN, UserRole.HOST, UserRole.BUSINESS],
  // },
  // {
  //   title: 'Transactions History',
  //   href: '/transactions-history',
  //   icon: CreditCard,
  //   allowedRoles: [UserRole.SUPER_ADMIN], // Super Admin only
  // },
  {
    title: 'Controller',
    href: '/controller',
    icon: Gamepad2,
    allowedRoles: [UserRole.SUPER_ADMIN],
  },
  {
    title: 'Reviews & Ratings',
    href: '/reviews-ratings',
    icon: Star,
    allowedRoles: [ UserRole.HOST, UserRole.BUSINESS],
  },
  {
    title: 'App Slider',
    href: '/app-slider',
    icon: ImageIcon,
    allowedRoles: [UserRole.SUPER_ADMIN, ],
  },
  {
    title: 'Subscription Package',
    href: '/subscription-packages',
    icon: Package,
    allowedRoles: [UserRole.SUPER_ADMIN],
  },
  {
    title: 'Subscription',
    href: '/subscription',
    icon: Crown,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.HOST, UserRole.BUSINESS],
  },
  {
    title: 'Support',
    href: '/support',
    icon: LifeBuoy,
    allowedRoles: [ UserRole.HOST, UserRole.BUSINESS ],
  },

]

const settingsItems: NavItem[] = [
  {
    title: 'Profile',
    href: '/settings/profile',
    icon: User,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.HOST, UserRole.BUSINESS],
  },
  {
    title: 'Password',
    href: '/settings/password',
    icon: Lock,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.HOST, UserRole.BUSINESS],
  },
  {
    title: 'Terms',
    href: '/settings/terms',
    icon: FileText,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.HOST, UserRole.BUSINESS],
  },
  {
    title: 'Privacy',
    href: '/settings/privacy',
    icon: Shield,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.HOST, UserRole.BUSINESS],
  },
  {
    title: 'About Us',
    href: '/settings/about-us',
    icon: Info,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.HOST, UserRole.BUSINESS],
  },
  // {
  //   title: 'FAQ',
  //   href: '/settings/faq',
  //   icon: HelpCircle,
  //   allowedRoles: [UserRole.SUPER_ADMIN],
  // },
]

export function Sidebar() {
  const dispatch = useAppDispatch()
  const { sidebarCollapsed } = useAppSelector((state) => state.ui)
  const { user } = useAppSelector((state) => state.auth)
  const location = useLocation()
  const navigate = useNavigate()
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const isSettingsActive = location.pathname.startsWith('/settings')

  // 🔍 Console log for debugging
  console.log('📊 Sidebar Debug Info:');
  console.log('User:', user);
  console.log('User Role:', user?.role);
  console.log('User Role Type:', typeof user?.role);

  // Filter navigation items based on user role
  const filteredNavItems = navItems.filter((item) => {
    if (!item.allowedRoles) return true // No restriction
    if (!user) return false
    const hasAccess = item.allowedRoles.includes(user.role as UserRole)
    console.log(`🔐 ${item.title}: hasAccess=${hasAccess}, userRole=${user.role}, allowedRoles=${item.allowedRoles.join(', ')}`)
    return hasAccess
  })

  const filteredSettingsItems = settingsItems.filter((item) => {
    if (!item.allowedRoles) return true // No restriction
    if (!user) return false
    return item.allowedRoles.includes(user.role as UserRole)
  })

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      dispatch(logout())
      toast.success('User logged out successfully')
      navigate('/auth/login')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity',
          sidebarCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
        )}
        onClick={() => dispatch(toggleSidebar())}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full bg-card shadow-xl transition-all duration-300',
          'flex flex-col',
          sidebarCollapsed ? 'w-[80px]' : 'w-[280px]',
          'lg:translate-x-0',
          sidebarCollapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-36 px-4 border-b">
          <div className="flex items-center gap-3">
            <div className="h-32 w-32 rounded-lg flex items-center justify-center">
              <div className="text-primary text-white font-bold text-lg">
                <img src="/logo2.png" alt="Booking Dashboard" className="h-32 w-32" />
              </div>
            </div>
            {/* {!sidebarCollapsed && (
              <span className="font-display font-bold text-xl text-accent">Dashboard</span>
            )} */}
          </div>
          {/* <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => dispatch(toggleSidebar())}
            className="hidden lg:flex"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-4 w-4 text-accent" />
            ) : (
              <ChevronLeft className="h-4 w-4 text-accent" />
            )}
          </Button> */}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin p-3 space-y-1">
          {/* Main Navigation */}
          <div className="space-y-1">
            {!sidebarCollapsed && (
              <p className="px-3 py-2 text-xs font-semibold text-accent-foreground uppercase tracking-wider">
                Main Menu
              </p>
            )}
            {filteredNavItems.map((item) => (
              <SidebarNavItem
                key={item.href}
                item={item}
                collapsed={sidebarCollapsed}
              />
            ))}
          </div>

          <Separator className="my-4" />

          {/* Settings Navigation */}
          <div className="space-y-1">
            {!sidebarCollapsed && (
              <p className="px-3 py-2 text-xs font-semibold text-accent-foreground uppercase tracking-wider">
                Settings
              </p>
            )}
            {sidebarCollapsed ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <NavLink
                    to="/settings/profile"
                    className={cn(
                      'flex items-center justify-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                      'hover:bg-primary hover:text-accent-foreground',
                      isSettingsActive
                        ? 'bg-primary text-white shadow-md'
                        : 'text-muted-foreground'
                    )}
                  > 
                    <Settings
                      className={cn(
                        'h-5 w-5 flex-shrink-0',
                        isSettingsActive
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      )}
                    />
                  </NavLink>
                </TooltipTrigger>
                <TooltipContent side="right">Settings</TooltipContent>
              </Tooltip>
            ) : (
              filteredSettingsItems.map((item) => (
                <SidebarNavItem
                  key={item.href}
                  item={item}
                  collapsed={sidebarCollapsed}
                />
              ))
            )}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t space-y-3">
          {!sidebarCollapsed && user && (
            <UserRoleIndicator />
          )}
          {/* {!sidebarCollapsed && (
            <p className="text-xs text-muted-foreground text-center">
              © 2026 Motly v1.0
            </p>
          )} */}

          {/* <Button variant="outline" className="w-full" onClick={handleLogout}> <LogOut className="h-4 w-4 mr-2" /> Logout</Button> */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setLogoutDialogOpen(true)}
          >
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>
      <ConfirmDialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        onConfirm={handleLogout}
        onSuccess={() => setLogoutDialogOpen(false)}
        title="Confirm logout"
        description="Are you sure you want to log out?"
        confirmText="Yes, Logout"
        cancelText="Cancel"
        variant="danger"
        isLoading={isLoggingOut}
      />
    </>
  )
}

interface SidebarNavItemProps {
  item: NavItem
  collapsed: boolean
}

function SidebarNavItem({ item, collapsed }: SidebarNavItemProps) {
  const Icon = item.icon

  const linkContent = (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all duration-200',
          'hover:bg-[#CEF8DA] hover:text-[#0C5822]',
          collapsed && 'justify-center',
          isActive
            ? 'bg-[#CEF8DA] text-[#0C5822] shadow-md'
            : 'text-[#656565]'
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              'h-5 w-5 flex-shrink-0',
              isActive && !collapsed ? 'text-[#0C5822]' : isActive && collapsed ? 'text-[#0C5822]' : 'text-[#656565]'
            )}
          />
          {!collapsed && <span className="font-medium">{item.title}</span>}
        </>
      )}
    </NavLink>
  )

  if (collapsed) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right">{item.title}</TooltipContent>
      </Tooltip>
    )
  }

  return linkContent
}




