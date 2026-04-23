import { UserRole } from '@/types/roles'

export const addBusinessIdToMockData = <T extends Record<string, unknown>>(
  data: T[],
  businessIdField: string = 'businessId'
): T[] => {
  const businessIds = ['business-001', 'business-002', 'business-003']
  return data.map((item, index) => ({
    ...item,
    [businessIdField]: businessIds[index % businessIds.length],
  }))
}

export const filterDataByRole = <T extends Record<string, unknown>>(
  data: T[],
  userRole: string,
  userBusinessId?: string,
  businessIdField: string = 'businessId'
): T[] => {
  if (userRole === UserRole.HOST) {
    return data
  }

  if (userRole === UserRole.SERVICE && userBusinessId) {
    return data.filter((item) => item[businessIdField] === userBusinessId)
  }

  return []
}

export const canAccessItem = (
  item: Record<string, unknown>,
  userRole: string,
  userBusinessId?: string,
  businessIdField: string = 'businessId'
): boolean => {
  if (userRole === UserRole.HOST) {
    return true
  }

  if (userRole === UserRole.SERVICE && userBusinessId) {
    return item[businessIdField] === userBusinessId
  }

  return false
}

export const getRoleBadgeColor = (role: string): string => {
  switch (role) {
    case UserRole.HOST:
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
    case UserRole.SERVICE:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
  }
}

export const getRoleDisplayName = (role: string): string => {
  switch (role) {
    case UserRole.HOST:
      return 'Host'
    case UserRole.SERVICE:
      return 'Service'
    default:
      return 'Unknown'
  }
}
