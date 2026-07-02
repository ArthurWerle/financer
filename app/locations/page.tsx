'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { useLocations } from '@/queries/locations/useLocations'
import { updateLocation } from '@/queries/locations/updateLocation'
import { deleteLocation } from '@/queries/locations/deleteLocation'
import { mergeLocations } from '@/queries/locations/mergeLocations'
import { MoreVertical, Pencil, Trash2, Merge } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Location } from '@/types/location'

function LocationItem({
  location,
  index,
}: {
  location: Location
  index: number
}) {
  const queryClient = useQueryClient()
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [name, setName] = useState(location.name)

  const handleDelete = async () => {
    setIsDeleting(true)
    await deleteLocation(location.id)
      .then(() => {
        toast.success('Location deleted')
        queryClient.invalidateQueries()
      })
      .catch((error) => {
        toast.error(`ERROR: ${error?.message || 'Error deleting location'}`)
      })
      .finally(() => {
        setIsDeleting(false)
      })
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    await updateLocation(location.id, { name })
      .then(() => {
        toast.success('Location updated')
        queryClient.invalidateQueries()
        setIsEditOpen(false)
      })
      .catch((error) => {
        toast.error(`ERROR: ${error?.message || 'Error updating location'}`)
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  const handleEditOpen = () => {
    setName(location.name)
    setIsEditOpen(true)
  }

  return (
    <>
      <motion.div
        key={location.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05 }}
      >
        <div className="flex justify-between items-center mb-2">
          <p className="font-medium">{location.name}</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                disabled={isDeleting}
              >
                <MoreVertical className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleEditOpen}>
                <Pencil className="h-4 w-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </motion.div>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Rename Location</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor={`location-name-${location.id}`}>Name</Label>
              <Input
                id={`location-name-${location.id}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

function MergeLocations({ locations }: { locations: Location[] }) {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sourceId, setSourceId] = useState<number | undefined>()
  const [targetId, setTargetId] = useState<number | undefined>()

  const handleMerge = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!sourceId || !targetId || sourceId === targetId) return
    setIsSubmitting(true)

    await mergeLocations(sourceId, targetId)
      .then(() => {
        toast.success('Locations merged')
        queryClient.invalidateQueries()
        setIsOpen(false)
        setSourceId(undefined)
        setTargetId(undefined)
      })
      .catch((error) => {
        toast.error(`ERROR: ${error?.message || 'Error merging locations'}`)
      })
      .finally(() => {
        setIsSubmitting(false)
      })
  }

  return (
    <>
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        <Merge className="h-4 w-4" />
        Merge duplicates
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Merge Locations</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleMerge} className="space-y-4">
            <p className="text-sm text-gray-500">
              All transactions from the first location move to the second, then
              the first is removed.
            </p>
            <div className="grid gap-2">
              <Label>Merge this location</Label>
              <Select
                value={sourceId ? String(sourceId) : ''}
                onValueChange={(value) => setSourceId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location to remove" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={String(location.id)}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Into this location</Label>
              <Select
                value={targetId ? String(targetId) : ''}
                onValueChange={(value) => setTargetId(Number(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location to keep" />
                </SelectTrigger>
                <SelectContent>
                  {locations
                    .filter((location) => location.id !== sourceId)
                    .map((location) => (
                      <SelectItem key={location.id} value={String(location.id)}>
                        {location.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={
                isSubmitting || !sourceId || !targetId || sourceId === targetId
              }
            >
              {isSubmitting ? 'Merging...' : 'Merge'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default function Locations() {
  const { data: locations = [], isLoading } = useLocations()

  return (
    <div>
      <h1 className="text-3xl sm:text-4xl font-bold mb-6 sm:mb-8">
        Locations
      </h1>
      <Card className="p-4 sm:p-6 bg-gradient-to-br from-gray-50 to-white shadow-lg rounded-2xl">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-6">
          <h2 className="text-2xl font-bold">Places</h2>
          {locations.length > 1 && <MergeLocations locations={locations} />}
        </div>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : locations.length === 0 ? (
          <p className="text-sm text-gray-500">
            No locations yet. They are created automatically when you add a
            place to a transaction.
          </p>
        ) : (
          <div className="space-y-4">
            {locations.map((location, index) => (
              <LocationItem
                key={location.id}
                location={location}
                index={index}
              />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
