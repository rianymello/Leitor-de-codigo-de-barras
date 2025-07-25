"use client"

import { useState } from "react"
import type { ScannedItem } from "@/app/page"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, Package, Globe, DollarSign, Weight, Calendar, Tag, Layers } from "lucide-react"

interface ItemsListProps {
  items: ScannedItem[]
  onDeleteItem: (id: string) => void
  onUpdateItem: (item: ScannedItem) => void
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

  const handleEditClick = (item: ScannedItem) => {
    setEditingItem(item)
    setEditForm({
      name: item.name,
      siteDescription: item.siteDescription || "",
      brand: item.brand || "",
      price: item.price?.toString() || "",
      weight: item.weight?.toString() || "",
      unit: item.unit || "UN",
      ageRange: item.ageRange || "",
      category: item.category || "",
      toyType: item.toyType || "",
    })
  }

  const handleSaveEdit = () => {
    if (!editingItem) return

    const updatedItem: ScannedItem = {
      ...editingItem,
      name: editForm.name,
      siteDescription: editForm.siteDescription,
      brand: editForm.brand,
      price: Number(editForm.price),
      weight: Number(editForm.weight),
      unit: editForm.unit,
      ageRange: editForm.ageRange,
      category: editForm.category,
      toyType: editForm.toyType,
    }

    onUpdateItem(updatedItem)
    setEditingItem(null)
  }

  const formatPrice = (price?: number) => {
    if (!price) return "N/A"
    return `€${price.toFixed(2).replace(".", ",")}`
  }

  const formatWeight = (weight?: number) => {
    if (!weight) return "N/A"
    return `${weight.toFixed(2).replace(".", ",")} kg`
  }

  if (items.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Package className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <CardTitle className="text-slate-500 mb-2">Nenhum produto cadastrado</CardTitle>
          <CardDescription>Use o scanner para adicionar produtos ao inventário</CardDescription>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-slate-200 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold">Código</TableHead>
              <TableHead className="font-semibold">Ref</TableHead>
              <TableHead className="font-semibold">Descrição</TableHead>
              <TableHead className="font-semibold text-blue-600">
                <div className="flex items-center gap-1">
                  <Globe className="w-4 h-4" />
                  Descrição Site
                </div>
              </TableHead>
              <TableHead className="font-semibold">Marca</TableHead>
              <TableHead className="font-semibold">PVP1</TableHead>
              <TableHead className="font-semibold">Peso</TableHead>
              <TableHead className="font-semibold">Unidade</TableHead>
              <TableHead className="font-semibold">Faixa Etária</TableHead>
              <TableHead className="font-semibold">Categoria</TableHead>
              <TableHead className="font-semibold">Família</TableHead>
              <TableHead className="font-semibold text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="hover:bg-slate-50">
                <TableCell className="font-mono text-sm">{item.fullBarcode}</TableCell>
                <TableCell>
                  <Badge variant="secondary" className="font-mono">
                    {item.lastSixDigits}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="text-blue-700 font-medium">{item.siteDescription || item.name}</TableCell>
                <TableCell>{item.brand || "N/A"}</TableCell>
                <TableCell className="font-semibold text-green-700">{formatPrice(item.price)}</TableCell>
                <TableCell>{formatWeight(item.weight)}</TableCell>
                <TableCell>
                  <Badge variant="outline">{item.unit}</Badge>
                </TableCell>
                <TableCell>{item.ageRange || "N/A"}</TableCell>
                <TableCell>{item.category || "N/A"}</TableCell>
                <TableCell>{item.toyType || "N/A"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(item)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <Edit className="w-5 h-5 text-blue-600" />
                            Editar Produto
                          </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="edit-name" className="flex items-center gap-2">
                                <Tag className="w-4 h-4" />
                                Nome do Produto
                              </Label>
                              <Input
                                id="edit-name"
                                value={editForm.name}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                              />
                              <p className="text-xs text-slate-500">Nome interno do produto para identificação</p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="edit-siteDescription" className="flex items-center gap-2">
                                <Globe className="w-4 h-4 text-blue-600" />
                                Descrição para Site
                              </Label>
                              <Input
                                id="edit-siteDescription"
                                value={editForm.siteDescription}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, siteDescription: e.target.value }))}
                              />
                              <p className="text-xs text-blue-600">Nome que aparecerá no site para os clientes</p>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="edit-brand">Marca</Label>
                              <Input
                                id="edit-brand"
                                value={editForm.brand}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, brand: e.target.value }))}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="edit-price" className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                Preço (€)
                              </Label>
                              <Input
                                id="edit-price"
                                type="number"
                                step="0.01"
                                value={editForm.price}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, price: e.target.value }))}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="edit-weight" className="flex items-center gap-2">
                                <Weight className="w-4 h-4" />
                                Peso (kg)
                              </Label>
                              <Input
                                id="edit-weight"
                                type="number"
                                step="0.01"
                                value={editForm.weight}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, weight: e.target.value }))}
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="edit-unit">Unidade</Label>
                              <Select
                                value={editForm.unit}
                                onValueChange={(value) => setEditForm((prev) => ({ ...prev, unit: value }))}
                              >
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

                            <div className="space-y-2">
                              <Label htmlFor="edit-ageRange" className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Faixa Etária
                              </Label>
                              <Select
                                value={editForm.ageRange}
                                onValueChange={(value) => setEditForm((prev) => ({ ...prev, ageRange: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {ageRanges.map((range) => (
                                    <SelectItem key={range} value={range}>
                                      {range}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="edit-category" className="flex items-center gap-2">
                                <Layers className="w-4 h-4" />
                                Categoria
                              </Label>
                              <Select
                                value={editForm.category}
                                onValueChange={(value) => setEditForm((prev) => ({ ...prev, category: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {categories.map((category) => (
                                    <SelectItem key={category} value={category}>
                                      {category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                              <Label htmlFor="edit-toyType">Tipo de Produto</Label>
                              <Select
                                value={editForm.toyType}
                                onValueChange={(value) => setEditForm((prev) => ({ ...prev, toyType: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {productTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setEditingItem(null)}>
                              Cancelar
                            </Button>
                            <Button onClick={handleSaveEdit} className="bg-blue-600 hover:bg-blue-700">
                              Salvar Alterações
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o produto "{item.name}"? Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => onDeleteItem(item.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
