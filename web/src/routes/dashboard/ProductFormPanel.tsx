import { useEffect, useState } from 'react'
import { useCreateProduct, useUpdateProduct, type Product } from '../../api/dashboard'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Sheet } from '../../components/ui/Sheet'

interface ProductFormPanelProps {
  product: Product | null
  open: boolean
  onClose: () => void
}

export function ProductFormPanel({ product, open, onClose }: ProductFormPanelProps) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct()
  const isSaving = createProduct.isPending || updateProduct.isPending

  useEffect(() => {
    if (open) {
      setName(product?.name ?? '')
      setPrice(product?.price ?? '')
      setDescription(product?.description ?? '')
      setError(null)
    }
  }, [open, product])

  const handleSave = () => {
    if (!name.trim() || !price) {
      setError('Name and price are required.')
      return
    }

    const payload = { name, price: Number(price), description: description || null }
    const save = product
      ? updateProduct.mutateAsync({ id: product.id, ...payload })
      : createProduct.mutateAsync(payload)

    save.then(onClose).catch(() => setError('Could not save this product.'))
  }

  return (
    <Sheet open={open} onClose={onClose} title={product ? 'Edit product' : 'Add product'}>
      <Input label="Name" id="product-name" value={name} onChange={(e) => setName(e.target.value)} />

      <Input
        label="Price (KES)"
        id="product-price"
        type="number"
        min="0"
        step="0.01"
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <label className="mb-1 block text-sm font-medium" htmlFor="product-description">
        Description
      </label>
      <textarea
        id="product-description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={3}
        className="mb-4 w-full rounded-[var(--radius)] border border-border bg-transparent px-3 py-2 text-sm outline-none focus:border-brand"
      />

      {error && <p className="mb-4 text-sm text-danger">{error}</p>}

      <div className="mt-auto flex gap-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
          Cancel
        </Button>
        <Button type="button" className="flex-1" loading={isSaving} onClick={handleSave}>
          Save
        </Button>
      </div>
    </Sheet>
  )
}
