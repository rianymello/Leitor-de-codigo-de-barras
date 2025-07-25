"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Save, X, Barcode, Package, Euro, Tag, Users, Grid3X3, Gamepad2, AlertCircle, Weight, Box } from "lucide-react"
import type { ScannedItem } from "@/app/page"

interface BarcodeModalProps {
  isOpen: boolean
  barcode: string
  onClose: () => void
  onSave: (item: ScannedItem) => void
}

const AGE_RANGES = ["0+ meses", "3+ meses", "6+ meses", "10+ meses", "1+", "2+", "3+", "4+", "5+", "6+", "7+", "8+"]

const CATEGORIES = [
  "Brinquedos em madeira",
  "Brinquedos para bebés",
  "Brinquedos para crianças",
  "Ciência e descobrimentos",
  "Figuras de ação",
  "Instrumentos musicais",
  "Jogos e puzzles",
  "Jogos educativos",
  "Matraquilhos e bilhares",
  "Peluches",
  "Personagens TV",
  "Pistas e circuitos",
  "Plasticinas",
  "Radio control",
  "Veículos e carrinhos",
  "Pistolas e dardos",
  "Primeiros-passos e cavalgáveis",
  "Bonecas",
  "Blocos de construção",
  "Brinquedos de imitação",
  "Menina (disfarce)",
  "Menino (disfarce)",
  "Biquínis",
  "Calções de banho",
  "Piscinas",
  "Toalhas",
  "Estojos",
  "Mochilas",
]

const PRODUCT_TYPES = ["Brinquedo", "Disfarces", "Verão", "Material Escolar"]

const UNITS = [
  { value: "UN", label: "UN (Unidade)" },
  { value: "CX", label: "CX (Caixa)" },
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
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)

    // Normalizar preço (converter vírgula para ponto para cálculos internos)
    const normalizedPrice = formData.price ? formData.price.replace(",", ".") : ""
    const normalizedWeight = formData.weight ? formData.weight.replace(",", ".") : ""

    const item: ScannedItem = {
      id: Date.now().toString(),
      fullBarcode: barcode,
      lastSixDigits: barcode.slice(-6),
      name: formData.name.trim() || `Produto ${barcode.slice(-6)}`,
      siteDescription: formData.siteDescription.trim() || undefined,
      brand: formData.brand.trim() || undefined,
      price: normalizedPrice ? Number.parseFloat(normalizedPrice) : undefined,
      weight: normalizedWeight ? Number.parseFloat(normalizedWeight) : undefined,
      unit: formData.unit || "UN",
      ageRange: formData.ageRange || undefined,
      category: formData.category || undefined,
      toyType: formData.toyType || undefined,
      scannedAt: new Date().toISOString(),
    }

    console.log("Item final a ser salvo:", item)

    await new Promise((resolve) => setTimeout(resolve, 600))

    onSave(item)

    // Limpar formulário
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
    setIsLoading(false)
  }

  const handleClose = () => {
    if (!isLoading) {
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
      onClose()
    }
  }

  const updateFormData = (field: string, value: string) => {
    console.log(`Atualizando campo ${field}:`, value)
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const formatPrice = (value: string) => {
    // Remove tudo exceto números, vírgula e ponto
    let cleaned = value.replace(/[^\d.,]/g, "")

    // Se tem ponto, converte para vírgula
    cleaned = cleaned.replace(".", ",")

    // Se tem mais de uma vírgula, mantém apenas a primeira
    const parts = cleaned.split(",")
    if (parts.length > 2) {
      cleaned = parts[0] + "," + parts.slice(1).join("")
    }

    // Limita a 2 casas decimais após a vírgula
    if (parts.length === 2 && parts[1].length > 2) {
      cleaned = parts[0] + "," + parts[1].substring(0, 2)
    }

    return cleaned
  }

  const formatWeight = (value: string) => {
    // Remove tudo exceto números, vírgula e ponto
    let cleaned = value.replace(/[^\d.,]/g, "")

    // Se tem ponto, converte para vírgula
    cleaned = cleaned.replace(".", ",")

    // Se tem mais de uma vírgula, mantém apenas a primeira
    const parts = cleaned.split(",")
    if (parts.length > 2) {
      cleaned = parts[0] + "," + parts.slice(1).join("")
    }

    // Limita a 2 casas decimais após a vírgula
    if (parts.length === 2 && parts[1].length > 2) {
      cleaned = parts[0] + "," + parts[1].substring(0, 2)
    }

    return cleaned
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-900 text-xl">
            <Package className="w-5 h-5 text-blue-600" />
            Cadastro de Produto
          </DialogTitle>
          <DialogDescription className="text-base">
            Preencha as informações do produto. Campos opcionais podem ser preenchidos posteriormente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do código */}
          <Card className="bg-slate-50 border-slate-200">
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Barcode className="w-4 h-4 text-slate-600" />
                  <span className="text-sm font-medium text-slate-700">Código Escaneado</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-slate-500 mb-1">Código Completo:</p>
                    <Badge variant="outline" className="font-mono text-sm px-3 py-1 bg-white w-full justify-center">
                      {barcode}
                    </Badge>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500 mb-1">Últimos 6 Dígitos:</p>
                    <Badge className="font-mono text-sm bg-slate-600 w-full justify-center">{barcode.slice(-6)}</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo obrigatório destacado */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Campo Obrigatório</span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2 text-base font-medium">
                  <Package className="w-4 h-4 text-blue-600" />
                  DESCRIÇÃO *
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Digite a descrição do produto"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  required
                  className="text-base py-3 px-4 border-2 focus:border-blue-400"
                  autoFocus
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Campos opcionais */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-sm font-medium text-slate-600">Informações Adicionais (Opcionais)</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              {/* Descrição do Site */}
              <div className="space-y-2">
                <Label htmlFor="siteDescription" className="flex items-center gap-2 text-base">
                  <Package className="w-4 h-4 text-slate-500" />
                  DESCRIÇÃOSITE
                </Label>
                <Input
                  id="siteDescription"
                  type="text"
                  placeholder="Descrição que aparecerá no site (opcional)"
                  value={formData.siteDescription}
                  onChange={(e) => updateFormData("siteDescription", e.target.value)}
                  className="text-base py-3 px-4"
                  disabled={isLoading}
                />
              </div>

              {/* Marca e PVP1 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brand" className="flex items-center gap-2 text-base">
                    <Tag className="w-4 h-4 text-slate-500" />
                    Marca
                  </Label>
                  <Input
                    id="brand"
                    type="text"
                    placeholder="Ex: Samsung, Apple, Nike"
                    value={formData.brand}
                    onChange={(e) => updateFormData("brand", e.target.value)}
                    className="text-base py-3 px-4"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="price" className="flex items-center gap-2 text-base">
                    <Euro className="w-4 h-4 text-slate-500" />
                    PVP1
                  </Label>
                  <Input
                    id="price"
                    type="text"
                    placeholder="Ex: 29,90"
                    value={formData.price}
                    onChange={(e) => {
                      const formatted = formatPrice(e.target.value)
                      updateFormData("price", formatted)
                    }}
                    className="text-base py-3 px-4"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Peso e Unidade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="flex items-center gap-2 text-base">
                    <Weight className="w-4 h-4 text-slate-500" />
                    Peso (gramas)
                  </Label>
                  <Input
                    id="weight"
                    type="text"
                    placeholder="Ex: 1000,00"
                    value={formData.weight}
                    onChange={(e) => {
                      const formatted = formatWeight(e.target.value)
                      updateFormData("weight", formatted)
                    }}
                    className="text-base py-3 px-4"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-base">
                    <Box className="w-4 h-4 text-slate-500" />
                    UNIDADE
                  </Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value) => updateFormData("unit", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="text-base py-3 px-4">
                      <SelectValue placeholder="Selecione a unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((unit) => (
                        <SelectItem key={unit.value} value={unit.value} className="text-base">
                          {unit.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Faixa Etária e Categoria */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-base">
                    <Users className="w-4 h-4 text-slate-500" />
                    Faixa Etária
                  </Label>
                  <Select
                    value={formData.ageRange}
                    onValueChange={(value) => updateFormData("ageRange", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="text-base py-3 px-4">
                      <SelectValue placeholder="Selecione (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {AGE_RANGES.map((age) => (
                        <SelectItem key={age} value={age} className="text-base">
                          {age}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-base">
                    <Grid3X3 className="w-4 h-4 text-slate-500" />
                    Categoria
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => updateFormData("category", value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger className="text-base py-3 px-4">
                      <SelectValue placeholder="Selecione (opcional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category} className="text-base">
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Tipo de Produto */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-base">
                  <Gamepad2 className="w-4 h-4 text-slate-500" />
                  Tipo de Produto
                </Label>
                <Select
                  value={formData.toyType}
                  onValueChange={(value) => updateFormData("toyType", value)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="text-base py-3 px-4">
                    <SelectValue placeholder="Selecione (opcional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRODUCT_TYPES.map((type) => (
                      <SelectItem key={type} value={type} className="text-base">
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Botões */}
            <div className="flex flex-col gap-3 pt-6 border-t border-slate-200">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-4 text-base font-medium bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    Salvando Produto...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Salvar Produto
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-4 text-base font-medium border-2 bg-transparent"
              >
                <X className="w-5 h-5" />
                Cancelar
              </Button>
            </div>
          </form>

          {/* Nota informativa */}
          <div className="text-center text-sm text-slate-500 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="font-medium text-slate-700 mb-1">💡 Dica Profissional</p>
            <p>
              Você pode cadastrar rapidamente apenas com a descrição e completar as informações depois na lista de
              produtos
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
