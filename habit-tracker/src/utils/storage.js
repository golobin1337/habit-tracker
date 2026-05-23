const HABITS_KEY = 'habit-tracker-habits'
const LOGS_KEY = 'habit-tracker-logs'

export const loadHabits = () => {
  try {
    return JSON.parse(localStorage.getItem(HABITS_KEY) || '[]')
  } catch {
    return []
  }
}

export const saveHabits = (habits) => {
  localStorage.setItem(HABITS_KEY, JSON.stringify(habits))
}

export const loadLogs = () => {
  try {
    return JSON.parse(localStorage.getItem(LOGS_KEY) || '{}')
  } catch {
    return {}
  }
}

export const saveLogs = (logs) => {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs))
}

const REMINDERS_KEY = 'habit-tracker-reminders'

export const loadReminders = () => {
  try {
    return JSON.parse(localStorage.getItem(REMINDERS_KEY) || '[]')
  } catch {
    return []
  }
}

export const saveReminders = (reminders) => {
  localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders))
}
