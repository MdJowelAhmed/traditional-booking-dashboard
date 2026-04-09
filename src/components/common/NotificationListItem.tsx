import { Mail } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/utils/cn'
import { getInitials } from '@/utils/formatters'
import type { NotificationEntry } from '@/mocks/notificationData'

interface NotificationListItemProps {
  item: NotificationEntry
  className?: string
}

export function NotificationListItem({ item, className }: NotificationListItemProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm',
        className
      )}
    >
      {item.variant === 'email' ? (
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary"
          aria-hidden
        >
          <Mail className="h-5 w-5 text-white" />
        </div>
      ) : (
        <Avatar className="h-12 w-12 shrink-0 border border-slate-100">
          <AvatarImage src={item.avatarUrl} alt="" />
          <AvatarFallback className="bg-slate-100 text-slate-600 text-sm">
            {getInitials('Guest', 'User')}
          </AvatarFallback>
        </Avatar>
      )}
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-slate-900">{item.title}</p>
        <p className="text-sm text-muted-foreground leading-snug">{item.description}</p>
      </div>
    </div>
  )
}
