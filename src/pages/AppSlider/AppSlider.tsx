import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardContent } from '@/components/ui/card'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useUrlNumber } from '@/hooks/useUrlState'
import { mockAppSliders, type AppSliderItem } from './sliderData'
import { CreateEditSliderModal } from './components/CreateEditSliderModal'
import { AppSliderTable } from './components/AppSliderTable'

function nextDisplaySerial(sliders: AppSliderItem[]): string {
  const nums = sliders
    .map((s) => parseInt(s.displaySerial.replace(/^#/, ''), 10))
    .filter(Number.isFinite)
  const next = (nums.length ? Math.max(...nums) : 1000) + 1
  return `#${next}`
}

export default function AppSlider() {
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
    setModalMode('edit')
    setEditingSlider(slider)
    setCreateEditOpen(true)
  }

  const handleSave = (payload: {
    name: string
    buttonLabel: string
    imageUrl: string
    status: AppSliderItem['status']
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
            name: payload.name,
            buttonLabel: payload.buttonLabel,
            status: payload.status,
          },
          ...prev,
        ]
      })
    } else if (editingSlider) {
      setSliders((prev) =>
        prev.map((s) =>
          s.id === editingSlider.id
            ? {
              ...s,
              imageUrl: payload.imageUrl,
              name: payload.name,
              buttonLabel: payload.buttonLabel,
            }
            : s
        )
      )
    }
  }

  const confirmDelete = () => {
    if (!deleteTarget) return
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
              Manage home banners and promotional slides shown in the guest app
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
            onEdit={openEdit}
            onDelete={setDeleteTarget}
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
