import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Star, ThumbsUp, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { ReviewFormDialog } from "./review-form-dialog";

type Review = {
  id: string | number;
  name: string;
  avatar: string;
  vehicle: string;
  driver: string;
  date: string;
  rating: number;
  review: string;
  helpful: number;
  tag: string;
  tagColor: string;
};

export function ReviewsSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(4.7);
  const [totalReviews, setTotalReviews] = useState(6);
  const [ratingDistribution, setRatingDistribution] = useState([4, 2, 0, 0, 0]);

  // Load reviews on component mount
  useEffect(() => {
    const loadReviews = async () => {
      try {
        // Try backend first
        const base =
          (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") ||
          "https://taxi-backend-x5w6.onrender.com";
        const apiUrl = base.endsWith("/api")
          ? `${base}/reviews`
          : `${base}/api/reviews`;

        let serverReviews = [];
        try {
          const resp = await fetch(apiUrl);
          if (resp.ok) {
            const json = await resp.json();
            serverReviews =
              json && json.data && json.data.reviews
                ? json.data.reviews
                : json || [];
          } else {
            console.warn("Failed to load reviews from API:", resp.status);
          }
        } catch (err: unknown) {
          console.warn(
            "Could not reach reviews API:",
            err instanceof Error ? err.message : String(err)
          );
        }

        if (serverReviews.length > 0) {
          type ServerReview = {
            id?: string | number;
            _id?: string | number;
            name?: string;
            authorName?: string;
            avatar?: string;
            vehicle?: string;
            driver?: string;
            createdAt?: string | number;
            date?: string | number;
            rating?: number | string;
            rate?: number | string;
            review?: string;
            comment?: string;
            helpful?: number;
            tag?: string;
            raw?: Record<string, unknown>;
          };

          // Normalize server reviews to our UI shape
          const normalized: Review[] = (serverReviews as ServerReview[]).map(
            (r) => ({
              id: r.id || r._id || Date.now(),
              name: r.name || r.authorName || "Anonymous",
              avatar: r.avatar || "/placeholder.svg",
              vehicle: (r.vehicle ?? (r.raw && r.raw.vehicle) ?? "") as string,
              driver: (r.driver ?? (r.raw && r.raw.driver) ?? "") as string,
              date: new Date(
                r.createdAt || r.date || Date.now()
              ).toLocaleDateString("en-US", {
                month: "2-digit",
                day: "2-digit",
                year: "numeric",
              }),
              rating: Number(r.rating || r.rate || 0),
              review: r.review || r.comment || "",
              helpful: r.helpful || 0,
              tag: r.tag || (r.vehicle && "Individual") || "Individual",
              tagColor:
                r.tag === "Shared"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-purple-100 text-purple-600",
            })
          );

          setReviews(normalized);
          calculateStats(normalized);
          return;
        }

        // Fallback to static reviews.json when backend has none or fails
        const response = await fetch("/reviews.json");
        const staticReviews = await response.json();
        setReviews(staticReviews);
        calculateStats(staticReviews);
      } catch (error) {
        console.error("Error loading reviews:", error);
      }
    };

    loadReviews();
  }, []);

  const calculateStats = (allReviews: Review[]) => {
    if (allReviews.length === 0) return;

    // Average rating
    const totalRating = allReviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    const avg = Number((totalRating / allReviews.length).toFixed(1));
    setAverageRating(avg);

    // Total reviews
    setTotalReviews(allReviews.length);

    // Rating distribution (count of each star rating)
    const distribution = [0, 0, 0, 0, 0]; // 1-5 star counts
    allReviews.forEach((review) => {
      if (review.rating >= 1 && review.rating <= 5) {
        distribution[review.rating - 1]++;
      }
    });
    setRatingDistribution(distribution.reverse()); // Reverse for display (5 stars first)
  };

  const handleSubmitReview = (newReview: Review) => {
    setReviews((prev) => [newReview, ...prev]);

    // Save to localStorage
    const storedReviews = localStorage.getItem("userReviews");
    const userReviews = storedReviews ? JSON.parse(storedReviews) : [];
    userReviews.push(newReview);
    localStorage.setItem("userReviews", JSON.stringify(userReviews));

    // Recalculate stats
    calculateStats([newReview, ...reviews]);
  };
  return (
    <section id="reviews-section" className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-yellow-500 mb-4">
            Customer Reviews
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            See what our customers say about their experiences with our drivers
            and vehicles.
          </p>
        </div>

        <div className="bg-blue-50 rounded-2xl p-8 mb-12">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {averageRating}
              </div>
              <div className="flex justify-center gap-1 mb-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <div className="text-gray-600 font-medium">Average Rating</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-green-600 mb-2">
                {totalReviews}+
              </div>
              <div className="flex justify-center mb-2">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div className="text-gray-600 font-medium">Total Reviews</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-purple-600 mb-2">
                {Math.round((averageRating / 5) * 100)}%
              </div>
              <div className="flex justify-center mb-2">
                <ThumbsUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="text-gray-600 font-medium">Satisfaction Rate</div>
            </div>
          </div>

          <div className="max-w-md mx-auto">
            <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
              Rating Distribution
            </h3>
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((stars, index) => (
                <div key={stars} className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 w-6">{stars}★</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{
                        width:
                          totalReviews > 0
                            ? `${
                                (ratingDistribution[index] / totalReviews) * 100
                              }%`
                            : "0%",
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-4">
                    {ratingDistribution[index]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {reviews.map((review) => (
            <Card
              key={review.id}
              className="bg-white border-0 shadow-lg rounded-2xl overflow-hidden"
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-16 w-16">
                        <AvatarImage
                          src={"/images/user.png"}
                          alt={review.name}
                          className="object-cover"
                        />
                        <AvatarFallback>
                          {review.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>

                      <div>
                        <p className="font-semibold text-gray-900">
                          {review.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {review.vehicle} • Driver: {review.driver} •{" "}
                          {review.date}
                        </p>
                      </div>
                    </div>
                    <Badge
                      className={`${review.tagColor} hover:${review.tagColor} rounded-full px-3 py-1 text-sm`}
                    >
                      {review.tag}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 fill-yellow-400 text-yellow-400"
                      />
                    ))}
                    <span className="text-sm font-semibold text-gray-700 ml-1">
                      {review.rating}.0
                    </span>
                  </div>

                  <p className="text-gray-700 text-sm leading-relaxed">
                    {review.review}
                  </p>

                  <div className="flex items-center gap-2 pt-2">
                    <ThumbsUp className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      Helpful ({review.helpful})
                    </span>
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
          <p className="text-lg mb-6 opacity-90">
            Had a great ride with us? Share your Review with our community!
          </p>
          <ReviewFormDialog onSubmitReview={handleSubmitReview} />
        </div>
      </div>
    </section>
  );
}
