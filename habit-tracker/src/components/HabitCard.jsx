import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trash2, Flame, Pencil, GripVertical, FileText, Archive } from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ProgressRing } from './ProgressRing'

export function HabitCard({ habit, completed, progress, freqLabel, streak, note, doneToday, onToggle, onNoteChange, onDelete, onEdit, onDetail, onArchive, weekData }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: habit.id })

  const [noteOpen, setNoteOpen] = useState(false)
  const [noteText, setNoteText] = useState(note ?? '')

  useEffect(() => { setNoteText(note ?? '') }, [note])

  const handleClose = () => {
    if (noteText !== (note ?? '')) onNoteChange?.(noteText)
    setNoteOpen(false)
  }

  const ringProgress = progress ?? (completed ? 1 : 0)
  const hasNote = !!note
  const showNoteIcon = (doneToday ?? completed) || hasNote

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
              <button
                onClick={(e) => { e.stopPropagation(); onDetail?.() }}
                className="font-medium text-sm truncate text-left hover:underline"
                style={{ color: completed ? habit.color : 'var(--ct1)' }}
              >
                {habit.name}
              </button>
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

              {/* Ícone de nota */}
              <AnimatePresence>
                {showNoteIcon && (
                  <motion.button
                    key="note-icon"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    whileTap={{ scale: 0.85 }}
                    onClick={(e) => { e.stopPropagation(); setNoteOpen((o) => !o) }}
                    className="shrink-0 p-0.5 rounded transition-colors"
                    style={{ color: hasNote ? habit.color : 'var(--ct5)' }}
                    title={hasNote ? 'Ver nota' : 'Adicionar nota'}
                  >
                    <FileText size={12} />
                  </motion.button>
                )}
              </AnimatePresence>
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
            <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors" title="Editar">
              <Pencil size={14} />
            </button>
            <button onClick={onArchive} className="p-1.5 rounded-lg hover:bg-amber-500/10 text-slate-500 hover:text-amber-400 transition-colors" title="Arquivar">
              <Archive size={14} />
            </button>
            <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors" title="Excluir">
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        {/* Nota expandida dentro do card */}
        <AnimatePresence>
          {noteOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                className="mt-2.5 flex items-center gap-2 rounded-xl px-3 py-2"
                style={{ background: 'var(--cfill2)' }}
              >
                <FileText size={11} style={{ color: habit.color, flexShrink: 0 }} />
                <input
                  autoFocus
                  type="text"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onBlur={handleClose}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') e.currentTarget.blur()
                    if (e.key === 'Escape') { setNoteText(note ?? ''); setNoteOpen(false) }
                  }}
                  placeholder="Adicionar nota (opcional)..."
                  className="flex-1 text-xs outline-none bg-transparent"
                  style={{ color: noteText ? 'var(--ct1)' : 'var(--ct4)' }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
