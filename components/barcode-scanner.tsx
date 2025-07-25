"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, CameraOff, RotateCcw, AlertCircle } from "lucide-react"

interface BarcodeScannerProps {
  onBarcodeScanned: (barcode: string) => void
}

export function BarcodeScanner({ onBarcodeScanned }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const scannerRef = useRef<any>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    return () => {
      stopScanner()
    }
  }, [])

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.stop()
      scannerRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
    setIsScanning(false)
  }

  const startScanner = async () => {
    try {
      setIsLoading(true)
      setError("")

      // Importar ZXing dinamicamente
      const { BrowserMultiFormatReader } = await import("@zxing/library")

      // Parar scanner anterior se existir
      stopScanner()

      // Configurar constraints da câmera
      const constraints = {
        video: {
          facingMode: "environment",
          width: { min: 640, ideal: 1280, max: 1920 },
          height: { min: 480, ideal: 720, max: 1080 },
        },
      }

      // Obter stream da câmera
      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.autoplay = true
        videoRef.current.playsInline = true

        // Aguardar o vídeo carregar
        await new Promise((resolve) => {
          if (videoRef.current) {
            videoRef.current.onloadedmetadata = () => resolve(true)
          }
        })

        // Aguardar um pouco mais para garantir que o vídeo está pronto
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Inicializar o scanner
        const codeReader = new BrowserMultiFormatReader()
        scannerRef.current = codeReader

        setIsScanning(true)
        setIsLoading(false)

        // Iniciar a leitura
        codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
          if (result) {
            const barcode = result.getText()
            console.log("Código escaneado:", barcode)
            onBarcodeScanned(barcode)
            stopScanner()
          }
          if (error && !(error.name === "NotFoundException")) {
            console.error("Erro no scanner:", error)
          }
        })
      }
    } catch (err: any) {
      console.error("Erro ao iniciar scanner:", err)
      setIsLoading(false)

      if (err.name === "NotAllowedError") {
        setError("Acesso à câmera negado. Permita o acesso e tente novamente.")
      } else if (err.name === "NotFoundError") {
        setError("Nenhuma câmera encontrada no dispositivo.")
      } else if (err.name === "NotSupportedError") {
        setError("Câmera não suportada neste navegador.")
      } else {
        setError("Erro ao acessar a câmera. Verifique as permissões.")
      }
    }
  }

  const retryScanner = () => {
    stopScanner()
    setError("")
    startScanner()
  }

  return (
    <div className="space-y-6">
      {/* Área do Scanner */}
      <div className="relative">
        <Card className="overflow-hidden bg-black">
          <CardContent className="p-0">
            <div className="relative aspect-video bg-slate-900 flex items-center justify-center">
              {!isScanning && !isLoading && !error && (
                <div className="text-center text-white p-8">
                  <Camera className="w-16 h-16 mx-auto mb-4 text-slate-400" />
                  <h3 className="text-xl font-semibold mb-2">Scanner Pronto</h3>
                  <p className="text-slate-300">Clique em "Iniciar Scanner" para começar</p>
                </div>
              )}

              {isLoading && (
                <div className="text-center text-white p-8">
                  <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Iniciando Câmera</h3>
                  <p className="text-slate-300">Aguarde um momento...</p>
                </div>
              )}

              {error && (
                <div className="text-center text-white p-8">
                  <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-400" />
                  <h3 className="text-xl font-semibold mb-2 text-red-400">Erro na Câmera</h3>
                  <p className="text-slate-300 mb-4">{error}</p>
                </div>
              )}

              {/* Vídeo da câmera */}
              <video
                ref={videoRef}
                className={`w-full h-full object-cover ${isScanning ? "block" : "hidden"}`}
                playsInline
                muted
              />

              {/* Overlay de scan quando ativo */}
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Cantos do scanner */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-4 border-transparent">
                    {/* Canto superior esquerdo */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-blue-500"></div>
                    {/* Canto superior direito */}
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-blue-500"></div>
                    {/* Canto inferior esquerdo */}
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-blue-500"></div>
                    {/* Canto inferior direito */}
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-blue-500"></div>
                  </div>

                  {/* Linha de scan animada */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-500 animate-pulse"></div>
                  </div>

                  {/* Instruções */}
                  <div className="absolute bottom-4 left-4 right-4 text-center">
                    <div className="bg-black bg-opacity-50 rounded-lg p-3">
                      <p className="text-white text-sm font-medium">
                        📱 Posicione o código de barras na área destacada
                      </p>
                      <p className="text-slate-300 text-xs mt-1">Mantenha boa iluminação e estabilidade</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles */}
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {!isScanning && !isLoading && (
          <Button
            onClick={startScanner}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3"
            size="lg"
          >
            <Camera className="w-5 h-5" />
            Iniciar Scanner
          </Button>
        )}

        {isScanning && (
          <Button onClick={stopScanner} variant="destructive" className="flex items-center gap-2 px-6 py-3" size="lg">
            <CameraOff className="w-5 h-5" />
            Parar Scanner
          </Button>
        )}

        {error && (
          <Button
            onClick={retryScanner}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3"
            size="lg"
          >
            <RotateCcw className="w-5 h-5" />
            Tentar Novamente
          </Button>
        )}
      </div>

      {/* Dicas de uso */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Dicas para melhor leitura
          </h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Mantenha boa iluminação no ambiente</li>
            <li>• Posicione o código de barras dentro da área destacada</li>
            <li>• Mantenha o dispositivo estável durante a leitura</li>
            <li>• Certifique-se de que o código está nítido e legível</li>
          </ul>
        </CardContent>
      </Card>

      {/* Canvas oculto para processamento */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
