import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertTriangle, Bell } from 'lucide-react'
import { today } from '../utils/dateUtils'

export function AddReminderModal({ open, onClose, onAdd, onEdit, editingReminder }) {
  const isEditing = !!editingReminder

  const [title, setTitle] = useState('')
  const [date, setDate] = useState(today())
  const [time, setTime] = useState('')
  const [urgent, setUrgent] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle(editingReminder?.title ?? '')
      setDate(editingReminder?.date ?? today())
      setTime(editingReminder?.time ?? '')
      setUrgent(editingReminder?.urgent ?? false)
    }
  }, [open, editingReminder])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    if (isEditing) {
      onEdit(editingReminder.id, { title: title.trim(), date, time, urgent })
    } else {
      onAdd({ title: title.trim(), date, time, urgent })
    }
    onClose()
  }

  const accentColor = urgent ? '#ef4444' : '#f59e0b'

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            className="relative w-full max-w-md glass rounded-3xl p-6 z-10"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${accentColor}20` }}
                >
                  {urgent
                    ? <AlertTriangle size={16} style={{ color: accentColor }} />
                    : <Bell size={16} style={{ color: accentColor }} />
                  }
                </div>
                <h2 className="text-lg font-semibold" style={{ color: 'var(--ct1)' }}>
                  {isEditing ? 'Editar Lembrete' : 'Novo Lembrete'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Urgência toggle */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setUrgent(false)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: !urgent ? 'rgba(245,158,11,0.15)' : 'var(--cfill2)',
                    border: `1px solid ${!urgent ? 'rgba(245,158,11,0.4)' : 'var(--cglass-b)'}`,
                    color: !urgent ? '#f59e0b' : 'var(--ct4)',
                  }}
                >
                  <Bell size={14} />
                  Lembrete
                </button>
                <button
                  type="button"
                  onClick={() => setUrgent(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all"
                  style={{
                    background: urgent ? 'rgba(239,68,68,0.15)' : 'var(--cfill2)',
                    border: `1px solid ${urgent ? 'rgba(239,68,68,0.4)' : 'var(--cglass-b)'}`,
                    color: urgent ? '#ef4444' : 'var(--ct4)',
                  }}
                >
                  <AlertTriangle size={14} />
                  Urgente
                </button>
              </div>

              {/* Título */}
              <div>
                <label
                  className="block text-xs mb-2 font-medium uppercase tracking-wider"
                  style={{ color: 'var(--ct3)' }}
                >
                  Título
                </label>
                <input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Reunião com equipe, Consulta médica…"
                  className="habit-input"
                />
              </div>

              {/* Data e hora */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    className="block text-xs mb-2 font-medium uppercase tracking-wider"
                    style={{ color: 'var(--ct3)' }}
                  >
                    Data
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="habit-input"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
                <div>
                  <label
                    className="block text-xs mb-2 font-medium uppercase tracking-wider"
                    style={{ color: 'var(--ct3)' }}
                  >
                    Horário <span style={{ color: 'var(--ct5)' }}>(opcional)</span>
                  </label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="habit-input"
                    style={{ colorScheme: 'dark' }}
                  />
                </div>
              </div>

              {/* Preview */}
              <div
                className="flex items-center gap-3 rounded-xl p-3"
                style={{
                  background: `${accentColor}10`,
                  border: `1px solid ${accentColor}25`,
                }}
              >
                <span className="text-xl">{urgent ? '🚨' : '🔔'}</span>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate" style={{ color: 'var(--ct1)' }}>
                    {title || 'Título do lembrete'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--ct4)' }}>
                    {date}{time ? ` às ${time}` : ''}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={!title.trim()}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, ${accentColor}99)`,
                  boxShadow: title.trim() ? `0 4px 20px ${accentColor}40` : undefined,
                }}
              >
                {isEditing ? 'Salvar' : 'Criar Lembrete'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
