"use client"

import { Button } from "@/components/ui/button"
import { ArrowLeft, Star, User } from "lucide-react"

interface UserProfilePageProps {
  onBackToHome: () => void
}

export function UserProfilePage({ onBackToHome }: UserProfilePageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back to Home */}
      <div className="pt-6 px-6">
        <Button
          variant="ghost"
          onClick={onBackToHome}
          className="text-gray-600 hover:text-gray-800 p-0 h-auto font-normal"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Profile Icon Header */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center gap-4">
            <User className="h-12 w-12 text-gray-600" />
            <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          </div>
        </div>

        {/* Upcoming Booking */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Booking</h2>

          <div className="space-y-4">
            {/* Individual Ride */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-sm font-medium">individual</span>
                <span className="text-sm text-gray-500">2024-12-18</span>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Downtown Plaza</span>
                  </div>
                  <div className="text-gray-400">→</div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="font-medium">Airport Terminal 1</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">LKR</div>
                  <div className="font-bold">2000.00</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Toyota Alphard • Driver: Michael Chen</div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                    10 min
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-500 border-red-200 hover:bg-red-50 bg-transparent"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>

            {/* Shared Ride */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm font-medium">shared</span>
                <span className="text-sm text-gray-500">2024-12-15</span>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Business District</span>
                  </div>
                  <div className="text-gray-400">→</div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="font-medium">Shopping Mall</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">LKR</div>
                  <div className="font-bold">2000.00</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Hyundai Starex • Driver: Sarah Wilson</div>
                <div className="flex gap-2">
                  <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                    Yesterday
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-500 border-red-200 hover:bg-red-50 bg-transparent"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ride History */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ride History</h2>

          <div className="space-y-4">
            {/* Individual Ride History */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-sm font-medium">individual</span>
                <span className="text-sm text-gray-500">2024-12-18</span>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Downtown Plaza</span>
                  </div>
                  <div className="text-gray-400">→</div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="font-medium">Airport Terminal 1</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">LKR</div>
                  <div className="font-bold">2000.00</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Toyota Alphard • Driver: Michael Chen</div>
                <Button size="sm" className="bg-yellow-400 hover:bg-yellow-500 text-black">
                  Write Reviews
                </Button>
              </div>
            </div>

            {/* Shared Ride History with Rating */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-sm font-medium">shared</span>
                <span className="text-sm text-gray-500">2024-12-15</span>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Business District</span>
                  </div>
                  <div className="text-gray-400">→</div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="font-medium">Shopping Mall</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">LKR</div>
                  <div className="font-bold">2000.00</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Hyundai Starex • Driver: Sarah Wilson</div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4].map((star) => (
                      <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                    <Star className="h-4 w-4 text-gray-300" />
                  </div>
                  <span className="text-sm text-gray-500">Your Rating</span>
                </div>
              </div>
            </div>

            {/* Individual Ride History with Full Rating */}
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="bg-purple-100 text-purple-600 px-2 py-1 rounded text-sm font-medium">individual</span>
                <span className="text-sm text-gray-500">2024-12-12</span>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium">University Campus</span>
                  </div>
                  <div className="text-gray-400">→</div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="font-medium">City Center</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">LKR</div>
                  <div className="font-bold">2000.00</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">Toyota Innova • Driver: David Kim</div>
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">Your Rating</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <Button variant="link" className="text-blue-600 hover:text-blue-700">
              View All Rides
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
