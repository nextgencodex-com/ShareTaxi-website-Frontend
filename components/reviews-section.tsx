import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ThumbsUp, TrendingUp } from "lucide-react"

const reviews = [
  {
    id: 1,
    name: "Sarah Mitchel",
    avatar: "/professional-woman-headshot.png",
    vehicle: "Toyota Alphard",
    driver: "Michael Chen",
    date: "12/18/2024",
    rating: 5,
    review:
      "Exceptional service! The driver was punctual, professional, and the vehicle was spotless. The ride was smooth and comfortable. Definitely booking again for my next business trip.",
    helpful: 24,
    tag: "Individual",
    tagColor: "bg-purple-100 text-purple-600",
  },
  {
    id: 2,
    name: "Sarah Mitchel",
    avatar: "/images/testimonial-2.png",
    vehicle: "Toyota Alphard",
    driver: "Michael Chen",
    date: "12/18/2024",
    rating: 5,
    review:
      "Exceptional service! The driver was punctual, professional, and the vehicle was spotless. The ride was smooth and comfortable. Definitely booking again for my next business trip.",
    helpful: 24,
    tag: "Shared",
    tagColor: "bg-blue-100 text-blue-600",
  },
  {
    id: 3,
    name: "Sarah Mitchel",
    avatar: "/young-professional-woman.png",
    vehicle: "Toyota Alphard",
    driver: "Michael Chen",
    date: "12/18/2024",
    rating: 5,
    review:
      "Exceptional service! The driver was punctual, professional, and the vehicle was spotless. The ride was smooth and comfortable. Definitely booking again for my next business trip.",
    helpful: 24,
    tag: "Shared",
    tagColor: "bg-blue-100 text-blue-600",
  },
  {
    id: 4,
    name: "Sarah Mitchel",
    avatar: "/middle-aged-man-headshot.png",
    vehicle: "Toyota Alphard",
    driver: "Michael Chen",
    date: "12/18/2024",
    rating: 5,
    review:
      "Exceptional service! The driver was punctual, professional, and the vehicle was spotless. The ride was smooth and comfortable. Definitely booking again for my next business trip.",
    helpful: 24,
    tag: "Individual",
    tagColor: "bg-purple-100 text-purple-600",
  },
]

export function ReviewsSection() {
  return (
    <section id="reviews-section" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-yellow-500 mb-4">Customer Reviews</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            See what our customers say about their experiences with our drivers and vehicles.
          </p>
        </div>

        <div className="bg-blue-50 rounded-2xl p-8 mb-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">4.7</div>
              <div className="flex justify-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <div className="text-gray-600 font-medium">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-green-600 mb-2">6+</div>
              <div className="flex justify-center mb-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-gray-600 font-medium">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-purple-600 mb-2">98%</div>
              <div className="flex justify-center mb-2">
                <ThumbsUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-gray-600 font-medium">Satisfaction Rate</div>
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">Rating Distribution</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-6">5★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full" style={{ width: "80%" }}></div>
                </div>
                <span className="text-sm text-gray-600 w-4">4</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-6">4★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-yellow-400 h-2 rounded-full" style={{ width: "40%" }}></div>
                </div>
                <span className="text-sm text-gray-600 w-4">2</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-6">3★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-200 h-2 rounded-full" style={{ width: "0%" }}></div>
                </div>
                <span className="text-sm text-gray-600 w-4">0</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-6">2★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-200 h-2 rounded-full" style={{ width: "0%" }}></div>
                </div>
                <span className="text-sm text-gray-600 w-4">0</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-6">1★</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-gray-200 h-2 rounded-full" style={{ width: "0%" }}></div>
                </div>
                <span className="text-sm text-gray-600 w-4">0</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {reviews.map((review) => (
            <Card key={review.id} className="bg-white border-0 shadow-lg rounded-2xl overflow-hidden">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={review.avatar || "/placeholder.svg"} alt={review.name} className="object-cover" />
                        <AvatarFallback>
                          {review.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-gray-900">{review.name}</p>
                        <p className="text-sm text-gray-600">
                          {review.vehicle} • Driver: {review.driver} • {review.date}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${review.tagColor} hover:${review.tagColor} rounded-full px-3 py-1 text-sm`}>
                      {review.tag}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    ))}
                    <span className="text-sm font-semibold text-gray-700 ml-1">5.5</span>
                  </div>

                  <p className="text-gray-700 text-sm leading-relaxed">{review.review}</p>

                  <div className="flex items-center gap-2 pt-2">
                    <ThumbsUp className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">Helpful ({review.helpful})</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="bg-gradient-to-r from-orange-400 to-yellow-500 rounded-2xl p-8 text-center text-white">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="text-4xl font-bold">Share Your Experience</div>
            <div className="text-6xl">🚕</div>
          </div>
          <p className="text-lg mb-6 opacity-90">Had a great ride with us? Share your Review with our community!</p>
          <Button className="bg-white text-orange-500 hover:bg-gray-100 px-8 py-3 rounded-lg font-semibold">
            Write a Review
          </Button>
        </div>
      </div>
    </section>
  )
}
