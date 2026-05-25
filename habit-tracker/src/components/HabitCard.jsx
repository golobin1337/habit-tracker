import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Flame, Pencil, GripVertical } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ProgressRing } from './ProgressRing'

export function HabitCard({ habit, completed, progress, freqLabel, streak, onToggle, onDelete, onEdit, weekData }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id })

  const ringProgress = progress ?? (completed ? 1 : 0)

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 50 : undefined,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass glass-hover rounded-2xl p-4 group transition-all duration-200"
        style={{
          borderColor: completed ? `${habit.color}35` : undefined,
          boxShadow: completed ? `0 0 20px ${habit.color}12` : undefined,
          cursor: isDragging ? 'grabbing' : undefined,
        }}
      >
        <div className="flex items-center gap-3">
          {/* Drag handle */}
          <div
            {...attributes}
            {...listeners}
            className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 cursor-grab active:cursor-grabbing p-1 -ml-1 rounded-lg"
            style={{ color: 'var(--ct5)', touchAction: 'none' }}
          >
            <GripVertical size={15} />
          </div>

          <motion.button
            whileTap={{ scale: 0.85 }}
            onClick={onToggle}
            className="relative flex-shrink-0"
          >
            <ProgressRing progress={ringProgress} size={52} strokeWidth={3} color={habit.color}>
              <AnimatePresence mode="wait">
                {completed ? (
                  <motion.span key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-xl">
                    {habit.icon}
                  </motion.span>
                ) : (
                  <motion.span key="idle" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="text-xl" style={{ opacity: 0.45 }}>
                    {habit.icon}
                  </motion.span>
                )}
              </AnimatePresence>
            </ProgressRing>
          </motion.button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="font-medium text-sm truncate"
                style={{ color: completed ? habit.color : 'var(--ct1)' }}
              >
                {habit.name}
              </span>
              {freqLabel && (
                <span
                  className="text-xs font-semibold shrink-0 px-1.5 py-0.5 rounded-md"
                  style={{ background: `${habit.color}20`, color: habit.color }}
                >
                  {freqLabel}
                </span>
              )}
              {streak > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-orange-400 font-semibold shrink-0">
                  <Flame size={12} />
                  {streak}
                </span>
              )}
            </div>

            <div className="flex gap-1 mt-2">
              {weekData?.map((day, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  className="w-4 h-4 rounded-sm flex-shrink-0"
                  style={{
                    backgroundColor: !day.scheduled ? 'transparent'
                      : day.done ? habit.color
                      : day.future ? 'var(--cfill3)'
                      : 'var(--cfill2)',
                    boxShadow: day.done ? `0 0 6px ${habit.color}60` : undefined,
                    border: !day.scheduled ? '1px dashed var(--cfill2)' : 'none',
                  }}
                  title={day.label}
                />
              ))}
            </div>
          </div>

          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
            <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors">
              <Pencil size={14} />
            </button>
            <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
