import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useUrlNumber } from '@/hooks/useUrlState'
import { useAppSelector } from '@/redux/hooks'
import { UserRole } from '@/types/roles'
import {
  mockAppSliders,
  type AppSliderItem,
  type AppSliderTargetType,
} from './sliderData'
import { isAppSliderOwner } from './sliderOwnership'
import { CreateEditSliderModal } from './components/CreateEditSliderModal'
import { AppSliderTable } from './components/AppSliderTable'
import { toast } from '@/utils/toast'

function nextDisplaySerial(sliders: AppSliderItem[]): string {
  const nums = sliders
    .map((s) => parseInt(s.displaySerial.replace(/^#/, ''), 10))
    .filter(Number.isFinite)
  const next = (nums.length ? Math.max(...nums) : 1000) + 1
  return `#${next}`
}

function roleToSliderTargetType(role: string): AppSliderTargetType {
  if (role === UserRole.BUSINESS) return 'business'
  return 'host'
}

export default function AppSlider() {
  const { user } = useAppSelector((state) => state.auth)
  const role = user?.role ?? ''
  const isSuperAdmin = role === UserRole.SUPER_ADMIN
  const defaultTargetType = roleToSliderTargetType(role)

  const [page, setPage] = useUrlNumber('page', 1)
  const [limit, setLimit] = useUrlNumber('limit', 10)

  const [sliders, setSliders] = useState<AppSliderItem[]>(mockAppSliders)
  const [createEditOpen, setCreateEditOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [editingSlider, setEditingSlider] = useState<AppSliderItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AppSliderItem | null>(null)

  const totalItems = sliders.length
  const totalPages = Math.max(1, Math.ceil(totalItems / limit))

  const pageItems = useMemo(() => {
    const start = (page - 1) * limit
    return sliders.slice(start, start + limit)
  }, [sliders, page, limit])

  const openCreate = () => {
    setModalMode('create')
    setEditingSlider(null)
    setCreateEditOpen(true)
  }

  const openEdit = (slider: AppSliderItem) => {
    if (!isSuperAdmin && !isAppSliderOwner(slider, user?.email)) {
      toast({
        variant: 'destructive',
        title: 'Cannot edit this slider',
        description: 'You can only edit sliders you created.',
      })
      return
    }
    setModalMode('edit')
    setEditingSlider(slider)
    setCreateEditOpen(true)
  }

  const requestDelete = (slider: AppSliderItem) => {
    if (!isSuperAdmin && !isAppSliderOwner(slider, user?.email)) {
      toast({
        variant: 'destructive',
        title: 'Cannot delete this slider',
        description: 'You can only delete sliders you created.',
      })
      return
    }
    setDeleteTarget(slider)
  }

  const handleSave = (payload: {
    name: string
    buttonLabel: string
    imageUrl: string
    targetType: AppSliderTargetType
  }) => {
    if (modalMode === 'create') {
      setSliders((prev) => {
        const displaySerial = nextDisplaySerial(prev)
        return [
          {
            id: crypto.randomUUID(),
            displaySerial,
            imageUrl: payload.imageUrl,
            createdAt: new Date().toISOString(),
            userEmail: user?.email?.trim() ?? '',
            name: payload.name,
            buttonLabel: payload.buttonLabel,
            targetType: payload.targetType,
          },
          ...prev,
        ]
      })
    } else if (editingSlider) {
      if (!isSuperAdmin && !isAppSliderOwner(editingSlider, user?.email)) {
        toast({
          variant: 'destructive',
          title: 'Cannot save',
          description: 'You can only update sliders you created.',
        })
        return
      }
      setSliders((prev) =>
        prev.map((s) =>
          s.id === editingSlider.id
            ? {
                ...s,
                imageUrl: payload.imageUrl,
                name: payload.name,
                buttonLabel: payload.buttonLabel,
                targetType: payload.targetType,
              }
            : s
        )
      )
    }
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
    if (!isSuperAdmin && !isAppSliderOwner(deleteTarget, user?.email)) {
      setDeleteTarget(null)
      return
    }
    setSliders((prev) => prev.filter((s) => s.id !== deleteTarget.id))
    setDeleteTarget(null)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="bg-white border-0 shadow-sm rounded-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between p-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#2d2d2d] md:text-3xl">
              App Slider
            </h1>
            <p className="mt-1 text-sm text-muted-foreground md:text-base">
              {isSuperAdmin
                ? 'Create, edit, or delete app banners. Choose whether each banner is for the host or business app.'
                : 'Create sliders for the guest app. You can edit or delete only the sliders tied to your account email.'}
            </p>
          </div>

          <Button
            type="button"
            onClick={openCreate}
            className="rounded-md bg-primary hover:bg-[#5aad26] text-white shrink-0 gap-2"
          >
            <Plus className="h-5 w-5" />
            Create New Slider
          </Button>
        </div>

        <CardContent className="p-0">
          <AppSliderTable
            sliders={pageItems}
            isSuperAdmin={isSuperAdmin}
            currentUserEmail={user?.email}
            onEdit={openEdit}
            onDelete={requestDelete}
          />
          <div className="px-6 py-4 border-t border-gray-100">
            <Pagination
              currentPage={Math.min(page, totalPages)}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={limit}
              onPageChange={setPage}
              onItemsPerPageChange={(n) => {
                setLimit(n)
                setPage(1)
              }}
            />
          </div>
        </CardContent>
      </div>

      <CreateEditSliderModal
        open={createEditOpen}
        onClose={() => {
          setCreateEditOpen(false)
          setEditingSlider(null)
        }}
        mode={modalMode}
        slider={editingSlider}
        isSuperAdmin={isSuperAdmin}
        defaultTargetType={defaultTargetType}
        onSave={handleSave}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete slider"
        description={
          deleteTarget
            ? `Remove “${deleteTarget.name}” from the app slider list? This cannot be undone.`
            : ''
        }
        confirmText="Delete"
      />
    </motion.div>
  )
}
