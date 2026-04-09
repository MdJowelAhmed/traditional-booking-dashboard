import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import { formatDate } from '@/utils/formatters'
import type { AppSliderItem } from '../sliderData'
import { SliderRowActionMenu } from './SliderRowActionMenu'

function SliderStatusPill({ status }: { status: AppSliderItem['status'] }) {
  const isOngoing = status === 'ongoing'
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium',
        isOngoing
          ? 'bg-[#E7F6D5] border-[#6BBF2D] text-[#2E6A0D]'
          : 'bg-orange-50 border-orange-300 text-orange-800'
      )}
    >
      {isOngoing ? 'Ongoing' : 'Pending'}
    </span>
  )
}

interface AppSliderTableProps {
  sliders: AppSliderItem[]
  onEdit: (slider: AppSliderItem) => void
  onDelete: (slider: AppSliderItem) => void
}

export function AppSliderTable({ sliders, onEdit, onDelete }: AppSliderTableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[960px]">
        <thead>
          <tr className="bg-primary text-white">
            <th className="px-6 py-4 text-left text-sm font-bold">S.No</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Image</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Date</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Name</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Button</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Status</th>
            <th className="px-6 py-4 text-right text-sm font-bold w-[200px]" aria-label="Row actions" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {sliders.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                No sliders yet. Create your first banner.
              </td>
            </tr>
          ) : (
            sliders.map((slider, index) => (
              <motion.tr
                key={slider.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4">
                  <span className="text-sm font-medium text-slate-700">
                    {slider.displaySerial}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="h-12 w-28 overflow-hidden rounded-md border border-slate-200 bg-muted">
                    <img
                      src={slider.imageUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">
                    {formatDate(slider.createdAt, 'd MMMM, yyyy')}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">{slider.name}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">{slider.buttonLabel}</span>
                </td>
                <td className="px-6 py-4">
                  <SliderStatusPill status={slider.status} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end">
                    <SliderRowActionMenu
                      slider={slider}
                      onEdit={onEdit}
                      onDelete={onDelete}
                    />
                  </div>
                </td>
              </motion.tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
