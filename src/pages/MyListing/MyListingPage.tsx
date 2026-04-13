import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/common/SearchInput'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { useAppDispatch, useAppSelector } from '@/redux/hooks'
import { removeMyListing } from '@/redux/slices/myListingSlice'
import { toast } from '@/utils/toast'
import type { MyListing } from '@/types/myListing'
import { ListingCard } from './ListingCard'
import { DEFAULT_PAGINATION } from '@/utils/constants'

export default function MyListingPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const items = useAppSelector((s) => s.myListings.items)

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGINATION.limit)
  const [deleteTarget, setDeleteTarget] = useState<MyListing | null>(null)

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (x) =>
        x.title.toLowerCase().includes(q) ||
        x.description.toLowerCase().includes(q)
    )
  }, [items, search])

  const totalItems = filtered.length
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))

  const pageItems = useMemo(() => {
    const start = (page - 1) * itemsPerPage
    return filtered.slice(start, start + itemsPerPage)
  }, [filtered, page, itemsPerPage])

  const handleDelete = () => {
    if (!deleteTarget) return
    dispatch(removeMyListing(deleteTarget.id))
    toast({ title: 'Listing removed', variant: 'success' })
    setDeleteTarget(null)
  }

  return (
    <div className="space-y-6 bg-white p-8 rounded-2xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">


      </div>

      <div className='flex items-center gap-4 justify-between'>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2d2d2d] md:text-3xl">
            My Listing
          </h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            Manage your properties &amp; their availability
          </p>
        </div>
        <div className='flex items-center gap-4'>
          <SearchInput
            value={search}
            onChange={(v) => {
              setSearch(v)
              setPage(1)
            }}
            placeholder="Search here"
            className="max-w-full max-w-xl"
          />
          <Button
            type="button"
            className="w-full rounded-md bg-[#22C55E] px-6 text-white hover:bg-[#16A34A] lg:w-auto shrink-0"
            onClick={() => navigate('/my-listing/new')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Listing
          </Button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {pageItems.map((listing) => (
          <ListingCard
            key={listing.id}
            listing={listing}
            onDelete={setDeleteTarget}
          />
        ))}
      </div>

      {pageItems.length === 0 && (
        <p className="py-12 text-center text-muted-foreground">
          No listings match your search.
        </p>
      )}

      {totalItems > 0 && (
        <Pagination
          currentPage={Math.min(page, totalPages)}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onPageChange={setPage}
          onItemsPerPageChange={(n) => {
            setItemsPerPage(n)
            setPage(1)
          }}
        />
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete listing?"
        description={
          deleteTarget
            ? `This will remove “${deleteTarget.title}” from your listings. This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        variant="danger"
      />

    </div>
  )
}
