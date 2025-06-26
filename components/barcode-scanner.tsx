"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Camera, CameraOff, AlertCircle, ScanLine } from "lucide-react"

interface BarcodeScannerProps {
  onBarcodeScanned: (barcode: string) => void
}

export function BarcodeScanner({ onBarcodeScanned }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string>("")
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [codeReader, setCodeReader] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Carregar ZXing
  useEffect(() => {
    let mounted = true

    const loadZXing = async () => {
      try {
        console.log("🔄 Carregando ZXing...")
        const { BrowserMultiFormatReader } = await import("@zxing/library")

        if (mounted) {
          const reader = new BrowserMultiFormatReader()
          setCodeReader(reader)
          console.log("✅ ZXing carregado com sucesso")
        }
      } catch (err) {
        console.error("❌ Erro ao carregar ZXing:", err)
        if (mounted) {
          setError("Erro ao carregar o scanner. Recarregue a página.")
        }
      }
    }

    loadZXing()

    return () => {
      mounted = false
    }
  }, [])

  // Função para parar câmera
  const stopCamera = () => {
    console.log("🛑 Parando câmera...")

    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop()
        console.log(`Track ${track.kind} parado`)
      })
      setStream(null)
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null
    }

    setIsScanning(false)
    setIsLoading(false)
    setError("")
  }

  // Função para iniciar câmera e scanner
  const startCamera = async () => {
    if (!codeReader) {
      setError("Scanner ainda não está pronto. Aguarde...")
      return
    }

    try {
      setError("")
      setIsLoading(true)
      console.log("🎥 Iniciando câmera...")

      // Parar qualquer stream anterior
      stopCamera()

      // Configurações da câmera
      const constraints = {
        video: {
          facingMode: "environment",
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      }

      // Obter stream da câmera
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log("✅ Stream da câmera obtido")

      if (!videoRef.current) {
        mediaStream.getTracks().forEach((track) => track.stop())
        throw new Error("Elemento de vídeo não encontrado")
      }

      // Configurar vídeo
      videoRef.current.srcObject = mediaStream
      setStream(mediaStream)

      // Aguardar vídeo carregar
      await new Promise<void>((resolve, reject) => {
        const video = videoRef.current!

        const onLoaded = () => {
          video.removeEventListener("loadedmetadata", onLoaded)
          video.removeEventListener("error", onError)
          resolve()
        }

        const onError = () => {
          video.removeEventListener("loadedmetadata", onLoaded)
          video.removeEventListener("error", onError)
          reject(new Error("Erro ao carregar vídeo"))
        }

        video.addEventListener("loadedmetadata", onLoaded)
        video.addEventListener("error", onError)

        video.play().catch(reject)
      })

      console.log("✅ Vídeo carregado, iniciando detecção...")
      setIsLoading(false)
      setIsScanning(true)

      // Iniciar detecção
      startDetection()
    } catch (err: any) {
      console.error("❌ Erro ao iniciar câmera:", err)
      setIsLoading(false)

      if (err.name === "NotAllowedError") {
        setError("Permissão de câmera negada. Permita o acesso e tente novamente.")
      } else if (err.name === "NotFoundError") {
        setError("Câmera não encontrada no dispositivo.")
      } else {
        setError(`Erro: ${err.message}`)
      }
    }
  }

  // Função de detecção
  const startDetection = async () => {
    if (!codeReader || !videoRef.current) return

    try {
      console.log("🔍 Iniciando detecção contínua...")

      await codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result: any, error: any) => {
        if (result) {
          console.log("🎯 Código detectado:", result.text)

          // Vibração
          if ("vibrate" in navigator) {
            navigator.vibrate([100, 50, 100])
          }

          // Parar detecção
          codeReader.reset()

          // Callback
          onBarcodeScanned(result.text)

          // Parar câmera
          stopCamera()
        }

        if (error && error.name !== "NotFoundException") {
          console.error("Erro na detecção:", error)
        }
      })
    } catch (err) {
      console.error("❌ Erro na detecção:", err)
      setError("Erro na detecção de códigos. Tente reiniciar o scanner.")
    }
  }

  // Cleanup
  useEffect(() => {
    return () => {
      if (codeReader) {
        codeReader.reset()
      }
      stopCamera()
    }
  }, [codeReader])

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="relative bg-slate-900 rounded-lg overflow-hidden shadow-lg" style={{ aspectRatio: "4/3" }}>
        {/* Vídeo */}
        <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />

        {/* Overlay quando escaneando */}
        {isScanning && (
          <div className="absolute inset-0">
            {/* Área de foco */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                {/* Retângulo de foco */}
                <div className="border-2 border-blue-500 bg-blue-500/20 rounded-lg w-80 h-36 flex items-center justify-center backdrop-blur-sm">
                  <div className="text-center text-blue-100">
                    <ScanLine className="w-6 h-6 mx-auto mb-2 animate-pulse" />
                    <span className="text-sm font-medium">Posicione o código aqui</span>
                  </div>
                </div>

                {/* Cantos */}
                <div className="absolute -top-2 -left-2 w-6 h-6 border-l-3 border-t-3 border-blue-500"></div>
                <div className="absolute -top-2 -right-2 w-6 h-6 border-r-3 border-t-3 border-blue-500"></div>
                <div className="absolute -bottom-2 -left-2 w-6 h-6 border-l-3 border-b-3 border-blue-500"></div>
                <div className="absolute -bottom-2 -right-2 w-6 h-6 border-r-3 border-b-3 border-blue-500"></div>

                {/* Linha de scan */}
                <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-500 animate-pulse"></div>
              </div>
            </div>

            {/* Status */}
            <div className="absolute top-4 left-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                Escaneando...
              </div>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90 text-white">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-white border-t-transparent rounded-full mx-auto mb-3"></div>
              <p className="text-lg font-medium">Iniciando Câmera</p>
              <p className="text-sm opacity-75 mt-1">Preparando scanner...</p>
            </div>
          </div>
        )}

        {/* Estado inicial */}
        {!isScanning && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center text-white">
            <div className="text-center">
              <div className="bg-white/10 rounded-full p-4 mb-4 mx-auto w-fit">
                <Camera className="w-10 h-10 opacity-75" />
              </div>
              <p className="text-lg font-medium">Scanner Desligado</p>
              <p className="text-sm opacity-75 mt-1">Toque para iniciar</p>
            </div>
          </div>
        )}
      </div>

      {/* Controles */}
      <div className="flex justify-center">
        {!isScanning && !isLoading ? (
          <Button
            onClick={startCamera}
            disabled={!codeReader}
            className="flex items-center gap-2 px-8 py-3 text-base font-medium bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <Camera className="w-5 h-5" />
            {codeReader ? "Iniciar Scanner" : "Carregando Scanner..."}
          </Button>
        ) : (
          <Button
            onClick={stopCamera}
            variant="destructive"
            className="flex items-center gap-2 px-8 py-3 text-base font-medium"
            size="lg"
          >
            <CameraOff className="w-5 h-5" />
            Parar Scanner
          </Button>
        )}
      </div>

      {/* Info */}
      <div className="text-center text-slate-600 space-y-3">
        
        <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg">
          <p className="font-medium text-slate-700 mb-2">📋 Instruções de Uso:</p>
          <div className="text-sm space-y-1 text-left">
            
            <p>• Posicione dentro da área azul destacada</p>
            <p>• Mantenha o dispositivo estável durante o scan</p>
            <p>• Compatível com EAN-13, EAN-8, UPC, Code 128 e Code 39</p>
          </div>
        </div>
      </div>
    </div>
  )
}
