import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { PRESET_COLORS, PRESET_ICONS } from '../hooks/useHabits'

const FREQ_TYPES = [
  { id: 'daily', label: 'Diário' },
  { id: 'weekly', label: 'Semanal' },
  { id: 'monthly', label: 'Mensal' },
]

export function AddHabitModal({ open, onClose, onAdd, onEdit, editingHabit }) {
  const isEditing = !!editingHabit

  const [name, setName] = useState('')
  const [icon, setIcon] = useState('🎯')
  const [color, setColor] = useState('#8b5cf6')
  const [freqType, setFreqType] = useState('daily')
  const [freqCount, setFreqCount] = useState(3)

  useEffect(() => {
    if (open) {
      setName(editingHabit?.name ?? '')
      setIcon(editingHabit?.icon ?? '🎯')
      setColor(editingHabit?.color ?? '#8b5cf6')
      setFreqType(editingHabit?.frequency_type ?? 'daily')
      setFreqCount(editingHabit?.frequency_count ?? 3)
    }
  }, [open, editingHabit])

  const freqMax = freqType === 'weekly' ? 7 : 31

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    const freq = { frequency_type: freqType, frequency_count: freqType === 'daily' ? 1 : freqCount }
    if (isEditing) {
      onEdit(editingHabit.id, { name: name.trim(), icon, color, ...freq })
    } else {
      onAdd({ name: name.trim(), icon, color, ...freq })
    }
    onClose()
  }

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
              <h2 className="text-lg font-semibold" style={{ color: 'var(--ct1)' }}>
                {isEditing ? 'Editar Hábito' : 'Novo Hábito'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  className="block text-xs mb-2 font-medium uppercase tracking-wider"
                  style={{ color: 'var(--ct3)' }}
                >
                  Nome
                </label>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Meditar 10 minutos"
                  className="habit-input"
                />
              </div>

              <div>
                <label
                  className="block text-xs mb-2 font-medium uppercase tracking-wider"
                  style={{ color: 'var(--ct3)' }}
                >
                  Ícone
                </label>
                <div className="grid grid-cols-8 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {PRESET_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      className={`text-2xl py-2 rounded-xl transition-all ${
                        icon === ic ? 'bg-white/15 scale-110' : 'hover:bg-white/8'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  className="block text-xs mb-2 font-medium uppercase tracking-wider"
                  style={{ color: 'var(--ct3)' }}
                >
                  Cor
                </label>
                <div className="flex gap-2 flex-wrap">
                  {PRESET_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className="w-8 h-8 rounded-full transition-transform hover:scale-110 flex items-center justify-center"
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    >
                      {color === c.value && (
                        <motion.div
                          layoutId="color-check"
                          className="w-3 h-3 rounded-full bg-white/80"
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Frequência */}
              <div>
                <label className="block text-xs mb-2 font-medium uppercase tracking-wider" style={{ color: 'var(--ct3)' }}>
                  Frequência
                </label>
                <div className="flex gap-1.5 mb-3">
                  {FREQ_TYPES.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setFreqType(f.id)}
                      className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
                      style={{
                        background: freqType === f.id ? `${color}30` : 'var(--cfill2)',
                        border: `1px solid ${freqType === f.id ? `${color}60` : 'transparent'}`,
                        color: freqType === f.id ? color : 'var(--ct4)',
                      }}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {freqType !== 'daily' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center justify-center gap-4"
                  >
                    <button
                      type="button"
                      onClick={() => setFreqCount((n) => Math.max(1, n - 1))}
                      className="w-9 h-9 rounded-xl text-lg font-bold transition-colors"
                      style={{ background: 'var(--cfill2)', color: 'var(--ct2)' }}
                    >
                      −
                    </button>
                    <div className="text-center">
                      <span className="text-2xl font-bold" style={{ color }}>{freqCount}</span>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--ct4)' }}>
                        {freqCount === 1 ? 'vez' : 'vezes'} por {freqType === 'weekly' ? 'semana' : 'mês'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFreqCount((n) => Math.min(freqMax, n + 1))}
                      className="w-9 h-9 rounded-xl text-lg font-bold transition-colors"
                      style={{ background: 'var(--cfill2)', color: 'var(--ct2)' }}
                    >
                      +
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Preview */}
              <div
                className="flex items-center gap-3 rounded-xl p-3"
                style={{ background: 'var(--cfill2)' }}
              >
                <div
                  className="text-3xl w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${color}20`, border: `1px solid ${color}40` }}
                >
                  {icon}
                </div>
                <div>
                  <p className="font-medium" style={{ color: 'var(--ct1)' }}>
                    {name || 'Pré-visualização'}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--ct4)' }}>
                    {freqType === 'daily' ? 'Todo dia' : `${freqCount}× por ${freqType === 'weekly' ? 'semana' : 'mês'}`}
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={!name.trim()}
                className="w-full py-3 rounded-xl font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(135deg, ${color}, ${color}99)`,
                  boxShadow: name.trim() ? `0 4px 20px ${color}40` : undefined,
                }}
              >
                {isEditing ? 'Salvar Alterações' : 'Adicionar Hábito'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
