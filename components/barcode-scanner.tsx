"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Keyboard, ScanLine } from "lucide-react"

interface BarcodeScannerProps {
  onBarcodeScanned: (barcode: string) => void
}

export function BarcodeScanner({ onBarcodeScanned }: BarcodeScannerProps) {
  const [manualBarcode, setManualBarcode] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualBarcode.trim()) {
      onBarcodeScanned(manualBarcode.trim())
      setManualBarcode("")
    }
  }

  const simulateCamera = () => {
    setIsScanning(true)
    // Simular delay da câmera
    setTimeout(() => {
      // Gerar código de barras simulado
      const simulatedBarcode = `123456789${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`
      onBarcodeScanned(simulatedBarcode)
      setIsScanning(false)
    }, 2000)
  }

  return (
    <div className="space-y-6">
      {/* Scanner por Câmera */}
      <Card className="border-2 border-dashed border-slate-300 bg-slate-50">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              {isScanning ? (
                <ScanLine className="w-8 h-8 text-blue-600 animate-pulse" />
              ) : (
                <Camera className="w-8 h-8 text-blue-600" />
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">
                {isScanning ? "Escaneando..." : "Scanner por Câmera"}
              </h3>
              <p className="text-slate-600 mb-4">
                {isScanning
                  ? "Posicione o código de barras na frente da câmera"
                  : "Clique para ativar a câmera e escanear códigos de barras"}
              </p>
            </div>

            <Button
              onClick={simulateCamera}
              disabled={isScanning}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
            >
              {isScanning ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Escaneando...
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4 mr-2" />
                  Iniciar Scanner
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Divisor */}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-px bg-slate-200"></div>
        <span className="text-sm text-slate-500 font-medium">OU</span>
        <div className="flex-1 h-px bg-slate-200"></div>
      </div>

      {/* Entrada Manual */}
      <Card className="border-slate-200">
        <CardContent className="p-6">
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Keyboard className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-semibold text-slate-800">Entrada Manual</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manual-barcode" className="text-base font-medium">
                Código de Barras
              </Label>
              <Input
                ref={inputRef}
                id="manual-barcode"
                type="text"
                placeholder="Digite ou cole o código de barras"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                className="text-base py-3 px-4 font-mono"
                autoComplete="off"
              />
            </div>

            <Button
              type="submit"
              disabled={!manualBarcode.trim()}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3"
            >
              <ScanLine className="w-4 h-4 mr-2" />
              Processar Código
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Dicas */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-amber-600 mt-0.5">💡</div>
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Dicas para melhor resultado:</p>
            <ul className="space-y-1 text-amber-700">
              <li>• Mantenha o código de barras bem iluminado</li>
              <li>• Posicione a câmera a cerca de 15-20cm do código</li>
              <li>• Certifique-se de que o código esteja completamente visível</li>
              <li>• Use a entrada manual se o scanner não funcionar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
