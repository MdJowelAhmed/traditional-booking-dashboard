import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Settings,
  User,
  Lock,
  FileText,
  Shield,
 
  Calendar,
  CreditCard,
  HelpCircle,
  ListOrdered,
  LayoutGrid,
} from 'lucide-react'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { toggleSidebar } from '@/redux/slices/uiSlice'
import { cn } from '@/utils/cn'
import { UserRole } from '@/types/roles'

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
    allowedRoles: [UserRole.SUPER_ADMIN], // Super Admin only
  },

 
  
  {
    title: 'Booking Management',
    href: '/booking-management',
    icon: ListOrdered,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EMPLOYEE], // All can access
  },
  {
    title: 'My Listing',
    href: '/my-listing',
    icon: LayoutGrid,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EMPLOYEE],
  },
  {
    title: 'Calendar',
    href: '/calender',
    icon: Calendar,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EMPLOYEE], // All can access
  },
  {
    title: 'Transactions History',
    href: '/transactions-history',
    icon: CreditCard,
    allowedRoles: [UserRole.SUPER_ADMIN], // Super Admin only
  },

]

const settingsItems: NavItem[] = [
  {
    title: 'Profile',
    href: '/settings/profile',
    icon: User,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EMPLOYEE], // All can access
  },
  {
    title: 'Password',
    href: '/settings/password',
    icon: Lock,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EMPLOYEE], // All can access
  },
  {
    title: 'Terms',
    href: '/settings/terms',
    icon: FileText,
    allowedRoles: [UserRole.SUPER_ADMIN], // Super Admin only
  },
  {
    title: 'Privacy',
    href: '/settings/privacy',
    icon: Shield,
    allowedRoles: [UserRole.SUPER_ADMIN], // Super Admin only
  },
  {
    title: 'FAQ',
    href: '/settings/faq',
    icon: HelpCircle,
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN], // Super Admin only
  },
]

export function Sidebar() {
  const dispatch = useAppDispatch()
  const { sidebarCollapsed } = useAppSelector((state) => state.ui)
  const { user } = useAppSelector((state) => state.auth)
  const location = useLocation()

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
        <div className="p-4 border-t">
          {!sidebarCollapsed && (
            <p className="text-xs text-muted-foreground text-center">
              © 2026 Motly v1.0
            </p>
          )}
        </div>
      </aside>
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




