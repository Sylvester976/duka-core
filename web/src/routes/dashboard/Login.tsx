import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import { useAuth } from '../../lib/auth'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {
      setError('Incorrect email or password.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-4 text-text">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-[var(--radius)] border border-border bg-surface p-6"
      >
        <h1 className="mb-1 text-lg font-semibold">Sign in</h1>
        <p className="mb-6 text-sm text-text-muted">duka-core business dashboard</p>

        <label className="mb-1 block text-sm font-medium" htmlFor="email">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mb-4 w-full rounded-[var(--radius)] border border-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-brand"
        />

        <label className="mb-1 block text-sm font-medium" htmlFor="password">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mb-4 w-full rounded-[var(--radius)] border border-border bg-transparent px-3 py-2.5 text-sm outline-none focus:border-brand"
        />

        {error && <p className="mb-4 text-sm text-danger">{error}</p>}

        <Button type="submit" className="w-full" loading={isSubmitting}>
          Sign in
        </Button>
      </form>
    </div>
  )
}
