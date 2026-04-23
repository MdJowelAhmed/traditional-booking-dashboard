import { useAppSelector } from '@/redux/hooks'
import { RoleBadge } from '@/components/common/RoleBadge'
import { Building2 } from 'lucide-react'
import { UserRole } from '@/types/roles'

export function UserRoleIndicator() {
  const { user } = useAppSelector((state) => state.auth)

  if (!user) return null

  return (
    <div className="flex flex-col gap-1 rounded-lg border bg-muted/50 px-3 py-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">Logged in as</span>
        <RoleBadge role={user.role} />
      </div>

      {user.role === UserRole.SERVICE && user.businessName && (
        <div className="flex items-center gap-1.5 border-t pt-2 text-xs text-muted-foreground mt-1">
          <Building2 className="h-3 w-3 shrink-0" />
          <span className="truncate">{user.businessName}</span>
        </div>
      )}
    </div>
  )
}
