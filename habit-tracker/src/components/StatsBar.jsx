import { motion } from 'framer-motion'
import { Flame, TrendingUp } from 'lucide-react'
import { ProgressRing } from './ProgressRing'

export function StatsBar({ completionToday, totalStreak, totalHabits, completedToday }) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-4 flex items-center gap-3"
      >
        <ProgressRing
          progress={completionToday}
          size={48}
          strokeWidth={4}
          color={completionToday === 1 ? '#22c55e' : '#8b5cf6'}
        >
          <span className="text-xs font-bold" style={{ color: 'var(--ct1)' }}>
            {Math.round(completionToday * 100)}%
          </span>
        </ProgressRing>
        <div>
          <p className="text-xs" style={{ color: 'var(--ct4)' }}>Hoje</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--ct1)' }}>
            {completedToday}/{totalHabits}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="glass rounded-2xl p-4 flex items-center gap-3"
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{
            background: totalStreak > 0
              ? 'radial-gradient(circle, rgba(249,115,22,0.3), rgba(249,115,22,0.1))'
              : 'var(--cfill2)',
          }}
        >
          <Flame
            size={22}
            style={{ color: totalStreak > 0 ? '#fb923c' : 'var(--ct5)' }}
          />
        </div>
        <div>
          <p className="text-xs" style={{ color: 'var(--ct4)' }}>Sequência</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--ct1)' }}>
            {totalStreak} {totalStreak === 1 ? 'dia' : 'dias'}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-4 flex items-center gap-3"
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-500/10">
          <TrendingUp size={22} className="text-emerald-400" />
        </div>
        <div>
          <p className="text-xs" style={{ color: 'var(--ct4)' }}>Hábitos</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--ct1)' }}>
            {totalHabits} ativos
          </p>
        </div>
      </motion.div>
    </div>
  )
}
