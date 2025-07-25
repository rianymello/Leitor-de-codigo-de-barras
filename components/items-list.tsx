"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Package, Tag, Edit, Save, X, Euro, Weight, Box, Globe } from "lucide-react"
import type { ScannedItem } from "@/app/page"

interface ItemsListProps {
  items: ScannedItem[]
  onDeleteItem: (id: string) => void
  onUpdateItem?: (item: ScannedItem) => void
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

export function ItemsList({ items, onDeleteItem, onUpdateItem }: ItemsListProps) {
  const [editingItem, setEditingItem] = useState<ScannedItem | null>(null)
  const [editForm, setEditForm] = useState({
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

  if (items.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="bg-slate-100 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <Package className="w-10 h-10 text-slate-400" />
        </div>
        <h3 className="text-xl font-semibold text-slate-700 mb-2">Inventário Vazio</h3>
        <p className="text-slate-500 max-w-md mx-auto">
          Escaneie códigos de barras para começar a construir seu inventário de produtos
        </p>
      </div>
    )
  }

  const handleEditClick = (item: ScannedItem) => {
    setEditingItem(item)
    setEditForm({
      name: item.name,
      siteDescription: item.siteDescription || "",
      brand: item.brand || "",
      price: item.price ? item.price.toFixed(2).replace(".", ",") : "",
      weight: item.weight ? item.weight.toFixed(2).replace(".", ",") : "",
      unit: item.unit || "UN",
      ageRange: item.ageRange || "",
      category: item.category || "",
      toyType: item.toyType || "",
    })
  }

  const handleSaveEdit = async () => {
    if (!editingItem || !onUpdateItem) return

    setIsLoading(true)

    try {
      const normalizedPrice = editForm.price ? editForm.price.replace(",", ".") : ""
      const normalizedWeight = editForm.weight ? editForm.weight.replace(",", ".") : ""

      const updatedItem: ScannedItem = {
        ...editingItem,
        name: editForm.name.trim() || editingItem.name,
        siteDescription: editForm.siteDescription.trim() || undefined,
        brand: editForm.brand.trim() || undefined,
        price: normalizedPrice ? Number.parseFloat(normalizedPrice) : undefined,
        weight: normalizedWeight ? Number.parseFloat(normalizedWeight) : undefined,
        unit: editForm.unit || "UN",
        ageRange: editForm.ageRange || undefined,
        category: editForm.category || undefined,
        toyType: editForm.toyType || undefined,
      }

      await new Promise((resolve) => setTimeout(resolve, 500))

      onUpdateItem(updatedItem)
      setEditingItem(null)
    } catch (error) {
      console.error("Erro ao atualizar produto:", error)
      alert("Erro ao atualizar produto. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
    setEditForm({
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
  }

  const updateEditForm = (field: string, value: string) => {
    setEditForm((prev) => ({ ...prev, [field]: value }))
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
    <div className="space-y-6">
      {/* Mobile view - Cards Simples */}
      <div className="block lg:hidden space-y-4">
        {items.map((item) => (
          <Card key={item.id} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-slate-800 leading-tight">{item.name}</h3>
                    {item.siteDescription && (
                      <p className="text-sm text-blue-600 mt-1 italic">Site: {item.siteDescription}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {item.brand ? (
                        <>
                          <Tag className="w-3 h-3 text-slate-500" />
                          <span className="text-sm text-slate-600">{item.brand}</span>
                        </>
                      ) : (
                        <span className="text-sm text-slate-400 italic">Marca não informada</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(item)}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50 p-2"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteItem(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Info básica */}
                <div className="space-y-2 text-sm">
                  {item.price && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">PVP1:</span>
                      <Badge className="bg-green-100 text-green-800 font-mono text-sm">
                        {item.price.toFixed(2).replace(".", ",")}
                      </Badge>
                    </div>
                  )}
                  {item.weight && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Peso:</span>
                      <Badge className="bg-blue-100 text-blue-800 font-mono text-sm">
                        {item.weight.toFixed(2).replace(".", ",")}g
                      </Badge>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600">Unidade:</span>
                    <Badge className="bg-purple-100 text-purple-800 text-sm">{item.unit || "UN"}</Badge>
                  </div>
                  {item.category && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-600">Categoria:</span>
                      <span className="font-medium">{item.category}</span>
                    </div>
                  )}
                </div>

                {/* Código */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Código:</span>
                    <span className="font-mono text-slate-600">{item.fullBarcode}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Desktop view - Table Simples */}
      <div className="hidden lg:block border rounded-lg overflow-hidden shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead className="font-semibold text-slate-700">DESCRIÇÃO</TableHead>
              <TableHead className="font-semibold text-slate-700">Marca</TableHead>
              <TableHead className="font-semibold text-slate-700">PVP1</TableHead>
              <TableHead className="font-semibold text-slate-700">Peso</TableHead>
              <TableHead className="font-semibold text-slate-700">UNIDADE</TableHead>
              <TableHead className="font-semibold text-slate-700">Categoria</TableHead>
              <TableHead className="w-[120px] font-semibold text-slate-700">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="hover:bg-slate-50">
                <TableCell>
                  <div>
                    <div className="font-medium text-slate-800">{item.name}</div>
                    {item.siteDescription && (
                      <div className="text-xs text-blue-600 italic">Site: {item.siteDescription}</div>
                    )}
                    <div className="text-xs text-slate-500 font-mono">{item.fullBarcode}</div>
                  </div>
                </TableCell>
                <TableCell>
                  {item.brand ? (
                    <span className="text-slate-700">{item.brand}</span>
                  ) : (
                    <span className="text-slate-400 text-sm italic">Não informado</span>
                  )}
                </TableCell>
                <TableCell>
                  {item.price ? (
                    <Badge className="bg-green-100 text-green-800 font-mono">
                      {item.price.toFixed(2).replace(".", ",")}
                    </Badge>
                  ) : (
                    <span className="text-slate-400 text-sm italic">Não informado</span>
                  )}
                </TableCell>
                <TableCell>
                  {item.weight ? (
                    <Badge className="bg-blue-100 text-blue-800 font-mono">
                      {item.weight.toFixed(2).replace(".", ",")}g
                    </Badge>
                  ) : (
                    <span className="text-slate-400 text-sm italic">Não informado</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className="bg-purple-100 text-purple-800">{item.unit || "UN"}</Badge>
                </TableCell>
                <TableCell>
                  {item.category ? (
                    <span className="text-slate-700">{item.category}</span>
                  ) : (
                    <span className="text-slate-400 text-sm italic">Não informado</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(item)}
                      className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteItem(item.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal de Edição */}
      <Dialog open={!!editingItem} onOpenChange={() => !isLoading && handleCancelEdit()}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 text-xl">
              <Edit className="w-5 h-5 text-blue-600" />
              Editar Produto
            </DialogTitle>
            <DialogDescription className="text-base">
              Atualize as informações do produto conforme necessário.
            </DialogDescription>
          </DialogHeader>

          {editingItem && (
            <div className="space-y-6">
              {/* Código do produto */}
              <Card className="bg-slate-50 border-slate-200">
                <CardContent className="pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-4 h-4 text-slate-600" />
                    <span className="text-sm font-medium text-slate-700">Código: {editingItem.fullBarcode}</span>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {/* DESCRIÇÃO */}
                <div className="space-y-2">
                  <Label htmlFor="edit-name" className="text-base font-medium">
                    DESCRIÇÃO
                  </Label>
                  <p className="text-xs text-slate-600">Nome do produto para uso interno e identificação</p>
                  <Input
                    id="edit-name"
                    type="text"
                    placeholder="Digite a descrição do produto"
                    value={editForm.name}
                    onChange={(e) => updateEditForm("name", e.target.value)}
                    className="text-base py-3 px-4"
                    disabled={isLoading}
                  />
                </div>

                {/* DESCRIÇÃOSITE */}
                <div className="space-y-2">
                  <Label htmlFor="edit-siteDescription" className="flex items-center gap-2 text-base">
                    <Globe className="w-4 h-4 text-slate-500" />
                    DESCRIÇÃOSITE
                  </Label>
                  <p className="text-xs text-slate-600">Nome do produto que aparecerá no site (visível aos clientes)</p>
                  <Input
                    id="edit-siteDescription"
                    type="text"
                    placeholder="Nome que será exibido no site (opcional)"
                    value={editForm.siteDescription}
                    onChange={(e) => updateEditForm("siteDescription", e.target.value)}
                    className="text-base py-3 px-4"
                    disabled={isLoading}
                  />
                </div>

                {/* Marca e PVP1 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-brand" className="text-base">
                      Marca
                    </Label>
                    <Input
                      id="edit-brand"
                      type="text"
                      placeholder="Ex: Samsung, Apple, Nike"
                      value={editForm.brand}
                      onChange={(e) => updateEditForm("brand", e.target.value)}
                      className="text-base py-3 px-4"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-price" className="flex items-center gap-2 text-base">
                      <Euro className="w-4 h-4 text-slate-500" />
                      PVP1
                    </Label>
                    <Input
                      id="edit-price"
                      type="text"
                      placeholder="Ex: 29,90"
                      value={editForm.price}
                      onChange={(e) => {
                        const formatted = formatPrice(e.target.value)
                        updateEditForm("price", formatted)
                      }}
                      className="text-base py-3 px-4"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Peso e Unidade */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-weight" className="flex items-center gap-2 text-base">
                      <Weight className="w-4 h-4 text-slate-500" />
                      Peso (gramas)
                    </Label>
                    <Input
                      id="edit-weight"
                      type="text"
                      placeholder="Ex: 1000,00"
                      value={editForm.weight}
                      onChange={(e) => {
                        const formatted = formatWeight(e.target.value)
                        updateEditForm("weight", formatted)
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
                      value={editForm.unit}
                      onValueChange={(value) => updateEditForm("unit", value)}
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

                {/* Categoria e Tipo */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-base">Categoria</Label>
                    <Select
                      value={editForm.category}
                      onValueChange={(value) => updateEditForm("category", value)}
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

                  <div className="space-y-2">
                    <Label className="text-base">Tipo de Produto</Label>
                    <Select
                      value={editForm.toyType}
                      onValueChange={(value) => updateEditForm("toyType", value)}
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

                {/* Faixa Etária */}
                <div className="space-y-2">
                  <Label className="text-base">Faixa Etária</Label>
                  <Select
                    value={editForm.ageRange}
                    onValueChange={(value) => updateEditForm("ageRange", value)}
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
              </div>

              {/* Botões */}
              <div className="flex flex-col gap-3 pt-6 border-t border-slate-200">
                <Button
                  onClick={handleSaveEdit}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-4 text-base font-medium bg-blue-600 hover:bg-blue-700"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Salvar Alterações
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 py-4 text-base font-medium border-2 bg-transparent"
                >
                  <X className="w-5 h-5" />
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
