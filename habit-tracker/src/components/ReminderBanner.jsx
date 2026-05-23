import { motion, AnimatePresence } from 'framer-motion'
import { Check, Trash2, Pencil, Clock, AlertTriangle, Bell, ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'
import { MONTH_NAMES } from '../utils/dateUtils'

function formatReminderDate(dateStr, time) {
  const [y, m, d] = dateStr.split('-').map(Number)
  const label = `${d} de ${MONTH_NAMES[m - 1]}`
  return time ? `${label} às ${time}` : label
}

function ReminderCard({ reminder, onDismiss, onDelete, onEdit }) {
  const urgent = reminder.urgent
  const color = urgent ? '#ef4444' : '#f59e0b'
  const icon = urgent ? '🚨' : '🔔'

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 20, scale: 0.95 }}
      className="relative rounded-2xl p-4 flex items-center gap-3 group overflow-hidden"
      style={{
        background: `${color}10`,
        border: `1px solid ${color}30`,
      }}
    >
      {/* pulse para urgente */}
      {urgent && (
        <motion.div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          animate={{ opacity: [0, 0.06, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ background: color }}
        />
      )}

      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
        style={{ background: `${color}15` }}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate" style={{ color: 'var(--ct1)' }}>
          {reminder.title}
        </p>
        <div className="flex items-center gap-1 mt-0.5">
          <Clock size={11} style={{ color: 'var(--ct4)' }} />
          <span className="text-xs" style={{ color: 'var(--ct4)' }}>
            {formatReminderDate(reminder.date, reminder.time)}
          </span>
        </div>
      </div>

      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={onEdit}
          className="p-1.5 rounded-lg hover:bg-white/10 text-slate-500 hover:text-white transition-colors"
          title="Editar"
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={onDelete}
          className="p-1.5 rounded-lg hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
          title="Excluir"
        >
          <Trash2 size={13} />
        </button>
      </div>

      <motion.button
        whileTap={{ scale: 0.88 }}
        onClick={onDismiss}
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors"
        style={{ background: `${color}20` }}
        title="Concluir"
      >
        <Check size={15} style={{ color }} />
      </motion.button>
    </motion.div>
  )
}

export function ReminderBanner({ todayReminders, overdueReminders, upcomingReminders, onDismiss, onDelete, onEdit }) {
  const [showUpcoming, setShowUpcoming] = useState(false)

  const hasToday = todayReminders.length > 0
  const hasOverdue = overdueReminders.length > 0
  const hasUpcoming = upcomingReminders.length > 0

  if (!hasToday && !hasOverdue && !hasUpcoming) return null

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className="mb-5 space-y-2"
    >
      {/* Atrasados */}
      <AnimatePresence>
        {hasOverdue && overdueReminders.map((r) => (
          <div key={r.id}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
               style={{ color: '#ef4444' }}>
              <AlertTriangle size={11} /> Atrasado
            </p>
            <ReminderCard
              reminder={{ ...r, urgent: true }}
              onDismiss={() => onDismiss(r.id)}
              onDelete={() => onDelete(r.id)}
              onEdit={() => onEdit(r)}
            />
          </div>
        ))}
      </AnimatePresence>

      {/* Hoje */}
      {hasToday && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5"
             style={{ color: 'var(--ct3)' }}>
            <Bell size={11} /> Hoje
          </p>
          <AnimatePresence>
            {todayReminders.map((r) => (
              <ReminderCard
                key={r.id}
                reminder={r}
                onDismiss={() => onDismiss(r.id)}
                onDelete={() => onDelete(r.id)}
                onEdit={() => onEdit(r)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Próximos (colapsável) */}
      {hasUpcoming && (
        <div>
          <button
            onClick={() => setShowUpcoming((s) => !s)}
            className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider transition-colors"
            style={{ color: 'var(--ct4)' }}
          >
            {showUpcoming ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
            Próximos ({upcomingReminders.length})
          </button>

          <AnimatePresence>
            {showUpcoming && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-1.5 space-y-2 overflow-hidden"
              >
                {upcomingReminders.map((r) => (
                  <ReminderCard
                    key={r.id}
                    reminder={r}
                    onDismiss={() => onDismiss(r.id)}
                    onDelete={() => onDelete(r.id)}
                    onEdit={() => onEdit(r)}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}
