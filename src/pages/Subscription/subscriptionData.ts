export type SubscriptionStatus = 'active' | 'expired'

export type SubscriptionAccountType = 'host' | 'business'

export interface SubscriptionRow {
  id: string
  displaySerial: string
  packageName: string
  purchasedAt: string
  /** Subscription end date (ISO) */
  endsAt: string
  price: number
  currency: string
  status: SubscriptionStatus
  userName: string
  userEmail: string
  accountType: SubscriptionAccountType
}

export interface PackageTier {
  id: string
  badge: string
  mostPopular?: boolean
  price: number
  billingLabel: string
  /** true = included, false = excluded */
  features: boolean[]
  featureLabels: string[]
}

export const PACKAGE_TIERS: PackageTier[] = [
  {
    id: 'basic',
    badge: 'Basic',
    price: 37,
    billingLabel: 'Per Year',
    featureLabels: ['1-3 properties', '4-6 properties', '7 plus properties'],
    features: [true, false, false],
  },
  {
    id: 'standard',
    badge: 'Standard',
    mostPopular: true,
    price: 37,
    billingLabel: 'Per Year',
    featureLabels: ['1-3 properties', '4-6 properties', '7 plus properties'],
    features: [true, true, false],
  },
  {
    id: 'premium',
    badge: 'Premium',
    price: 37,
    billingLabel: 'Per Year',
    featureLabels: ['1-3 properties', '4-6 properties', '7 plus properties'],
    features: [true, true, true],
  },
]

export const mockSubscriptions: SubscriptionRow[] = [
  {
    id: '1',
    displaySerial: '#1001',
    packageName: 'Monthly Premium',
    purchasedAt: '2026-03-16T12:00:00.000Z',
    endsAt: '2027-03-16T12:00:00.000Z',
    price: 40,
    currency: 'USD',
    status: 'active',
    userName: 'Alex Host',
    userEmail: 'host@example.com',
    accountType: 'host',
  },
  {
    id: '2',
    displaySerial: '#1002',
    packageName: 'Standard Plan',
    purchasedAt: '2025-06-01T10:00:00.000Z',
    endsAt: '2026-06-01T10:00:00.000Z',
    price: 37,
    currency: 'USD',
    status: 'expired',
    userName: 'Jamie Business',
    userEmail: 'business@example.com',
    accountType: 'business',
  },
]

export function tierToDisplayName(tier: PackageTier): string {
  if (tier.id === 'basic') return 'Basic Plan'
  if (tier.id === 'premium') return 'Premium Plan'
  return `${tier.badge} Plan`
}

/** Default subscription length when buying a package (mock). */
export function defaultEndsAtFromPurchase(purchasedAtIso: string): string {
  const d = new Date(purchasedAtIso)
  d.setFullYear(d.getFullYear() + 1)
  return d.toISOString()
}
