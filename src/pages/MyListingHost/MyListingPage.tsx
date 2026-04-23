import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SearchInput } from '@/components/common/SearchInput'
import { Pagination } from '@/components/common/Pagination'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { toast } from '@/utils/toast'
import { ListingCard } from './ListingCard'
import { DEFAULT_PAGINATION } from '@/utils/constants'
import {
  type PropertyApiDoc,
  useDeleteMyHostListingMutation,
  useGetAllMyHostListQuery,
} from '@/redux/api/hostMyListingApi'
import { PropertyDetailsModal } from './PropertyDetailsModal'

export default function MyListingHostPage() {
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(DEFAULT_PAGINATION.limit)
  const [deleteTarget, setDeleteTarget] = useState<PropertyApiDoc | null>(null)
  const [detailsTarget, setDetailsTarget] = useState<PropertyApiDoc | null>(null)

  const { data, isLoading } = useGetAllMyHostListQuery({
    page,
    limit: itemsPerPage,
  })
  const items = data?.data ?? []
  const [deleteListing, { isLoading: isDeleting }] =
    useDeleteMyHostListingMutation()

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return items
    return items.filter(
      (x) =>
        x.name.toLowerCase().includes(q) ||
        x.description.toLowerCase().includes(q)
    )
  }, [items, search])

  const totalItems = data?.meta?.total ?? filtered.length
  const totalPages = data?.meta?.totalPage ?? 1
  const pageItems = filtered

  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await deleteListing(deleteTarget._id).unwrap()
      toast({ title: 'Listing removed', variant: 'success' })
      setDeleteTarget(null)
    } catch {
      toast({ title: 'Could not delete listing', variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6 bg-white p-8 rounded-2xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">


      </div>

      <div className='flex items-center gap-4 justify-between'>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2d2d2d] md:text-3xl">
            My Host Listing
          </h1>
          <p className="mt-1 text-sm text-muted-foreground md:text-base">
            Manage your host listings &amp; their availability
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
            onClick={() => navigate('/my-host-listing/new')}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Host Listing
          </Button>
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {pageItems.map((listing) => (
          <ListingCard
            key={listing._id}
            listing={listing}
            onDelete={setDeleteTarget}
            onView={setDetailsTarget}
          />
        ))}
      </div>

      {!isLoading && pageItems.length === 0 && (
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
            ? `This will remove “${deleteTarget.name}” from your listings. This action cannot be undone.`
            : ''
        }
        confirmText="Delete"
        variant="danger"
        isLoading={isDeleting}
      />

      <PropertyDetailsModal
        open={!!detailsTarget}
        onClose={() => setDetailsTarget(null)}
        listing={detailsTarget}
      />

    </div>
  )
}
