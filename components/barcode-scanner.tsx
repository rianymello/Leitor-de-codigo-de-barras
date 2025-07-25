"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, Keyboard, Scan, AlertCircle } from "lucide-react"

interface BarcodeScannerProps {
  onBarcodeScanned: (barcode: string) => void
}

export function BarcodeScanner({ onBarcodeScanned }: BarcodeScannerProps) {
  const [manualBarcode, setManualBarcode] = useState("")
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState("")
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const startCamera = useCallback(async () => {
    try {
      setError("")
      setIsScanning(true)

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "environment", // Câmera traseira
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      })

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        streamRef.current = stream
      }
    } catch (err) {
      console.error("Erro ao acessar câmera:", err)
      setError("Não foi possível acessar a câmera. Verifique as permissões.")
      setIsScanning(false)
    }
  }, [])

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }, [])

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (manualBarcode.trim()) {
      onBarcodeScanned(manualBarcode.trim())
      setManualBarcode("")
    }
  }

  const simulateBarcodeScan = () => {
    // Simular escaneamento para demonstração
    const mockBarcode = `789${Math.floor(Math.random() * 1000000000000)}`
    onBarcodeScanned(mockBarcode)
    stopCamera()
  }

  return (
    <div className="space-y-6">
      {/* Scanner por Câmera */}
      <Card>
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Camera className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold">Scanner por Câmera</h3>
            </div>

            {!isScanning ? (
              <div className="space-y-4">
                <div className="w-full h-48 bg-slate-100 rounded-lg flex items-center justify-center border-2 border-dashed border-slate-300">
                  <div className="text-center">
                    <Scan className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                    <p className="text-slate-500">Clique para ativar a câmera</p>
                  </div>
                </div>
                <Button onClick={startCamera} className="w-full bg-blue-600 hover:bg-blue-700">
                  <Camera className="w-4 h-4 mr-2" />
                  Ativar Câmera
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-48 bg-black rounded-lg object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-24 border-2 border-red-500 rounded-lg bg-transparent"></div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={simulateBarcodeScan} className="flex-1 bg-green-600 hover:bg-green-700">
                    <Scan className="w-4 h-4 mr-2" />
                    Simular Scan
                  </Button>
                  <Button onClick={stopCamera} variant="outline" className="flex-1 bg-transparent">
                    Parar Câmera
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Entrada Manual */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Keyboard className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-semibold">Entrada Manual</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manual-barcode">Código de Barras</Label>
              <Input
                id="manual-barcode"
                type="text"
                value={manualBarcode}
                onChange={(e) => setManualBarcode(e.target.value)}
                placeholder="Digite ou cole o código de barras"
                className="font-mono"
              />
            </div>

            <Button type="submit" disabled={!manualBarcode.trim()} className="w-full bg-slate-600 hover:bg-slate-700">
              Processar Código
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Mensagem de Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Instruções */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-blue-900 mb-2">Como usar:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Use a câmera para escanear códigos de barras automaticamente</li>
            <li>• Ou digite/cole o código manualmente no campo abaixo</li>
            <li>• Posicione o código dentro do retângulo vermelho para melhor leitura</li>
            <li>• Certifique-se de que há boa iluminação</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
