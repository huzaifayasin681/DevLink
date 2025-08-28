"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LoadingSpinner } from "@/components/loading-spinner"
import { generateQRCode, downloadQRCode } from "@/lib/qr-code"
import { Download, QrCode, Share2 } from "lucide-react"
import toast from "react-hot-toast"

interface QRCodeGeneratorProps {
  profileUrl: string
  profileName: string
}

export function QRCodeGenerator({ profileUrl, profileName }: QRCodeGeneratorProps) {
  const [qrCodeDataURL, setQRCodeDataURL] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  const handleGenerateQR = async () => {
    setIsGenerating(true)
    try {
      const dataURL = await generateQRCode(profileUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      })
      setQRCodeDataURL(dataURL)
      setIsVisible(true)
      toast.success("QR code generated successfully!")
    } catch (error) {
      toast.error("Failed to generate QR code")
      console.error(error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (qrCodeDataURL) {
      downloadQRCode(qrCodeDataURL, `${profileName}-devlink-qr.png`)
      toast.success("QR code downloaded!")
    }
  }

  const handleShare = async () => {
    if (navigator.share && qrCodeDataURL) {
      try {
        // Convert data URL to blob
        const response = await fetch(qrCodeDataURL)
        const blob = await response.blob()
        const file = new File([blob], `${profileName}-devlink-qr.png`, { type: 'image/png' })
        
        await navigator.share({
          title: `${profileName}'s DevLink Profile`,
          text: `Check out ${profileName}'s developer profile on DevLink!`,
          url: profileUrl,
          files: [file]
        })
        toast.success("QR code shared!")
      } catch (error) {
        // Fallback to copying URL
        await navigator.clipboard.writeText(profileUrl)
        toast.success("Profile URL copied to clipboard!")
      }
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(profileUrl)
      toast.success("Profile URL copied to clipboard!")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Share Profile QR Code
        </CardTitle>
        <CardDescription>
          Generate a QR code for easy profile sharing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isVisible && (
          <Button 
            onClick={handleGenerateQR} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <QrCode className="h-4 w-4 mr-2" />
            )}
            {isGenerating ? "Generating..." : "Generate QR Code"}
          </Button>
        )}

        {isVisible && qrCodeDataURL && (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="p-4 bg-white rounded-lg shadow-sm">
                <Image
                  src={qrCodeDataURL}
                  alt={`QR Code for ${profileName}'s profile`}
                  width={200}
                  height={200}
                  className="rounded"
                />
              </div>
            </div>
            
            <div className="text-center text-sm text-muted-foreground">
              <p>Scan to visit {profileName}'s profile</p>
              <p className="font-mono text-xs mt-1">{profileUrl}</p>
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={handleDownload}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button 
                onClick={handleShare}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>

            <Button 
              onClick={() => setIsVisible(false)}
              variant="ghost"
              size="sm"
              className="w-full"
            >
              Hide QR Code
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}