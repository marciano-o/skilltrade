"use client"

import type React from "react"

import { useState, useRef } from "react"
import Image from "next/image"
import { Camera, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ImageUploadProps {
  defaultImage?: string
  onImageSelect: (file: File) => void
  className?: string
}

export function ImageUpload({ defaultImage, onImageSelect, className = "" }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(defaultImage || null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith("image/")) {
        handleImageSelection(file)
      }
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImageSelection(e.target.files[0])
    }
  }

  const handleImageSelection = (file: File) => {
    // Create a preview URL
    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    onImageSelect(file)
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div
      className={`relative rounded-full overflow-hidden cursor-pointer transition-all duration-300 ${className} ${isDragging ? "ring-2 ring-primary" : ""}`}
      onClick={triggerFileInput}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleFileDrop}
    >
      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileInputChange} />

      {previewUrl ? (
        <>
          <Image src={previewUrl || "/placeholder.svg"} alt="Profile picture" fill className="object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
            <Camera className="h-8 w-8 text-white opacity-0 hover:opacity-100 transition-opacity duration-300" />
          </div>
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-1 right-1 h-6 w-6 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300"
            onClick={removeImage}
          >
            <X className="h-3 w-3" />
            <span className="sr-only">Remove image</span>
          </Button>
        </>
      ) : (
        <div className="w-full h-full bg-muted flex flex-col items-center justify-center">
          <Camera className="h-8 w-8 text-muted-foreground mb-1" />
          <span className="text-xs text-muted-foreground">Upload Photo</span>
        </div>
      )}
    </div>
  )
}
