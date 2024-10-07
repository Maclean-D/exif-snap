"use client"

import { useState, useRef } from "react"
import { Button } from "~/components/ui/button"
import { Card, CardContent, CardFooter } from "~/components/ui/card"
import { Calendar } from "~/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover"
import { Calendar as CalendarIcon, RotateCw, RotateCcw, Trash2, Upload, Info, Zap, Maximize2, Download } from "lucide-react"
import { format, parse, set } from "date-fns"
import { cn } from "~/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { roundToNearestMinutes } from "date-fns"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "~/components/ui/dialog"
import exifr from 'exifr'
import JSZip from 'jszip'
import { saveAs } from 'file-saver'
import { piexif } from 'piexifjs'
import { Buffer } from 'buffer'
import { X } from "lucide-react"
import { ThemeToggle } from "~/components/ThemeToggle"

type ImageData = {
  id: string
  src: string
  rotation: number
  name: string
  metadata: Record<string, any>
}

const rotateImageAndPreserveExif = async (imageData: string, rotation: number): Promise<string> => {
  const exifObj = piexif.load(imageData)
  
  // Create a new image with the rotation applied
  const img = new Image()
  await new Promise((resolve) => {
    img.onload = resolve
    img.src = imageData
  })

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!
  
  if (rotation % 180 === 90) {
    canvas.width = img.height
    canvas.height = img.width
  } else {
    canvas.width = img.width
    canvas.height = img.height
  }

  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate((rotation * Math.PI) / 180)
  ctx.drawImage(img, -img.width / 2, -img.height / 2)

  // Convert canvas to JPEG with maximum quality
  const rotatedJpeg = canvas.toDataURL('image/jpeg', 1.0)

  // Re-insert the original EXIF data into the rotated image
  return piexif.insert(piexif.dump(exifObj), rotatedJpeg)
}

const updateExifDateTime = (imageData: string, newDateTime: Date): string => {
  const exifObj = piexif.load(imageData)
  const newDateTimeString = format(newDateTime, "yyyy:MM:dd HH:mm:ss")
  
  // Update all relevant date/time fields
  if (exifObj['0th'] && piexif.ImageIFD.DateTime !== undefined) {
    exifObj['0th'][piexif.ImageIFD.DateTime] = newDateTimeString
  }
  
  if (exifObj['Exif']) {
    if (piexif.ExifIFD.DateTimeOriginal !== undefined) {
      exifObj['Exif'][piexif.ExifIFD.DateTimeOriginal] = newDateTimeString
    }
    if (piexif.ExifIFD.DateTimeDigitized !== undefined) {
      exifObj['Exif'][piexif.ExifIFD.DateTimeDigitized] = newDateTimeString
    }
    // Update SubSecTime fields if they exist
    if (piexif.ExifIFD.SubSecTime !== undefined) {
      exifObj['Exif'][piexif.ExifIFD.SubSecTime] = "00"
    }
    if (piexif.ExifIFD.SubSecTimeOriginal !== undefined) {
      exifObj['Exif'][piexif.ExifIFD.SubSecTimeOriginal] = "00"
    }
    if (piexif.ExifIFD.SubSecTimeDigitized !== undefined) {
      exifObj['Exif'][piexif.ExifIFD.SubSecTimeDigitized] = "00"
    }
  }
  
  // Update GPS date/time if it exists
  if (exifObj['GPS']) {
    if (piexif.GPSIFD.GPSDateStamp !== undefined) {
      exifObj['GPS'][piexif.GPSIFD.GPSDateStamp] = format(newDateTime, "yyyy:MM:dd")
    }
    if (piexif.GPSIFD.GPSTimeStamp !== undefined) {
      const hours = newDateTime.getUTCHours()
      const minutes = newDateTime.getUTCMinutes()
      const seconds = newDateTime.getUTCSeconds()
      exifObj['GPS'][piexif.GPSIFD.GPSTimeStamp] = [[hours, 1], [minutes, 1], [seconds, 1]]
    }
  }
  
  // Re-insert the updated EXIF data
  return piexif.insert(piexif.dump(exifObj), imageData)
}

export default function ExifSnap() {
  const [selectedDateTime, setSelectedDateTime] = useState<Date>(() => {
    const now = new Date()
    return roundToNearestMinutes(now, { nearestTo: 15 })
  })
  const [images, setImages] = useState<ImageData[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const newDateTime = selectedDateTime
        ? set(selectedDateTime, {
            year: date.getFullYear(),
            month: date.getMonth(),
            date: date.getDate(),
          })
        : set(date, { hours: 12, minutes: 0 })
      setSelectedDateTime(newDateTime)
    }
  }

  const handleTimeSelect = (timeString: string) => {
    if (selectedDateTime) {
      const time = parse(timeString, "h:mm a", new Date())
      const newDateTime = set(selectedDateTime, {
        hours: time.getHours(),
        minutes: time.getMinutes(),
      })
      setSelectedDateTime(newDateTime)
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      for (const file of Array.from(files)) {
        const reader = new FileReader()
        reader.onload = async (e) => {
          const img = new Image()
          img.onload = async () => {
            try {
              const metadata = await exifr.parse(file)
              const newImage: ImageData = {
                id: Math.random().toString(36).substr(2, 9),
                src: e.target?.result as string,
                rotation: 0,
                name: file.name,
                metadata: metadata || {}
              }
              setImages((prevImages) => [...prevImages, newImage])
            } catch (error) {
              console.error("Error parsing EXIF data:", error)
              // Add the image without metadata if there's an error
              const newImage: ImageData = {
                id: Math.random().toString(36).substr(2, 9),
                src: e.target?.result as string,
                rotation: 0,
                name: file.name,
                metadata: {}
              }
              setImages((prevImages) => [...prevImages, newImage])
            }
          }
          img.src = e.target?.result as string
        }
        reader.readAsDataURL(file)
      }
    }
  }

  // Add this helper function to check if flash was used
  const flashWasUsed = (metadata: Record<string, any>) => {
    const flashValue = metadata.Flash;
    return typeof flashValue === 'string' && flashValue.toLowerCase().includes('fired');
  }

  const handleDelete = (id: string) => {
    setImages((prevImages) => prevImages.filter((img) => img.id !== id))
  }

  const handleRotate = (id: string, direction: 'clockwise' | 'counterclockwise') => {
    setImages((prevImages) =>
      prevImages.map((img) =>
        img.id === id
          ? {
              ...img,
              rotation: direction === 'clockwise'
                ? (img.rotation + 90) % 360
                : (img.rotation - 90 + 360) % 360,
            }
          : img
      )
    )
  }

  const timeOptions = Array.from({ length: 24 * 4 }, (_, i) => {
    const date = set(new Date(), { hours: Math.floor(i / 4), minutes: (i % 4) * 15 })
    return format(date, "h:mm a")
  })

  const getCurrentTimeString = () => {
    return format(selectedDateTime, "h:mm a")
  }

  // Add this helper function to remove file extension
  const removeFileExtension = (filename: string) => {
    return filename.split('.').slice(0, -1).join('.')
  }

  const handleDownloadAll = async () => {
    const zip = new JSZip()
    for (const image of images) {
      const rotatedImage = await rotateImageAndPreserveExif(image.src, image.rotation)
      const updatedImage = updateExifDateTime(rotatedImage, selectedDateTime)
      const base64Data = updatedImage.split(',')[1]
      if (base64Data) {
        const imageBuffer = Buffer.from(base64Data, 'base64')
        zip.file(image.name, imageBuffer, {binary: true})
      } else {
        console.error(`Failed to process image: ${image.name}`)
      }
    }
    const content = await zip.generateAsync({ type: 'blob' })
    saveAs(content, 'exif-snap-images.zip')
  }

  const handleDownloadSingle = async (image: ImageData) => {
    const rotatedImage = await rotateImageAndPreserveExif(image.src, image.rotation)
    const updatedImage = updateExifDateTime(rotatedImage, selectedDateTime)
    const base64Data = updatedImage.split(',')[1]
    if (base64Data) {
      const imageBuffer = Buffer.from(base64Data, 'base64')
      const blob = new Blob([imageBuffer], {type: 'image/jpeg'})
      saveAs(blob, image.name)
    } else {
      console.error(`Failed to process image: ${image.name}`)
    }
  }

  return (
    <div className="container mx-auto p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <h1 className="text-3xl font-bold mb-6">exif-snap</h1>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleUpload}
              multiple
              accept="image/*"
            />
            <Button onClick={handleUploadClick} variant="default">
              <Upload className="mr-2 h-4 w-4" />
              Upload Images
            </Button>
          </div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-[280px] justify-start text-left font-normal",
                  !selectedDateTime && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDateTime, "PPP p")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDateTime}
                onSelect={handleDateSelect}
                initialFocus
              />
              <div className="p-3 border-t border-border">
                <Select onValueChange={handleTimeSelect} value={getCurrentTimeString()}>
                  <SelectTrigger>
                    <SelectValue>{getCurrentTimeString()}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {timeOptions.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <Button onClick={handleDownloadAll} disabled={images.length === 0} variant="default">
          <Download className="mr-2 h-4 w-4" />
          Download All
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {images.map((image) => (
          <Card key={image.id} className="overflow-hidden group">
            <CardContent className="p-0">
              <div className="relative pt-[100%]">
                <img
                  src={image.src}
                  alt={image.name}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    transform: `rotate(${image.rotation}deg)`,
                    transition: "transform 0.3s ease",
                  }}
                />
                {flashWasUsed(image.metadata) && (
                  <div className="absolute top-2 right-2 bg-yellow-400 rounded-full p-1">
                    <Zap className="h-4 w-4 text-white" />
                  </div>
                )}
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Maximize2 className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[90vw] max-h-[90vh] w-[90vw] h-[90vw] sm:w-[80vw] sm:h-[80vw] md:w-[70vw] md:h-[70vw] lg:w-[60vw] lg:h-[60vw] xl:w-[50vw] xl:h-[50vw] p-8">
                    <div className="relative w-full h-full flex items-center justify-center bg-black/10 rounded-lg overflow-hidden">
                      <img
                        src={image.src}
                        alt={image.name}
                        className="max-w-full max-h-full object-contain"
                        style={{
                          transform: `rotate(${image.rotation}deg)`,
                        }}
                      />
                    </div>
                    <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                      <X className="h-4 w-4" />
                      <span className="sr-only">Close</span>
                    </DialogClose>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between p-2 items-center">
              <div className="truncate max-w-[50%]" title={image.name}>
                {removeFileExtension(image.name)}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDownloadSingle(image)}
                  className="hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Info className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[400px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>Image Metadata</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">
                      {Object.entries(image.metadata).map(([key, value]) => (
                        <div key={key} className="mb-2">
                          <strong>{key}:</strong> {JSON.stringify(value)}
                        </div>
                      ))}
                    </div>
                  </DialogContent>
                </Dialog>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleRotate(image.id, 'counterclockwise')}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleRotate(image.id, 'clockwise')}
                >
                  <RotateCw className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleDelete(image.id)}
                  className="hover:bg-red-500 hover:text-white transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}