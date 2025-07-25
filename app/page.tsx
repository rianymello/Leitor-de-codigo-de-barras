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
  siteDescription?: string
  brand?: string
  price?: number
  weight?: number
  unit?: string
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
    try {
      const savedItems = localStorage.getItem("inventoryItems")
      if (savedItems) {
        setItems(JSON.parse(savedItems))
      }
    } catch (error) {
      console.error("Erro ao carregar itens:", error)
    }
  }, [])

  const handleBarcodeScanned = (barcode: string) => {
    setScannedBarcode(barcode)
    setShowModal(true)
  }

  const handleItemSaved = (item: ScannedItem) => {
    try {
      const updatedItems = [...items, item]
      setItems(updatedItems)
      localStorage.setItem("inventoryItems", JSON.stringify(updatedItems))
      setScannedBarcode("")
      setShowModal(false)
      setActiveTab("items")
    } catch (error) {
      console.error("Erro ao salvar item:", error)
      alert("Erro ao salvar o produto. Tente novamente.")
    }
  }

  const handleDeleteItem = (id: string) => {
    try {
      const updatedItems = items.filter((item) => item.id !== id)
      setItems(updatedItems)
      localStorage.setItem("inventoryItems", JSON.stringify(updatedItems))
    } catch (error) {
      console.error("Erro ao deletar item:", error)
      alert("Erro ao deletar o produto. Tente novamente.")
    }
  }

  const handleUpdateItem = (updatedItem: ScannedItem) => {
    try {
      const updatedItems = items.map((item) => (item.id === updatedItem.id ? updatedItem : item))
      setItems(updatedItems)
      localStorage.setItem("inventoryItems", JSON.stringify(updatedItems))
    } catch (error) {
      console.error("Erro ao atualizar item:", error)
      alert("Erro ao atualizar o produto. Tente novamente.")
    }
  }

  const exportToExcel = async () => {
    try {
      const XLSX = await import("xlsx")

      // Preparar dados na ordem específica solicitada
      const worksheetData = items.map((item) => ({
        CODIGOBARRAS: item.fullBarcode,
        REFERENCIA: item.lastSixDigits,
        DESCRICAO: item.name,
        DESCRICAOSITE: item.siteDescription || item.name,
        MARCA: item.brand || "Não informado",
        PVP1: item.price ? item.price.toFixed(2).replace(".", ",") : "Não informado",
        FAIXAETARIA: item.ageRange || "Não informado",
        CATEGORIA: item.category || "Não informado",
        UNIDADE: item.unit || "UN",
        FAMILIA: item.toyType || "Não informado",
        PESO: item.weight ? item.weight.toFixed(2).replace(".", ",") : "Não informado",
        ONLINE: "SIM", // Campo padrão para indicar disponibilidade online
      }))

      // Criar worksheet
      const worksheet = XLSX.utils.json_to_sheet(worksheetData)

      // Configurar larguras das colunas na nova ordem
      const columnWidths = [
        { wch: 15 }, // CODIGOBARRAS
        { wch: 12 }, // REFERENCIA
        { wch: 30 }, // DESCRICAO
        { wch: 30 }, // DESCRICAOSITE
        { wch: 15 }, // MARCA
        { wch: 12 }, // PVP1
        { wch: 15 }, // FAIXAETARIA
        { wch: 20 }, // CATEGORIA
        { wch: 10 }, // UNIDADE
        { wch: 15 }, // FAMILIA
        { wch: 10 }, // PESO
        { wch: 8 }, // ONLINE
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
