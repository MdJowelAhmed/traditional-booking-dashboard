import { useAppSelector } from '@/redux/hooks'
import { UserRole } from '@/types/roles'
import CreateEditListingPage from './CreateEditListingPage'
import CreateEditHostListingPage from './CreateEditHostListingPage'

/** `/my-listing/new` — host uses property form page; others use business/service form */
export function MyListingNewPage() {
  const { user } = useAppSelector((s) => s.auth)
  if (user?.role === UserRole.HOST) return <CreateEditHostListingPage />
  return <CreateEditListingPage />
}

/** `/my-listing/:id/edit` — same split by role */
export function MyListingEditPage() {
  const { user } = useAppSelector((s) => s.auth)
  if (user?.role === UserRole.HOST) return <CreateEditHostListingPage />
  return <CreateEditListingPage />
}
