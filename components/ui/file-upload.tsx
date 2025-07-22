"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, Check, FileIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileUploadProps {
  label: string
  description?: string
  accept?: string
  maxSize?: number // in MB
  onFileSelect: (file: File) => void
}

export function FileUpload({
  label,
  description,
  accept = "*/*",
  maxSize = 5, // Default 5MB
  onFileSelect,
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
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

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      setError(`File size exceeds ${maxSize}MB limit`)
      return false
    }

    // Check file type if accept is specified
    if (accept !== "*/*") {
      const fileType = file.type
      const acceptedTypes = accept.split(",").map((type) => type.trim())

      // If none of the accepted types match
      if (
        !acceptedTypes.some((type) => {
          // Handle wildcards like image/*
          if (type.endsWith("/*")) {
            const category = type.split("/")[0]
            return fileType.startsWith(`${category}/`)
          }
          return type === fileType
        })
      ) {
        setError(`File type not accepted. Please upload: ${accept}`)
        return false
      }
    }

    setError(null)
    return true
  }

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0]
      handleFileSelection(droppedFile)
    }
  }

  const handleFileSelection = (selectedFile: File) => {
    if (validateFile(selectedFile)) {
      setFile(selectedFile)
      onFileSelect(selectedFile)
      setSuccess(true)

      // Reset success message after 3 seconds
      setTimeout(() => {
        setSuccess(false)
      }, 3000)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelection(e.target.files[0])
    }
  }

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const removeFile = () => {
    setFile(null)
    setError(null)
    setSuccess(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-2">{label}</label>

      <div
        className={`file-upload-area ${isDragging ? "dragging" : ""} ${file ? "bg-muted/30" : ""}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleFileDrop}
        onClick={!file ? triggerFileInput : undefined}
      >
        <input type="file" ref={fileInputRef} className="hidden" accept={accept} onChange={handleFileInputChange} />

        {!file ? (
          <div className="flex flex-col items-center justify-center">
            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="font-medium">Drop your file here, or click to browse</p>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
            <p className="text-xs text-muted-foreground mt-2">Maximum file size: {maxSize}MB</p>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileIcon className="h-8 w-8 text-primary mr-3" />
              <div>
                <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation()
                removeFile()
              }}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove file</span>
            </Button>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-destructive mt-2 animate-fade-in">{error}</p>}

      {success && !error && (
        <p className="text-sm text-green-600 mt-2 flex items-center animate-fade-in">
          <Check className="h-4 w-4 mr-1" /> File uploaded successfully
        </p>
      )}
    </div>
  )
}
