"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Camera, Upload, X, RotateCcw, Check, AlertCircle } from "lucide-react"

interface PhotoCaptureProps {
  onPhotoCapture: (photo: string) => void
  currentPhoto?: string
}

export function PhotoCapture({ onPhotoCapture, currentPhoto }: PhotoCaptureProps) {
  const [isCapturing, setIsCapturing] = useState(false)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [capturedPhoto, setCapturedPhoto] = useState<string>(currentPhoto || "")
  const [showPreview, setShowPreview] = useState(false)
  const [error, setError] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sincronizar com a prop currentPhoto
  useEffect(() => {
    setCapturedPhoto(currentPhoto || "")
  }, [currentPhoto])

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [stream])

  const startCamera = async () => {
    try {
      setError("")
      setIsLoading(true)
      console.log("🎥 Tentando iniciar câmera...")

      // Verificar se getUserMedia está disponível
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Câmera não suportada neste navegador")
      }

      // Parar stream anterior se existir
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
        setStream(null)
      }

      // Aguardar um pouco para garantir que o DOM foi atualizado
      await new Promise((resolve) => setTimeout(resolve, 100))

      // Verificar se o elemento de vídeo existe
      if (!videoRef.current) {
        console.error("❌ Elemento de vídeo não encontrado")
        throw new Error("Elemento de vídeo não encontrado. Tente novamente.")
      }

      // Configurações da câmera
      const constraints = {
        video: {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
        },
        audio: false,
      }

      console.log("📱 Solicitando acesso à câmera...")
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      console.log("✅ Stream da câmera obtido:", mediaStream.getVideoTracks().length, "tracks")

      // Verificar novamente se o elemento existe após obter o stream
      if (!videoRef.current) {
        mediaStream.getTracks().forEach((track) => track.stop())
        throw new Error("Elemento de vídeo perdido durante inicialização")
      }

      // Configurar vídeo
      const video = videoRef.current
      video.srcObject = mediaStream
      setStream(mediaStream)

      // Aguardar o vídeo carregar
      await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error("Timeout ao carregar vídeo"))
        }, 10000)

        const onLoadedMetadata = () => {
          clearTimeout(timeoutId)
          video.removeEventListener("loadedmetadata", onLoadedMetadata)
          video.removeEventListener("error", onError)
          console.log("✅ Vídeo carregado:", video.videoWidth, "x", video.videoHeight)
          resolve()
        }

        const onError = (e: any) => {
          clearTimeout(timeoutId)
          video.removeEventListener("loadedmetadata", onLoadedMetadata)
          video.removeEventListener("error", onError)
          console.error("❌ Erro no vídeo:", e)
          reject(new Error("Erro ao carregar vídeo"))
        }

        video.addEventListener("loadedmetadata", onLoadedMetadata)
        video.addEventListener("error", onError)

        // Tentar reproduzir o vídeo
        video
          .play()
          .then(() => {
            console.log("▶️ Vídeo reproduzindo")
          })
          .catch((playError) => {
            console.error("❌ Erro ao reproduzir vídeo:", playError)
            reject(playError)
          })
      })

      setIsCapturing(true)
      setIsLoading(false)
      setShowPreview(false)
      console.log("🎉 Câmera iniciada com sucesso!")
    } catch (err: any) {
      console.error("❌ Erro ao iniciar câmera:", err)
      setIsLoading(false)

      let errorMessage = "Erro desconhecido ao acessar câmera"

      if (err.name === "NotAllowedError") {
        errorMessage = "Permissão de câmera negada. Permita o acesso nas configurações do navegador."
      } else if (err.name === "NotFoundError") {
        errorMessage = "Nenhuma câmera encontrada no dispositivo."
      } else if (err.name === "NotSupportedError") {
        errorMessage = "Câmera não suportada neste navegador."
      } else if (err.name === "NotReadableError") {
        errorMessage = "Câmera está sendo usada por outro aplicativo."
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
    }
  }

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

    setIsCapturing(false)
    setError("")
  }

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError("Erro: elementos de vídeo ou canvas não encontrados")
      return
    }

    try {
      const video = videoRef.current
      const canvas = canvasRef.current
      const context = canvas.getContext("2d")

      if (!context) {
        setError("Erro: não foi possível obter contexto do canvas")
        return
      }

      // Verificar se o vídeo tem dimensões válidas
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setError("Erro: vídeo não carregado completamente")
        return
      }

      console.log("📸 Capturando foto:", video.videoWidth, "x", video.videoHeight)

      // Configurar canvas com as dimensões do vídeo
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Desenhar frame do vídeo no canvas (sem espelhar na captura)
      context.drawImage(video, 0, 0, canvas.width, canvas.height)

      // Converter para base64
      const photoData = canvas.toDataURL("image/jpeg", 0.85)

      if (photoData === "data:,") {
        setError("Erro: falha ao capturar imagem")
        return
      }

      console.log("✅ Foto capturada com sucesso, tamanho:", Math.round(photoData.length / 1024), "KB")

      setCapturedPhoto(photoData)
      setShowPreview(true)
      stopCamera()
    } catch (err: any) {
      console.error("❌ Erro ao capturar foto:", err)
      setError("Erro ao capturar foto: " + err.message)
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Verificar tamanho do arquivo (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Arquivo muito grande. Máximo 5MB.")
      return
    }

    // Verificar tipo do arquivo
    if (!file.type.startsWith("image/")) {
      setError("Por favor, selecione apenas arquivos de imagem.")
      return
    }

    setError("")
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result) {
        console.log("📁 Arquivo carregado:", Math.round(result.length / 1024), "KB")
        setCapturedPhoto(result)
        setShowPreview(true)
      }
    }
    reader.onerror = () => {
      setError("Erro ao carregar arquivo")
    }
    reader.readAsDataURL(file)
  }

  const confirmPhoto = () => {
    console.log("✅ Confirmando foto:", capturedPhoto ? "Foto presente" : "Sem foto")
    onPhotoCapture(capturedPhoto)
    setShowPreview(false)
  }

  const removePhoto = () => {
    console.log("🗑️ Removendo foto")
    setCapturedPhoto("")
    onPhotoCapture("")
    setShowPreview(false)
  }

  const retakePhoto = () => {
    console.log("🔄 Refazendo foto")
    setCapturedPhoto("")
    setShowPreview(false)
    // Aguardar um pouco antes de iniciar a câmera novamente
    setTimeout(() => {
      startCamera()
    }, 100)
  }

  const cancelPreview = () => {
    setShowPreview(false)
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-medium text-slate-700 mb-2">Foto do Produto</h3>
        <p className="text-sm text-slate-500">Adicione uma foto para facilitar a identificação</p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Erro na Câmera</span>
          </div>
          <p className="text-sm text-red-700 mt-1">{error}</p>
          <Button
            onClick={() => setError("")}
            variant="outline"
            size="sm"
            className="mt-2 text-red-700 border-red-300 hover:bg-red-50"
          >
            Tentar Novamente
          </Button>
        </div>
      )}

      {/* Photo Preview Mode */}
      {showPreview && capturedPhoto && (
        <Card className="overflow-hidden border-2 border-blue-200">
          <CardContent className="p-0">
            <div className="relative">
              <img
                src={capturedPhoto || "/placeholder.svg"}
                alt="Preview da foto"
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                Preview
              </div>
            </div>
            <div className="p-4 bg-blue-50 border-t">
              <p className="text-sm text-blue-800 mb-3 text-center font-medium">
                Gostou da foto? Confirme para salvar ou tire outra.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={confirmPhoto}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  Confirmar e Salvar
                </Button>
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  className="flex items-center justify-center gap-2 border-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Refazer
                </Button>
                <Button onClick={cancelPreview} variant="ghost" className="text-slate-600 hover:text-slate-800">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Saved Photo Display */}
      {!showPreview && capturedPhoto && (
        <Card className="overflow-hidden border-2 border-green-200">
          <CardContent className="p-0">
            <div className="relative">
              <img
                src={capturedPhoto || "/placeholder.svg"}
                alt="Foto do produto"
                className="w-full h-48 object-cover"
              />
              <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                <Check className="w-3 h-3" />
                Foto Salva
              </div>
              <div className="absolute top-2 right-2 flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={retakePhoto}
                  className="bg-white/90 hover:bg-white text-slate-700"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={removePhoto}
                  className="bg-red-500/90 hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card className="overflow-hidden border-2 border-blue-200">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-lg font-medium text-slate-700">Iniciando Câmera...</p>
              <p className="text-sm text-slate-500 mt-1">Aguarde enquanto acessamos sua câmera</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Camera View - Só renderiza quando está capturando */}
      {isCapturing && !isLoading && (
        <Card className="overflow-hidden border-2 border-blue-400">
          <CardContent className="p-0">
            <div className="relative bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-80 object-cover"
                style={{ transform: "scaleX(-1)" }}
              />

              {/* Camera overlay */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Grid lines for better composition */}
                <div className="absolute inset-4 border border-white/30">
                  <div className="absolute top-1/3 left-0 right-0 border-t border-white/20"></div>
                  <div className="absolute top-2/3 left-0 right-0 border-t border-white/20"></div>
                  <div className="absolute left-1/3 top-0 bottom-0 border-l border-white/20"></div>
                  <div className="absolute left-2/3 top-0 bottom-0 border-l border-white/20"></div>
                </div>

                {/* Focus area */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="border-2 border-blue-400 bg-blue-400/10 rounded-lg w-64 h-48 flex items-center justify-center">
                    <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded">
                      Posicione o produto aqui
                    </span>
                  </div>
                </div>
              </div>

              {/* Camera controls */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={stopCamera}
                    size="lg"
                    variant="secondary"
                    className="bg-white/90 hover:bg-white text-slate-700 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                  <Button
                    onClick={capturePhoto}
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-20 h-20 shadow-lg"
                  >
                    <Camera className="w-8 h-8" />
                  </Button>
                  <div className="w-12 h-12"></div>
                </div>
              </div>

              {/* Instructions */}
              <div className="absolute top-4 left-4 right-4">
                <div className="bg-black/70 text-white p-3 rounded-lg text-center">
                  <p className="text-sm font-medium">📸 Posicione o produto na área destacada</p>
                  <p className="text-xs opacity-75 mt-1">Toque no botão azul quando estiver pronto</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      {!capturedPhoto && !isCapturing && !showPreview && !isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Button
            onClick={startCamera}
            className="flex items-center justify-center gap-2 py-4 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium"
            size="lg"
          >
            <Camera className="w-5 h-5" />
            Abrir Câmera
          </Button>
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="flex items-center justify-center gap-2 py-4 border-2 text-base font-medium"
            size="lg"
          >
            <Upload className="w-5 h-5" />
            Escolher Arquivo
          </Button>
        </div>
      )}

      {/* Hidden elements - sempre presentes no DOM */}
      <div style={{ display: "none" }}>
        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} />
        <canvas ref={canvasRef} />
      </div>

      {/* Info */}
      <div className="text-center text-xs text-slate-500 bg-slate-50 p-3 rounded-lg border">
        <p className="font-medium text-slate-600 mb-1">📸 Dicas para melhor foto:</p>
        <div className="space-y-1">
          <p>• Use boa iluminação natural ou artificial</p>
          <p>• Posicione o produto no centro da área destacada</p>
          <p>• Mantenha a câmera estável ao capturar</p>
          <p>• Máximo 5MB por arquivo</p>
        </div>
      </div>
    </div>
  )
}
