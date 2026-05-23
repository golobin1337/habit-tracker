import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

export function AuthScreen({ onSignIn, onSignUp }) {
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return
    setError('')
    setSuccess('')
    setLoading(true)

    const fn = mode === 'login' ? onSignIn : onSignUp
    const { error: err } = await fn(email.trim(), password)

    setLoading(false)

    if (err) {
      const msgs = {
        'Invalid login credentials': 'E-mail ou senha incorretos.',
        'Email not confirmed': 'Confirme seu e-mail antes de entrar.',
        'User already registered': 'Este e-mail já está cadastrado.',
        'Password should be at least 6 characters': 'A senha precisa ter ao menos 6 caracteres.',
      }
      setError(msgs[err.message] ?? err.message)
    } else if (mode === 'signup') {
      setSuccess('Conta criada! Verifique seu e-mail para confirmar.')
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'var(--cbg-grad)' }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌱</div>
          <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--ct1)' }}>
            Habits
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--ct4)' }}>
            Construa hábitos que duram
          </p>
        </div>

        <div className="glass rounded-3xl p-6">
          {/* Mode toggle */}
          <div
            className="flex rounded-xl p-1 mb-6"
            style={{ background: 'var(--cfill2)' }}
          >
            {['login', 'signup'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setSuccess('') }}
                className="flex-1 py-2 rounded-lg text-sm font-medium transition-all relative"
                style={{ color: mode === m ? 'var(--ct1)' : 'var(--ct4)' }}
              >
                {mode === m && (
                  <motion.div
                    layoutId="auth-tab"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.3)' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  />
                )}
                <span className="relative z-10">
                  {m === 'login' ? 'Entrar' : 'Criar conta'}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--ct4)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="habit-input"
                style={{ paddingLeft: '2.5rem' }}
                autoComplete="email"
              />
            </div>

            {/* Senha */}
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--ct4)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'signup' ? 'Mínimo 6 caracteres' : 'Sua senha'}
                className="habit-input"
                style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                style={{ color: 'var(--ct4)' }}
              >
                {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Erro */}
            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-red-400 text-center"
                >
                  {error}
                </motion.p>
              )}
              {success && (
                <motion.p
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="text-sm text-emerald-400 text-center"
                >
                  {success}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              whileTap={{ scale: 0.97 }}
              className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                boxShadow: '0 4px 20px rgba(124,58,237,0.35)',
              }}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {mode === 'login' ? 'Entrar' : 'Criar conta'}
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
