"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star } from "lucide-react"
import { useAuth } from "./auth-context"

const reviewSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  rating: z.number().min(1).max(5),
  review: z.string().min(10, "Review must be at least 10 characters"),
  vehicle: z.string().min(1, "Please select a vehicle"),
  driver: z.string().min(2, "Driver name must be at least 2 characters"),
  tag: z.enum(["Individual", "Shared"])
})

type ReviewFormData = z.infer<typeof reviewSchema>

interface ReviewFormDialogProps {
  onSubmitReview: (review: any) => void
  trigger?: React.ReactNode
}

export function ReviewFormDialog({ onSubmitReview, trigger }: ReviewFormDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { isLoggedIn, user } = useAuth()

  const form = useForm<ReviewFormData>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      name: "",
      rating: 5,
      review: "",
      vehicle: "",
      driver: "",
      tag: "Individual"
    }
  })

  // Pre-fill user data if logged in
  useEffect(() => {
    if (user) {
      form.setValue("name", user.fullName)
    }
  }, [user, form])

  const onSubmit = async (data: ReviewFormData) => {
    setLoading(true)
    try {
      // Build payload — include form fields and user info where available
      const payload = {
        name: data.name,
        rating: data.rating,
        review: data.review,
        vehicle: data.vehicle,
        driver: data.driver,
        tag: data.tag,
        user: user
          ? {
              id: user.email || user.phone,
              phone: user.phone,
              email: user.email,
            }
          : undefined,
      }

      const base = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/+$/, '')
      const apiUrl = base.endsWith('/api') ? `${base}/reviews` : `${base}/api/reviews`

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      let saved: any
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        console.error('Failed to submit review', res.status, body)
        // Fallback to local UI record so the user can still see their review immediately.
        saved = {
          id: Date.now(),
          ...payload,
          createdAt: new Date()
        }
      } else {
        const json = await res.json().catch(() => null)
        saved = json && json.data ? json.data : {
          id: Date.now(),
          ...payload,
          createdAt: new Date()
        }
      }

      // Normalize for UI: build avatar, tagColor, date, helpful count
      const newReview = {
        ...saved,
        avatar: user?.phone ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.phone}` : "/placeholder.svg",
        date: new Date(saved.createdAt || Date.now()).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
        helpful: saved.helpful || 0,
        tagColor: saved.tag === "Individual" ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
      }

      onSubmitReview(newReview)
      form.reset()
      setOpen(false)
    } catch (err) {
      console.error('Submit review error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleTriggerClick = () => {
  
    setOpen(true)
  }

  const vehicles = [
    "Toyota Alphard",
    "Toyota Innova",
    "Toyota Innova Crysta",
    "Hyundai Starex",
    "Mercedes-Benz Sprinter"
  ]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild onClick={handleTriggerClick}>
        {trigger || <Button>Write a Review</Button>}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Write a Review</DialogTitle>
          <DialogDescription>
            Share your experience with our taxi service. Your feedback helps others choose the best ride.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rating</FormLabel>
                  <FormControl>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => field.onChange(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`h-6 w-6 ${
                              star <= field.value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vehicle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Used</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select vehicle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vehicles.map((vehicle) => (
                        <SelectItem key={vehicle} value={vehicle}>
                          {vehicle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="driver"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Driver Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter driver's name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tag"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ride Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ride type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Individual">Individual</SelectItem>
                      <SelectItem value="Shared">Share</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="review"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Review</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about your experience..."
                      className="resize-none"
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Review'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
