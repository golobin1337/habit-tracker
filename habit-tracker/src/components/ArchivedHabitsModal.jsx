import { motion, AnimatePresence } from 'framer-motion'
import { X, ArchiveRestore } from 'lucide-react'

const FREQ_LABEL = (habit) => {
  const ft = habit.frequency_type ?? 'daily'
  const fc = habit.frequency_count ?? 1
  const fd = habit.frequency_days ?? []
  const DAY = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  if (ft === 'daily') return 'Todo dia'
  if (ft === 'specific') {
    return fd.length === 0
      ? 'Dias fixos'
      : fd.slice().sort((a, b) => (a === 0 ? 7 : a) - (b === 0 ? 7 : b)).map((d) => DAY[d]).join(' · ')
  }
  return `${fc}× por ${ft === 'weekly' ? 'semana' : 'mês'}`
}

export function ArchivedHabitsModal({ habits, onUnarchive, onClose }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end justify-center p-4 pb-6"
        style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 60, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 60, opacity: 0, scale: 0.97 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="w-full max-w-lg glass rounded-3xl p-5 max-h-[80vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider mb-0.5" style={{ color: 'var(--ct4)' }}>
                Pausados
              </p>
              <h2 className="text-lg font-bold" style={{ color: 'var(--ct1)' }}>
                Hábitos arquivados
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 transition-colors"
              style={{ color: 'var(--ct4)' }}
            >
              <X size={16} />
            </button>
          </div>

          {habits.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-2">📭</div>
              <p className="text-sm" style={{ color: 'var(--ct4)' }}>
                Nenhum hábito arquivado
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {habits.map((habit) => (
                <motion.div
                  key={habit.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-3 rounded-2xl p-3"
                  style={{ background: 'var(--cfill2)' }}
                >
                  {/* Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                    style={{ background: `${habit.color}18`, border: `1px solid ${habit.color}25` }}
                  >
                    {habit.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: 'var(--ct2)' }}>
                      {habit.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--ct5)' }}>
                      {FREQ_LABEL(habit)}
                    </p>
                  </div>

                  {/* Unarchive button */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onUnarchive(habit.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex-shrink-0"
                    style={{ background: `${habit.color}20`, color: habit.color }}
                  >
                    <ArchiveRestore size={13} />
                    Retomar
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}

          <p className="text-xs mt-4 text-center" style={{ color: 'var(--ct5)' }}>
            Todo o histórico é preservado ao arquivar e ao retomar
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
