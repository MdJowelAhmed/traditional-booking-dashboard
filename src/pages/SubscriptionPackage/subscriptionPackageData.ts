import { PACKAGE_TIERS } from '@/pages/Subscription/subscriptionData'

/** Package definition managed by super-admin (drives card UI + buy flow can sync later). */
export interface AdminSubscriptionPackage {
  id: string
  name: string
  price: number
  billingLabel: string
  mostPopular: boolean
  packageType: 'host' | 'business'
  /** Host-facing (Property) feature list */
  propertyFeatureLabels: [string, string, string]
  propertyFeatures: [boolean, boolean, boolean]
  /** Business-facing (Service) feature list */
  serviceFeatureLabels: [string, string, string]
  serviceFeatures: [boolean, boolean, boolean]
}

export function tierSeedToAdminPackages(): AdminSubscriptionPackage[] {
  return PACKAGE_TIERS.map((t) => ({
    id: t.id,
    name: t.badge,
    price: t.price,
    billingLabel: t.billingLabel,
    mostPopular: !!t.mostPopular,
    packageType: 'host',
    propertyFeatureLabels: [t.featureLabels[0], t.featureLabels[1], t.featureLabels[2]] as [
      string,
      string,
      string,
    ],
    propertyFeatures: [t.features[0], t.features[1], t.features[2]] as [boolean, boolean, boolean],
    // Seed service features with same defaults until API wiring exists.
    serviceFeatureLabels: [t.featureLabels[0], t.featureLabels[1], t.featureLabels[2]] as [
      string,
      string,
      string,
    ],
    serviceFeatures: [t.features[0], t.features[1], t.features[2]] as [boolean, boolean, boolean],
  }))
}
