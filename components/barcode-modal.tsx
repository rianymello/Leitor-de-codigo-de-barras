"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import type { ScannedItem } from "@/app/page"
import { Package, Globe, DollarSign, Weight, Calendar, Tag, Layers } from "lucide-react"

interface BarcodeModalProps {
  isOpen: boolean
  barcode: string
  onClose: () => void
  onSave: (item: ScannedItem) => void
}

const categories = [
  "Brinquedos Educativos",
  "Bonecas e Acessórios",
  "Carrinhos e Veículos",
  "Jogos de Tabuleiro",
  "Pelúcias",
  "Blocos de Construção",
  "Brinquedos Eletrônicos",
  "Arte e Artesanato",
  "Esportes e Atividades",
  "Fantasias e Disfarces",
]

const ageRanges = ["0-2 anos", "3-5 anos", "6-8 anos", "9-12 anos", "13+ anos", "Todas as idades"]

const productTypes = [
  "Brinquedo",
  "Jogo",
  "Boneca",
  "Carrinho",
  "Pelúcia",
  "Quebra-cabeça",
  "Kit Educativo",
  "Acessório",
  "Eletrônico",
  "Esportivo",
]

const units = [
  { value: "UN", label: "Unidade" },
  { value: "CX", label: "Caixa" },
]

export function BarcodeModal({ isOpen, barcode, onClose, onSave }: BarcodeModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    siteDescription: "",
    brand: "",
    price: "",
    weight: "",
    unit: "UN",
    ageRange: "",
    category: "",
    toyType: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (isOpen && barcode) {
      // Reset form when modal opens
      setFormData({
        name: "",
        siteDescription: "",
        brand: "",
        price: "",
        weight: "",
        unit: "UN",
        ageRange: "",
        category: "",
        toyType: "",
      })
      setErrors({})
    }
  }, [isOpen, barcode])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Nome do produto é obrigatório"
    }

    if (!formData.siteDescription.trim()) {
      newErrors.siteDescription = "Descrição para o site é obrigatória"
    }

    if (!formData.brand.trim()) {
      newErrors.brand = "Marca é obrigatória"
    }

    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = "Preço deve ser um número válido maior que zero"
    }

    if (!formData.weight || isNaN(Number(formData.weight)) || Number(formData.weight) <= 0) {
      newErrors.weight = "Peso deve ser um número válido maior que zero"
    }

    if (!formData.ageRange) {
      newErrors.ageRange = "Faixa etária é obrigatória"
    }

    if (!formData.category) {
      newErrors.category = "Categoria é obrigatória"
    }

    if (!formData.toyType) {
      newErrors.toyType = "Tipo de produto é obrigatório"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validateForm()) {
      return
    }

    try {
      const lastSixDigits = barcode.slice(-6)

      const newItem: ScannedItem = {
        id: Date.now().toString(),
        fullBarcode: barcode,
        lastSixDigits,
        name: formData.name.trim(),
        siteDescription: formData.siteDescription.trim(),
        brand: formData.brand.trim(),
        price: Number(formData.price),
        weight: Number(formData.weight),
        unit: formData.unit,
        ageRange: formData.ageRange,
        category: formData.category,
        toyType: formData.toyType,
        scannedAt: new Date().toISOString(),
      }

      onSave(newItem)
    } catch (error) {
      console.error("Erro ao salvar produto:", error)
      alert("Erro ao salvar o produto. Verifique os dados e tente novamente.")
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="w-5 h-5 text-blue-600" />
            Cadastrar Produto
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Código de Barras */}
          <Card className="bg-slate-50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-600">Código de Barras Escaneado</p>
                  <p className="font-mono text-lg font-semibold">{barcode}</p>
                </div>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  Ref: {barcode.slice(-6)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome do Produto */}
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Nome do Produto *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Ex: Boneca Barbie Princesa"
                className={errors.name ? "border-red-500" : ""}
              />
              <p className="text-xs text-slate-500">Nome interno do produto para identificação</p>
              {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
            </div>

            {/* Descrição para Site */}
            <div className="space-y-2">
              <Label htmlFor="siteDescription" className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-600" />
                Descrição para Site *
              </Label>
              <Input
                id="siteDescription"
                value={formData.siteDescription}
                onChange={(e) => handleInputChange("siteDescription", e.target.value)}
                placeholder="Ex: Boneca Barbie Princesa dos Sonhos"
                className={errors.siteDescription ? "border-red-500" : ""}
              />
              <p className="text-xs text-blue-600">Nome que aparecerá no site para os clientes</p>
              {errors.siteDescription && <p className="text-xs text-red-500">{errors.siteDescription}</p>}
            </div>

            {/* Marca */}
            <div className="space-y-2">
              <Label htmlFor="brand">Marca *</Label>
              <Input
                id="brand"
                value={formData.brand}
                onChange={(e) => handleInputChange("brand", e.target.value)}
                placeholder="Ex: Mattel"
                className={errors.brand ? "border-red-500" : ""}
              />
              {errors.brand && <p className="text-xs text-red-500">{errors.brand}</p>}
            </div>

            {/* Preço */}
            <div className="space-y-2">
              <Label htmlFor="price" className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Preço (€) *
              </Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => handleInputChange("price", e.target.value)}
                placeholder="Ex: 29.99"
                className={errors.price ? "border-red-500" : ""}
              />
              {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
            </div>

            {/* Peso */}
            <div className="space-y-2">
              <Label htmlFor="weight" className="flex items-center gap-2">
                <Weight className="w-4 h-4" />
                Peso (kg) *
              </Label>
              <Input
                id="weight"
                type="number"
                step="0.01"
                min="0"
                value={formData.weight}
                onChange={(e) => handleInputChange("weight", e.target.value)}
                placeholder="Ex: 0.5"
                className={errors.weight ? "border-red-500" : ""}
              />
              {errors.weight && <p className="text-xs text-red-500">{errors.weight}</p>}
            </div>

            {/* Unidade */}
            <div className="space-y-2">
              <Label htmlFor="unit">Unidade *</Label>
              <Select value={formData.unit} onValueChange={(value) => handleInputChange("unit", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {units.map((unit) => (
                    <SelectItem key={unit.value} value={unit.value}>
                      {unit.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Faixa Etária */}
            <div className="space-y-2">
              <Label htmlFor="ageRange" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Faixa Etária *
              </Label>
              <Select value={formData.ageRange} onValueChange={(value) => handleInputChange("ageRange", value)}>
                <SelectTrigger className={errors.ageRange ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecione a faixa etária" />
                </SelectTrigger>
                <SelectContent>
                  {ageRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.ageRange && <p className="text-xs text-red-500">{errors.ageRange}</p>}
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <Label htmlFor="category" className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                Categoria *
              </Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange("category", value)}>
                <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-xs text-red-500">{errors.category}</p>}
            </div>

            {/* Tipo de Produto */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="toyType">Tipo de Produto *</Label>
              <Select value={formData.toyType} onValueChange={(value) => handleInputChange("toyType", value)}>
                <SelectTrigger className={errors.toyType ? "border-red-500" : ""}>
                  <SelectValue placeholder="Selecione o tipo de produto" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.toyType && <p className="text-xs text-red-500">{errors.toyType}</p>}
            </div>
          </div>

          <Separator />

          {/* Botões */}
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
              Salvar Produto
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
