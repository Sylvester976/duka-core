import { useEffect, useState } from 'react'
import { useTenantSettings, useUpdateTenantSettings } from '../../api/dashboard'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { contrastFor } from '../../lib/theme'

export function Settings() {
  const { data: settings, isPending } = useTenantSettings()
  const updateSettings = useUpdateTenantSettings()

  const [name, setName] = useState('')
  const [brandPrimary, setBrandPrimary] = useState('#2A2722')
  const [mpesaB2cMsisdn, setMpesaB2cMsisdn] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settings) {
      setName(settings.name)
      setBrandPrimary(settings.brand_primary)
      setMpesaB2cMsisdn(settings.mpesa_b2c_msisdn ?? '')
    }
  }, [settings])

  if (isPending || !settings) {
    return <p className="text-text-muted">Loading…</p>
  }

  const handleSave = () => {
    setSaved(false)
    updateSettings.mutate(
      { name, brand_primary: brandPrimary, mpesa_b2c_msisdn: mpesaB2cMsisdn || null },
      { onSuccess: () => setSaved(true) },
    )
  }

  return (
    <div className="max-w-lg">
      <h1 className="mb-6 font-serif text-2xl">Settings</h1>

      <Card>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-text-muted">Business profile</h2>

        <Input label="Business name" id="business-name" value={name} onChange={(e) => setName(e.target.value)} />

        <label className="mb-1 block text-sm font-medium" htmlFor="brand-color">
          Brand color
        </label>
        <div className="mb-4 flex items-center gap-3">
          <input
            id="brand-color"
            type="color"
            value={brandPrimary}
            onChange={(e) => setBrandPrimary(e.target.value)}
            className="h-10 w-14 rounded-[var(--radius)] border border-border bg-transparent"
          />
          <span
            className="rounded-[var(--radius)] px-3 py-2 text-sm font-medium"
            style={{ backgroundColor: brandPrimary, color: contrastFor(brandPrimary) }}
          >
            Preview
          </span>
        </div>

        <Input
          label="M-Pesa payout number"
          id="b2c-msisdn"
          value={mpesaB2cMsisdn}
          onChange={(e) => setMpesaB2cMsisdn(e.target.value)}
          placeholder="2547XXXXXXXX"
        />

        {saved && <p className="mb-3 text-sm text-success">Saved.</p>}

        <Button type="button" loading={updateSettings.isPending} onClick={handleSave}>
          Save changes
        </Button>
      </Card>
    </div>
  )
}
