import { Badge } from '@/components/ui/badge'
import { Building2, Briefcase } from 'lucide-react'
import { cn } from '@/utils/cn'
import { UserRole } from '@/types/roles'
import { getRoleDisplayName } from '@/utils/roleHelpers'

interface RoleBadgeProps {
  role: string
  className?: string
  showIcon?: boolean
}

export function RoleBadge({ role, className, showIcon = true }: RoleBadgeProps) {
  const variant = role === UserRole.HOST ? 'host' : 'service'

  return (
    <Badge
      variant="outline"
      className={cn(
        'gap-1 font-medium border-0',
        variant === 'host' &&
          'bg-purple-100 text-purple-800 hover:bg-purple-200/90',
        variant === 'service' &&
          'bg-blue-100 text-blue-800 hover:bg-blue-200/90',
        className
      )}
    >
      {showIcon &&
        (variant === 'host' ? (
          <Building2 className="h-3 w-3" />
        ) : (
          <Briefcase className="h-3 w-3" />
        ))}
      {getRoleDisplayName(role)}
    </Badge>
  )
}
