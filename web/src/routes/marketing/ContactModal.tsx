import { isAxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { useSubmitLead } from '../../api/leads'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Sheet } from '../../components/ui/Sheet'

interface ContactModalProps {
  open: boolean
  onClose: () => void
}

export function ContactModal({ open, onClose }: ContactModalProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  const submitLead = useSubmitLead()

  useEffect(() => {
    if (open) {
      setName('')
      setEmail('')
      setCompany('')
      setMessage('')
      setError(null)
      setSent(false)
    }
  }, [open])

  const handleSubmit = () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Name, email, and a short message are required.')
      return
    }

    submitLead
      .mutateAsync({ name, email, company: company.trim() || undefined, message })
      .then(() => setSent(true))
      .catch((err: unknown) => {
        const responseMessage = isAxiosError(err)
          ? (err.response?.data as { message?: string } | undefined)?.message
          : null
        setError(responseMessage ?? 'Could not send your message. Please try again.')
      })
  }

  return (
    <Sheet open={open} onClose={onClose} side="center" title={sent ? undefined : 'Tell us about your business'}>
      {sent ? (
        <div className="py-2 text-center">
          <p className="font-semibold text-text">Thanks — we'll be in touch shortly.</p>
          <p className="mt-1.5 text-sm text-text-muted">
            Our team will reach out to scope your custom build.
          </p>
          <Button className="mt-6 w-full" onClick={onClose}>
            Done
          </Button>
        </div>
      ) : (
        <>
          <p className="mb-4 text-sm text-text-muted">
            Tell us a bit about what you need and we'll reach out to scope a custom build.
          </p>

          <Input label="Name" id="lead-name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input
            label="Email"
            id="lead-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Company (optional)"
            id="lead-company"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />

          <div className="mb-4">
            <label className="mb-1 block text-sm font-medium" htmlFor="lead-message">
              What are you looking to build?
            </label>
            <textarea
              id="lead-message"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full resize-none rounded-[var(--radius)] border border-border bg-transparent px-3 py-2.5 text-sm outline-none transition-colors focus:border-brand"
            />
          </div>

          {error && <p className="mb-4 text-sm text-danger">{error}</p>}

          <Button className="w-full" loading={submitLead.isPending} onClick={handleSubmit}>
            Send message
          </Button>
        </>
      )}
    </Sheet>
  )
}
