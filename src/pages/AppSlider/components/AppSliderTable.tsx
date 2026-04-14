import { motion } from 'framer-motion'
import { cn } from '@/utils/cn'
import type { AppSliderItem } from '../sliderData'
import { SliderRowActionMenu } from './SliderRowActionMenu'

function TargetTypePill({ targetType }: { targetType: AppSliderItem['targetType'] }) {
  const isHost = targetType === 'host'
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-medium',
        isHost
          ? 'bg-sky-50 border-sky-200 text-sky-900'
          : 'bg-violet-50 border-violet-200 text-violet-900'
      )}
    >
      {isHost ? 'Host' : 'Business'}
    </span>
  )
}

interface AppSliderTableProps {
  sliders: AppSliderItem[]
  isSuperAdmin: boolean
  currentUserEmail?: string | null
  onEdit: (slider: AppSliderItem) => void
  onDelete: (slider: AppSliderItem) => void
}

export function AppSliderTable({
  sliders,
  isSuperAdmin,
  currentUserEmail,
  onEdit,
  onDelete,
}: AppSliderTableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className="w-full min-w-[960px]">
        <thead>
          <tr className="bg-primary text-white">
            <th className="px-6 py-4 text-left text-sm font-bold">S.No</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Image</th>
            <th className="px-6 py-4 text-left text-sm font-bold">User email</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Name</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Button</th>
            <th className="px-6 py-4 text-left text-sm font-bold">Type</th>
            <th className="px-6 py-4 text-right text-sm font-bold w-[200px]" aria-label="Row actions" />
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 bg-white">
          {sliders.length === 0 ? (
            <tr>
              <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                {isSuperAdmin
                  ? 'No sliders yet. Create banners for host or business apps.'
                  : 'No sliders yet. Create your first banner.'}
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
                <td className="px-6 py-4 max-w-[220px]">
                  <span
                    className="text-sm text-slate-700 break-all"
                    title={slider.userEmail}
                  >
                    {slider.userEmail || '—'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">{slider.name}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-700">{slider.buttonLabel}</span>
                </td>
                <td className="px-6 py-4">
                  <TargetTypePill targetType={slider.targetType} />
                </td>
                <td className="px-6 py-4">
                  <div className="flex justify-end">
                    <SliderRowActionMenu
                      slider={slider}
                      isSuperAdmin={isSuperAdmin}
                      currentUserEmail={currentUserEmail}
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
