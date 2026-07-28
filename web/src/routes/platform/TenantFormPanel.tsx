import { isAxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { useCreateTenant } from '../../api/platform'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Sheet } from '../../components/ui/Sheet'

interface TenantFormPanelProps {
  open: boolean
  onClose: () => void
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function TenantFormPanel({ open, onClose }: TenantFormPanelProps) {
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugTouched, setSlugTouched] = useState(false)
  const [brandPrimary, setBrandPrimary] = useState('#2A2722')
  const [platformFeePercent, setPlatformFeePercent] = useState('2.5')
  const [monthlyFee, setMonthlyFee] = useState('0')
  const [ownerName, setOwnerName] = useState('')
  const [ownerEmail, setOwnerEmail] = useState('')
  const [ownerPassword, setOwnerPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createTenant = useCreateTenant()

  useEffect(() => {
    if (open) {
      setName('')
      setSlug('')
      setSlugTouched(false)
      setBrandPrimary('#2A2722')
      setPlatformFeePercent('2.5')
      setMonthlyFee('0')
      setOwnerName('')
      setOwnerEmail('')
      setOwnerPassword('')
      setError(null)
    }
  }, [open])

  const handleSave = () => {
    if (!name.trim() || !slug.trim() || !ownerName.trim() || !ownerEmail.trim() || ownerPassword.length < 8) {
      setError('Business name, slug, owner name, owner email, and an 8+ character password are required.')
      return
    }

    createTenant
      .mutateAsync({
        name,
        slug,
        brand_primary: brandPrimary,
        platform_fee_percent: Number(platformFeePercent),
        monthly_fee: Number(monthlyFee),
        owner_name: ownerName,
        owner_email: ownerEmail,
        owner_password: ownerPassword,
      })
      .then(onClose)
      .catch((err: unknown) => {
        const message = isAxiosError(err) ? (err.response?.data as { message?: string } | undefined)?.message : null
        setError(message ?? 'Could not create this tenant.')
      })
  }

  return (
    <Sheet open={open} onClose={onClose} title="New tenant">
      <Input
        label="Business name"
        id="tenant-name"
        value={name}
        onChange={(e) => {
          setName(e.target.value)
          if (!slugTouched) setSlug(slugify(e.target.value))
        }}
      />

      <Input
        label="Slug"
        id="tenant-slug"
        value={slug}
        onChange={(e) => {
          setSlugTouched(true)
          setSlug(slugify(e.target.value))
        }}
      />

      <label className="mb-1 block text-sm font-medium" htmlFor="tenant-brand-color">
        Brand color
      </label>
      <input
        id="tenant-brand-color"
        type="color"
        value={brandPrimary}
        onChange={(e) => setBrandPrimary(e.target.value)}
        className="mb-4 h-10 w-14 rounded-[var(--radius)] border border-border bg-transparent"
      />

      <div className="mb-4 grid grid-cols-2 gap-3">
        <Input
          label="Platform fee %"
          id="tenant-fee"
          type="number"
          min="0"
          max="100"
          step="0.1"
          value={platformFeePercent}
          onChange={(e) => setPlatformFeePercent(e.target.value)}
          containerClassName="mb-0"
        />
        <Input
          label="Monthly fee (KES)"
          id="tenant-monthly-fee"
          type="number"
          min="0"
          step="1"
          value={monthlyFee}
          onChange={(e) => setMonthlyFee(e.target.value)}
          containerClassName="mb-0"
        />
      </div>

      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-text-muted">Owner account</h3>

      <Input label="Owner name" id="tenant-owner-name" value={ownerName} onChange={(e) => setOwnerName(e.target.value)} />

      <Input
        label="Owner email"
        id="tenant-owner-email"
        type="email"
        value={ownerEmail}
        onChange={(e) => setOwnerEmail(e.target.value)}
      />

      <Input
        label="Owner password"
        id="tenant-owner-password"
        type="password"
        value={ownerPassword}
        onChange={(e) => setOwnerPassword(e.target.value)}
      />

      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      <div className="mt-auto flex gap-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" className="flex-1" loading={createTenant.isPending} onClick={handleSave}>
          Create tenant
        </Button>
      </div>
    </Sheet>
  )
}
