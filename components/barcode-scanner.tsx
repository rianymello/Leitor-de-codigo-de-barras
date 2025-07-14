"use client"

import { useEffect, useRef, useState } from "react"
import { BrowserMultiFormatReader } from "@zxing/library"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, CameraOff, RotateCcw, AlertCircle } from "lucide-react"

interface BarcodeScannerProps {
  onBarcodeScanned: (barcode: string) => void
}

export function BarcodeScanner({ onBarcodeScanned }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>("")
  const [codeReader, setCodeReader] = useState<BrowserMultiFormatReader | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const scanningRef = useRef(false)

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    setCodeReader(reader)

    return () => {
      stopScanning()
      reader.reset()
    }
  }, [])

  const startScanning = async () => {
    if (!codeReader || !videoRef.current || scanningRef.current) return

    try {
      setError("")
      setIsScanning(true)
      scanningRef.current = true

      // Parar qualquer stream anterior
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
        },
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
        await videoRef.current.play()

        // Aguardar um pouco para o vídeo carregar completamente
        await new Promise((resolve) => setTimeout(resolve, 500))

        // Iniciar o scanner
        codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
          if (result && scanningRef.current) {
            const barcode = result.getText()
            console.log("Código detectado:", barcode)
            onBarcodeScanned(barcode)
            stopScanning()
          }
          if (error && error.name !== "NotFoundException") {
            console.warn("Erro no scanner:", error)
          }
        })
      }
    } catch (err) {
      console.error("Erro ao iniciar scanner:", err)
      let errorMessage = "Erro ao acessar a câmera. "

      if (err instanceof Error) {
        if (err.name === "NotAllowedError") {
          errorMessage += "Permissão negada. Permita o acesso à câmera."
        } else if (err.name === "NotFoundError") {
          errorMessage += "Câmera não encontrada."
        } else if (err.name === "NotReadableError") {
          errorMessage += "Câmera está sendo usada por outro aplicativo."
        } else {
          errorMessage += "Verifique as permissões e tente novamente."
        }
      }

      setError(errorMessage)
      setIsScanning(false)
      scanningRef.current = false
    }
  }

  const stopScanning = () => {
    scanningRef.current = false

    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop()
        console.log("Track parado:", track.kind)
      })
      setStream(null)
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
      videoRef.current.pause()
    }

    if (codeReader) {
      codeReader.reset()
    }

    setIsScanning(false)
  }

  const retryScanning = () => {
    setError("")
    stopScanning()
    setTimeout(() => {
      startScanning()
    }, 100)
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative bg-black aspect-video flex items-center justify-center">
            {isScanning ? (
              <>
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted autoPlay />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border-2 border-white w-64 h-32 rounded-lg opacity-50">
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-white"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-white"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-white"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-white"></div>
                  </div>
                </div>
                <div className="absolute top-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded text-sm">
                  📱 Posicione o código de barras na área destacada
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded text-xs text-center">
                  Mantenha o código bem iluminado e focado
                </div>
              </>
            ) : (
              <div className="text-center text-white p-8">
                <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Scanner de Código de Barras</p>
                <p className="text-sm opacity-75">Clique em "Iniciar Scanner" para começar</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-start gap-3 text-red-700">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <span className="font-medium block">Erro no Scanner:</span>
                <span className="text-sm">{error}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-3">
        {!isScanning ? (
          <Button onClick={startScanning} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white" size="lg">
            <Camera className="w-5 h-5 mr-2" />
            Iniciar Scanner
          </Button>
        ) : (
          <Button
            onClick={stopScanning}
            variant="outline"
            className="flex-1 border-red-200 text-red-700 hover:bg-red-50 bg-transparent"
            size="lg"
          >
            <CameraOff className="w-5 h-5 mr-2" />
            Parar Scanner
          </Button>
        )}

        {error && (
          <Button onClick={retryScanning} variant="outline" size="lg">
            <RotateCcw className="w-5 h-5 mr-2" />
            Tentar Novamente
          </Button>
        )}
      </div>

      {isScanning && (
        <div className="text-center text-sm text-slate-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="font-medium text-blue-800 mb-1">💡 Dicas para melhor leitura:</p>
          <ul className="text-left space-y-1 max-w-md mx-auto">
            <li>• Mantenha o código bem iluminado</li>
            <li>• Evite reflexos e sombras</li>
            <li>• Mantenha a câmera estável</li>
            <li>• Posicione o código dentro da área destacada</li>
          </ul>
        </div>
      )}
    </div>
  )
}
