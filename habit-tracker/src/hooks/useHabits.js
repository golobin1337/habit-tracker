import { useState, useCallback, useMemo, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { today, toKey } from '../utils/dateUtils'

const COLORS = [
  { name: 'Violeta', value: '#8b5cf6' },
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Ciano', value: '#06b6d4' },
  { name: 'Verde', value: '#22c55e' },
  { name: 'Amarelo', value: '#eab308' },
  { name: 'Laranja', value: '#f97316' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Vermelho', value: '#ef4444' },
]

export const PRESET_COLORS = COLORS

const ICONS = [
  // Saúde & corpo
  '🧘', '🏃', '💪', '🚴', '🏋️', '🧗', '🤸', '🏊',
  // Mente & estudo
  '📚', '🧠', '✍️', '🎯', '📝', '💡', '🔬', '🎓',
  // Alimentação & sono
  '🍎', '💧', '😴', '🥗', '☕', '🍵', '🥦', '🫁',
  // Dinheiro & trabalho
  '💰', '💵', '💳', '📈', '💼', '🏦', '🪙', '📊',
  // Tecnologia & computador
  '💻', '🖥️', '⌨️', '🖱️', '📱', '🖨️', '💾', '🔌',
  // Mensagens & comunicação
  '💬', '📩', '📧', '📞', '☎️', '📡', '🗣️', '📣',
  // Criatividade & lazer
  '🎨', '🎵', '🎮', '📷', '🎭', '🎸', '🎬', '🖌️',
  // Lifestyle
  '🌱', '🌿', '🙏', '❤️', '⭐', '🔥', '🌅', '🫂',
]
export const PRESET_ICONS = ICONS

export function useHabits(userId) {
  const [habits, setHabits] = useState([])
  // Set de "habitId:YYYY-MM-DD" para lookup O(1)
  const [completedSet, setCompletedSet] = useState(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) { setLoading(false); return }

    async function load() {
      setLoading(true)
      const [{ data: habitsData }, { data: logsData }] = await Promise.all([
        supabase.from('habits').select('*').order('position', { ascending: true }).order('created_at', { ascending: true }),
        supabase.from('habit_logs').select('habit_id, date'),
      ])
      setHabits(habitsData ?? [])
      setCompletedSet(new Set((logsData ?? []).map((l) => `${l.habit_id}:${l.date}`)))
      setLoading(false)
    }

    load()
  }, [userId])

  const addHabit = useCallback(async (habit) => {
    const { data, error } = await supabase
      .from('habits')
      .insert({ user_id: userId, name: habit.name, icon: habit.icon || '🎯', color: habit.color || '#8b5cf6', start_date: today(), position: habits.length })
      .select()
      .single()
    if (!error && data) setHabits((prev) => [...prev, data])
  }, [userId, habits.length])

  const reorderHabits = useCallback(async (newOrder) => {
    setHabits(newOrder)
    await Promise.all(
      newOrder.map((habit, i) =>
        supabase.from('habits').update({ position: i }).eq('id', habit.id)
      )
    )
  }, [])

  const editHabit = useCallback(async (id, updates) => {
    const { error } = await supabase.from('habits').update(updates).eq('id', id)
    if (!error) setHabits((prev) => prev.map((h) => h.id === id ? { ...h, ...updates } : h))
  }, [])

  const deleteHabit = useCallback(async (id) => {
    const { error } = await supabase.from('habits').delete().eq('id', id)
    if (!error) setHabits((prev) => prev.filter((h) => h.id !== id))
  }, [])

  const toggleHabit = useCallback(async (habitId, date) => {
    const key = toKey(date)
    const setKey = `${habitId}:${key}`
    const wasCompleted = completedSet.has(setKey)

    // Optimistic update
    setCompletedSet((prev) => {
      const next = new Set(prev)
      wasCompleted ? next.delete(setKey) : next.add(setKey)
      return next
    })

    if (wasCompleted) {
      await supabase.from('habit_logs').delete().eq('habit_id', habitId).eq('date', key)
    } else {
      await supabase.from('habit_logs').insert({ habit_id: habitId, user_id: userId, date: key })
    }
  }, [completedSet, userId])

  const isCompleted = useCallback((habitId, date) =>
    completedSet.has(`${habitId}:${toKey(date)}`),
  [completedSet])

  const getDayCompletion = useCallback((date) => {
    const key = toKey(date)
    const relevant = habits.filter((h) => (h.start_date ?? h.created_at ?? '') <= key)
    if (relevant.length === 0) return 0
    const done = relevant.filter((h) => completedSet.has(`${h.id}:${key}`)).length
    return done / relevant.length
  }, [habits, completedSet])

  const getStreak = useCallback((habitId) => {
    let streak = 0
    const d = new Date()
    while (true) {
      const key = toKey(d)
      if (!completedSet.has(`${habitId}:${key}`)) {
        if (key === today() && streak === 0) { d.setDate(d.getDate() - 1); continue }
        break
      }
      streak++
      d.setDate(d.getDate() - 1)
    }
    return streak
  }, [completedSet])

  const getTotalStreak = useCallback(() => {
    let streak = 0
    const d = new Date()
    while (true) {
      const key = toKey(d)
      const completion = getDayCompletion(new Date(key))
      if (completion < 1 && habits.length > 0) {
        if (key === today() && streak === 0) { d.setDate(d.getDate() - 1); continue }
        break
      }
      if (habits.length === 0) break
      streak++
      d.setDate(d.getDate() - 1)
    }
    return streak
  }, [getDayCompletion, habits])

  const getWeekStats = useCallback((weekDays) =>
    weekDays.map((date) => ({ date, completion: getDayCompletion(date) })),
  [getDayCompletion])

  const getMonthStats = useCallback((year, month) => {
    const stats = {}
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      stats[toKey(date)] = getDayCompletion(date)
    }
    return stats
  }, [getDayCompletion])

  const completionToday = useMemo(() => getDayCompletion(new Date()), [getDayCompletion])

  return {
    habits, loading,
    addHabit, editHabit, deleteHabit, toggleHabit, reorderHabits,
    isCompleted, getDayCompletion, getStreak, getTotalStreak,
    getWeekStats, getMonthStats, completionToday,
  }
}
