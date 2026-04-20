import { useMemo } from 'react'
import { useAppSelector } from '@/redux/hooks'
import { UserRole } from '@/types/roles'

interface DataItem {
  businessId?: string
  userId?: string
  [key: string]: string | number | undefined
}

/** Host sees all rows; Business sees only its scope. */
export const useRoleBasedData = <T extends DataItem>(data: T[]): T[] => {
  const { user } = useAppSelector((state) => state.auth)

  return useMemo(() => {
    if (!user) return []

    if (user.role === UserRole.HOST) {
      return data
    }

    if (user.role === UserRole.BUSINESS && user.businessId) {
      return data.filter(
        (item) =>
          item.businessId === user.businessId || item.userId === user.id
      )
    }

    return []
  }, [data, user])
}

/** @deprecated Use useIsHost — kept for compatibility */
export const useIsAdmin = (): boolean => {
  const { user } = useAppSelector((state) => state.auth)
  return user?.role === UserRole.HOST
}

export const useIsHost = (): boolean => {
  const { user } = useAppSelector((state) => state.auth)
  return user?.role === UserRole.HOST
}

export const useIsBusiness = (): boolean => {
  const { user } = useAppSelector((state) => state.auth)
  return user?.role === UserRole.BUSINESS
}

export const useBusinessId = (): string | undefined => {
  const { user } = useAppSelector((state) => state.auth)
  return user?.businessId
}

export const useCanModifyItem = (item: DataItem): boolean => {
  const { user } = useAppSelector((state) => state.auth)

  if (!user) return false

  if (user.role === UserRole.HOST) {
    return true
  }

  if (user.role === UserRole.BUSINESS) {
    return item.businessId === user.businessId || item.userId === user.id
  }

  return false
}
