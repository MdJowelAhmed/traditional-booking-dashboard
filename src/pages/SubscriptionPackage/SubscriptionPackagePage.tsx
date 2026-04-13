import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import {
  tierSeedToAdminPackages,
  type AdminSubscriptionPackage,
} from './subscriptionPackageData'
import { SubscriptionPackageCard } from './components/SubscriptionPackageCard'
import {
  AddEditPackageModal,
  type SaveSubscriptionPackageInput,
} from './components/AddEditPackageModal'

export default function SubscriptionPackagePage() {
  const [packages, setPackages] = useState<AdminSubscriptionPackage[]>(tierSeedToAdminPackages)
  const [listTab, setListTab] = useState<'host' | 'business'>('host')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editing, setEditing] = useState<AdminSubscriptionPackage | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AdminSubscriptionPackage | null>(null)

  const openCreate = () => {
    setModalMode('create')
    setEditing(null)
    setModalOpen(true)
  }

  const openEdit = (pkg: AdminSubscriptionPackage) => {
    setModalMode('edit')
    setEditing(pkg)
    setModalOpen(true)
  }

  const handleSave = (payload: SaveSubscriptionPackageInput) => {
    const next: AdminSubscriptionPackage = {
      id: payload.id ?? crypto.randomUUID(),
      name: payload.name,
      price: payload.price,
      billingLabel: payload.billingLabel,
      mostPopular: payload.mostPopular,
      packageType: payload.packageType,
      propertyFeatureLabels: payload.propertyFeatureLabels,
      propertyFeatures: payload.propertyFeatures,
      serviceFeatureLabels: payload.serviceFeatureLabels,
      serviceFeatures: payload.serviceFeatures,
    }

    setPackages((prev) => {
      let list =
        modalMode === 'create'
          ? [next, ...prev]
          : prev.map((p) => (p.id === next.id ? next : p))

      if (next.mostPopular) {
        list = list.map((p) => (p.id === next.id ? p : { ...p, mostPopular: false }))
      }

      return list
    })
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    setPackages((prev) => prev.filter((p) => p.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2d2d2d] md:text-3xl">
            Subscription Package
          </h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            Create and manage subscription plans shown to hosts and businesses
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreate}
          className="shrink-0 gap-2 rounded-md bg-primary text-white hover:bg-[#5aad26]"
        >
          <Plus className="h-5 w-5" />
          Add package
        </Button>
      </div>

      <Tabs value={listTab} onValueChange={(v) => setListTab(v as 'host' | 'business')}>
        <TabsList className="mb-4">
          <TabsTrigger value="host">Host</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
        </TabsList>

        <TabsContent value="host" className="mt-0">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {packages
              .filter((p) => p.packageType === 'host')
              .map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * index }}
              >
                <SubscriptionPackageCard
                  pkg={pkg}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                />
              </motion.div>
            ))}
          </div>
          {packages.filter((p) => p.packageType === 'host').length === 0 && (
            <p className="text-center text-muted-foreground py-12 border rounded-xl bg-white">
              {packages.length === 0
                ? 'No packages yet. Click "Add package" to create one.'
                : 'No host packages yet. Switch to Business or add a host package.'}
            </p>
          )}
        </TabsContent>

        <TabsContent value="business" className="mt-0">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {packages
              .filter((p) => p.packageType === 'business')
              .map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.06 * index }}
              >
                <SubscriptionPackageCard
                  pkg={pkg}
                  onEdit={openEdit}
                  onDelete={setDeleteTarget}
                />
              </motion.div>
            ))}
          </div>
          {packages.filter((p) => p.packageType === 'business').length === 0 && (
            <p className="text-center text-muted-foreground py-12 border rounded-xl bg-white">
              {packages.length === 0
                ? 'No packages yet. Click "Add package" to create one.'
                : 'No business packages yet. Switch to Host or add a business package.'}
            </p>
          )}
        </TabsContent>
      </Tabs>

      <AddEditPackageModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false)
          setEditing(null)
        }}
        mode={modalMode}
        pkg={editing}
        onSave={handleSave}
        defaultTypeForCreate={listTab}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete package"
        description={
          deleteTarget
            ? `Remove the “${deleteTarget.name}” package? Subscribers may still reference it until you update billing.`
            : ''
        }
        confirmText="Delete"
      />
    </motion.div>
  )
}
