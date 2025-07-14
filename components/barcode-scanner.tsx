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

  useEffect(() => {
    const reader = new BrowserMultiFormatReader()
    setCodeReader(reader)

    return () => {
      stopScanning()
      reader.reset()
    }
  }, [])

  const startScanning = async () => {
    if (!codeReader || !videoRef.current) return

    try {
      setError("")
      setIsScanning(true)

      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      }

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      setStream(mediaStream)

      videoRef.current.srcObject = mediaStream
      await videoRef.current.play()

      codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
        if (result) {
          const barcode = result.getText()
          onBarcodeScanned(barcode)
          stopScanning()
        }
      })
    } catch (err) {
      console.error("Erro ao iniciar scanner:", err)
      setError("Erro ao acessar a câmera. Verifique as permissões.")
      setIsScanning(false)
    }
  }

  const stopScanning = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop())
      setStream(null)
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    if (codeReader) {
      codeReader.reset()
    }

    setIsScanning(false)
  }

  const retryScanning = () => {
    setError("")
    startScanning()
  }

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative bg-black aspect-video flex items-center justify-center">
            {isScanning ? (
              <>
                <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border-2 border-white w-64 h-32 rounded-lg opacity-50"></div>
                </div>
                <div className="absolute top-4 left-4 bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                  Posicione o código de barras na área destacada
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
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="font-medium">Erro:</span>
              <span>{error}</span>
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
    </div>
  )
}
