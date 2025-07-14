"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Save, X, Barcode } from "lucide-react"
import type { ScannedItem } from "@/app/page"

interface ItemFormProps {
  barcode: string
  onItemSaved: (item: ScannedItem) => void
  onCancel: () => void
}

export function ItemForm({ barcode, onItemSaved, onCancel }: ItemFormProps) {
  const [name, setName] = useState("")
  const [price, setPrice] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !price.trim()) {
      return
    }

    setIsLoading(true)

    const item: ScannedItem = {
      id: Date.now().toString(),
      fullBarcode: barcode,
      lastSixDigits: barcode.slice(-6),
      name: name.trim(),
      price: Number.parseFloat(price),
      scannedAt: new Date().toISOString(),
    }

    // Simular um pequeno delay para melhor UX
    await new Promise((resolve) => setTimeout(resolve, 500))

    onItemSaved(item)
    setIsLoading(false)
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-50 border-slate-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Barcode className="w-5 h-5 text-slate-600" />
            <div>
              <p className="text-sm text-slate-600">Código escaneado:</p>
              <p className="font-mono text-lg font-semibold">{barcode}</p>
              <p className="text-sm text-slate-500">
                Últimos 6 dígitos: <span className="font-semibold">{barcode.slice(-6)}</span>
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Artigo</Label>
          <Input
            id="name"
            type="text"
            placeholder="Digite o nome do produto"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="text-base py-3 px-4"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Preço (R$)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            placeholder="0.00"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="text-base py-3 px-4"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            type="submit"
            disabled={!name.trim() || !price.trim() || isLoading}
            className="flex-1 flex items-center justify-center gap-2 py-3 text-base"
          >
            <Save className="w-4 h-4" />
            {isLoading ? "Salvando..." : "Salvar Item"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 py-3 text-base sm:w-auto"
          >
            <X className="w-4 h-4" />
            Cancelar
          </Button>
        </div>
      </form>
    </div>
  )
}
