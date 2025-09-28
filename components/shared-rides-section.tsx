import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Clock, Users } from "lucide-react"

const sharedRides = [
  {
    id: 1,
    timeAgo: "10 min ago",
    driver: {
      name: "Alex Chen",
      image: "/professional-driver-headshot.jpg",
    },
    vehicle: "Toyota Alphard",
    pickup: {
      location: "Downtown Plaza",
      type: "Pickup point",
    },
    destination: {
      location: "Airport Terminal 1",
      type: "Destination",
    },
    time: "02-04 pm",
    duration: "45 min",
    seats: {
      available: 3,
      total: 6,
    },
    price: "LKR 2000.00",
  },
  {
    id: 2,
    timeAgo: "10 min ago",
    driver: {
      name: "Alex Chen",
      image: "/professional-driver-headshot.jpg",
    },
    vehicle: "Toyota Alphard",
    pickup: {
      location: "Downtown Plaza",
      type: "Pickup point",
    },
    destination: {
      location: "Airport Terminal 1",
      type: "Destination",
    },
    time: "02-04 pm",
    duration: "45 min",
    seats: {
      available: 3,
      total: 6,
    },
    price: "LKR 2000.00",
  },
  {
    id: 3,
    timeAgo: "10 min ago",
    driver: {
      name: "Alex Chen",
      image: "/professional-driver-headshot.jpg",
    },
    vehicle: "Toyota Alphard",
    pickup: {
      location: "Downtown Plaza",
      type: "Pickup point",
    },
    destination: {
      location: "Airport Terminal 1",
      type: "Destination",
    },
    time: "02-04 pm",
    duration: "45 min",
    seats: {
      available: 3,
      total: 6,
    },
    price: "LKR 2000.00",
  },
]

export function SharedRidesSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-yellow-500 mb-4">Available Shared Rides</h2>
          <p className="text-gray-600 text-lg mb-2">Join other passengers and save money while traveling.</p>
          <p className="text-gray-600 text-lg mb-8">Real-time updates show live availability</p>

          <div className="max-w-md mx-auto mb-12">
            <Input
              placeholder="Search by location and vehicale..."
              className="h-12 text-center border-2 border-blue-200 rounded-full bg-white"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {sharedRides.map((ride) => (
            <Card key={ride.id} className="bg-white border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-center mb-4">
                    <Badge className="bg-blue-100 text-blue-600 hover:bg-blue-100 rounded-full px-3 py-1">
                      {ride.timeAgo}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 mb-6">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={ride.driver.image || "/placeholder.svg"} alt={ride.driver.name} />
                      <AvatarFallback>
                        {ride.driver.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-lg">{ride.driver.name}</p>
                      <p className="text-gray-600">{ride.vehicle}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-semibold text-gray-900">{ride.pickup.location}</p>
                        <p className="text-gray-500 text-sm">{ride.pickup.type}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <div>
                        <p className="font-semibold text-gray-900">{ride.destination.location}</p>
                        <p className="text-gray-500 text-sm">{ride.destination.type}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-400 rounded-full flex items-center justify-center">
                        <Clock className="h-3 w-3 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{ride.time}</p>
                        <p className="text-gray-500 text-sm">{ride.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 border-2 border-purple-400 rounded-full flex items-center justify-center">
                        <Users className="h-3 w-3 text-purple-400" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {ride.seats.available}/{ride.seats.total} seats
                        </p>
                        <p className="text-gray-500 text-sm">Available</p>
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-200" />

                  <div className="flex items-center justify-between pt-4">
                    <div>
                      <p className="text-xl font-bold text-gray-900">{ride.price}</p>
                      <p className="text-gray-500 text-sm">per seat</p>
                    </div>
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-2 rounded-lg font-semibold">
                      Join Ride
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
          <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </section>
  )
}
