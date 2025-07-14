"use client"

import { useState, useEffect } from "react"
import { BarcodeScanner } from "@/components/barcode-scanner"
import { ItemsList } from "@/components/items-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScanLine, FileSpreadsheet, Camera, BarChart3 } from "lucide-react"
import { BarcodeModal } from "@/components/barcode-modal"

export interface ScannedItem {
  id: string
  fullBarcode: string
  lastSixDigits: string
  name: string
  brand?: string
  price?: number
  weight?: number
  ageRange?: string
  category?: string
  toyType?: string
  scannedAt: string
}

export default function Home() {
  const [scannedBarcode, setScannedBarcode] = useState<string>("")
  const [items, setItems] = useState<ScannedItem[]>([])
  const [activeTab, setActiveTab] = useState("scanner")
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Carregar itens do localStorage
    const savedItems = localStorage.getItem("inventoryItems")
    if (savedItems) {
      setItems(JSON.parse(savedItems))
    }
  }, [])

  const handleBarcodeScanned = (barcode: string) => {
    setScannedBarcode(barcode)
    setShowModal(true)
  }

  const handleItemSaved = (item: ScannedItem) => {
    const updatedItems = [...items, item]
    setItems(updatedItems)
    localStorage.setItem("inventoryItems", JSON.stringify(updatedItems))
    setScannedBarcode("")
    setShowModal(false)
    setActiveTab("items")
  }

  const handleDeleteItem = (id: string) => {
    const updatedItems = items.filter((item) => item.id !== id)
    setItems(updatedItems)
    localStorage.setItem("inventoryItems", JSON.stringify(updatedItems))
  }

  const handleUpdateItem = (updatedItem: ScannedItem) => {
    const updatedItems = items.map((item) => (item.id === updatedItem.id ? updatedItem : item))
    setItems(updatedItems)
    localStorage.setItem("inventoryItems", JSON.stringify(updatedItems))
  }

  const exportToExcel = async () => {
    try {
      const XLSX = await import("xlsx")

      // Preparar dados
      const worksheetData = items.map((item) => ({
        "Código Completo": item.fullBarcode,
        "Últimos 6 Dígitos": item.lastSixDigits,
        "Nome do Produto": item.name,
        Marca: item.brand || "Não informado",
        Preço: item.price ? `€ ${item.price.toFixed(2)}` : "Não informado",
        Peso: item.weight ? `${item.weight}g` : "Não informado",
        "Faixa Etária": item.ageRange || "Não informado",
        Categoria: item.category || "Não informado",
        "Tipo de Produto": item.toyType || "Não informado",
        "Data de Cadastro": new Date(item.scannedAt).toLocaleString("pt-BR"),
      }))

      // Criar worksheet
      const worksheet = XLSX.utils.json_to_sheet(worksheetData)

      // Configurar larguras das colunas
      const columnWidths = [
        { wch: 15 }, // Código Completo
        { wch: 12 }, // Últimos 6 Dígitos
        { wch: 30 }, // Nome do Produto
        { wch: 15 }, // Marca
        { wch: 12 }, // Preço
        { wch: 10 }, // Peso
        { wch: 15 }, // Faixa Etária
        { wch: 20 }, // Categoria
        { wch: 15 }, // Tipo de Produto
        { wch: 20 }, // Data de Cadastro
      ]
      worksheet["!cols"] = columnWidths

      // Criar workbook
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, "Inventário")
      XLSX.writeFile(workbook, `inventario-${new Date().toISOString().split("T")[0]}.xlsx`)
    } catch (error) {
      console.error("Erro ao exportar:", error)
      alert("Erro ao exportar dados. Tente novamente.")
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setScannedBarcode("")
  }

  const totalValue = items.reduce((sum, item) => sum + (item.price || 0), 0)
  const itemsWithPrice = items.filter((item) => item.price && item.price > 0)

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Profissional */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-900">Sistema de Inventário</h1>
              <p className="text-slate-600 mt-1">Gestão de produtos e estoque</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8 h-12 bg-white border border-slate-200 shadow-sm">
            <TabsTrigger
              value="scanner"
              className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Scanner</span>
              <span className="sm:hidden">Scan</span>
            </TabsTrigger>
            <TabsTrigger
              value="items"
              className="flex items-center gap-2 text-sm font-medium data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <BarChart3 className="w-4 h-4" />
              <span className="hidden sm:inline">Inventário ({items.length})</span>
              <span className="sm:hidden">({items.length})</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scanner">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50 border-b border-slate-200">
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <ScanLine className="w-5 h-5 text-blue-600" />
                  Scanner de Código de Barras
                </CardTitle>
                <CardDescription>
                  Escaneie o código de barras do produto para iniciar o cadastro no inventário
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <BarcodeScanner onBarcodeScanned={handleBarcodeScanned} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="items">
            <Card className="shadow-sm border-slate-200">
              <CardHeader className="bg-slate-50 border-b border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <CardTitle className="text-slate-900">Inventário de Produtos</CardTitle>
                    <CardDescription>
                      {items.length} {items.length === 1 ? "produto cadastrado" : "produtos cadastrados"} no sistema
                    </CardDescription>
                  </div>
                  {items.length > 0 && (
                    <Button
                      onClick={exportToExcel}
                      className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      Exportar Excel
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <ItemsList items={items} onDeleteItem={handleDeleteItem} onUpdateItem={handleUpdateItem} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <BarcodeModal isOpen={showModal} barcode={scannedBarcode} onClose={handleCloseModal} onSave={handleItemSaved} />
      </div>
    </div>
  )
}
