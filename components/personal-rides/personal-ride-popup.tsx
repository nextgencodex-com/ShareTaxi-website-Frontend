"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Users, Briefcase, ShoppingBag, Calendar, ArrowLeft } from "lucide-react";
import { useRideBooking } from "@/hooks/use-ride-booking";
import { PersonalDetailsPopup } from "./personal-details-popup";

interface Vehicle {
  id: number;
  name: string;
  price: string;
  passengers: string;
  luggage: string;
  handCarry: string;
  image: string;
  features: string[];
}

interface BookingData {
  from: string;
  to: string;
  rideType: string;
  date: string;
  time: string;
  passengers: number | string;
  tripType: string;
  mapDistance?: string | null;
  mapDuration?: string | null;
  calculatedFare?: string;
}

interface PersonalRidePopupProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
}

export function PersonalRidePopup({ isOpen, onClose, vehicle }: PersonalRidePopupProps) {
  const { getCurrentLocation } = useRideBooking();
  const [loadingLocal, setLoadingLocal] = useState(false);
  const [showDetailsPopup, setShowDetailsPopup] = useState(false);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    pickupAddress: "",
    dropoffAddress: "",
    bookingDate: "",
  });

  if (!isOpen || !vehicle) return null;

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleContinueToDetails = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.pickupAddress || !formData.dropoffAddress || !formData.bookingDate) {
      alert("Please fill in all fields");
      return;
    }

    setLoadingLocal(true);
    try {
      let currentLocation = formData.pickupAddress;

      const resolveWithTimeout = async () => {
        try {
          const location = await Promise.race([
            getCurrentLocation(),
            new Promise<string>((_resolve, reject) =>
              setTimeout(() => reject(new Error("Location timeout")), 2000)
            ),
          ]);
          if (location) currentLocation = location;
        } catch (locationError) {
          console.warn("Failed to get current location, falling back to pickup address", locationError);
        }
      };

      await resolveWithTimeout();

      const numericPrice = Number(String(vehicle.price || "").replace(/[^0-9.]/g, "")) || 0;
      const distanceKm = 1;
      const ratePerKm = numericPrice || 0;

      // Prepare booking data for the details popup (match shared flow structure)
      const newBookingData = {
        from: formData.pickupAddress || currentLocation,
        to: formData.dropoffAddress,
        rideType: "personal",
        date: formData.bookingDate,
        time: "10:00 AM",
        passengers: 1,
        tripType: "one-way",
        mapDistance: String(distanceKm),
        mapDuration: null,
        calculatedFare: `🚗 Distance: ${distanceKm} km<br>Rate: $${ratePerKm.toFixed(2)}<br>👥 Persons: 1<br><span style=\"color:blue; font-size:18px; font-weight:bold;\">Total Price: ${vehicle.price}</span>`,
      };

      // Store in state and show popup
      setBookingData(newBookingData);
      setShowDetailsPopup(true);
    } catch (error) {
      console.error("Error preparing booking:", error);
      alert("Error preparing booking. Please try again.");
    } finally {
      setLoadingLocal(false);
    }
  };

  const handleDetailsPopupClose = () => {
    setShowDetailsPopup(false);
  };

  const handleDetailsPopupAddRide = (bookingData: any) => {
    console.log("Adding personal ride:", bookingData);
    // The actual ride creation happens in the payment popup
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <ArrowLeft className="h-6 w-6 text-gray-600" />
              </button>
              <h2 className="text-2xl font-bold text-gray-800">Book Your Personal Ride</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            {/* Vehicle Details Section */}
            <div className="bg-yellow-50 rounded-2xl p-6 mb-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Vehicle Image */}
                <div className="rounded-xl overflow-hidden">
                  {vehicle.image && (
                    <img
                      src={vehicle.image}
                      alt={vehicle.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                </div>

                {/* Vehicle Info */}
                <div>
                  <h3 className="text-2xl font-bold text-orange-600 mb-2">{vehicle.name}</h3>
                  <p className="text-xl text-gray-700 mb-4">{vehicle.price}</p>

                  <div className="mb-4">
                    <h4 className="text-lg font-semibold text-orange-600 mb-2">Features:</h4>
                    <ul className="space-y-1">
                      {vehicle.features.map((feature, index) => (
                        <li key={index} className="text-gray-700 flex items-center">
                          <span className="w-2 h-2 bg-orange-500 rounded-full mr-3"></span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Capacity Icons */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Users className="h-6 w-6 text-gray-700" />
                      <span className="font-semibold text-gray-800">{vehicle.passengers} Passengers</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Briefcase className="h-6 w-6 text-gray-700" />
                      <span className="font-semibold text-gray-800">{vehicle.luggage} Luggage</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="h-6 w-6 text-gray-700" />
                      <span className="font-semibold text-gray-800">{vehicle.handCarry} Carry</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Form */}
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                  <Input
                    type="text"
                    placeholder="Enter Name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full p-3 bg-blue-50 border-0 rounded-lg text-gray-700 placeholder-gray-400"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <Input
                    type="email"
                    placeholder="Enter email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full p-3 bg-blue-50 border-0 rounded-lg text-gray-700 placeholder-gray-400"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                  <Input
                    type="tel"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full p-3 bg-blue-50 border-0 rounded-lg text-gray-700 placeholder-gray-400"
                    required
                  />
                </div>

                {/* Booking Date */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Booking date</label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={formData.bookingDate}
                      onChange={(e) => handleInputChange("bookingDate", e.target.value)}
                      className="w-full p-3 bg-blue-50 border-0 rounded-lg text-gray-700 placeholder-gray-400"
                      required
                    />
                  </div>
                </div>

                {/* Pickup Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Location</label>
                  <Input
                    type="text"
                    placeholder="Enter pickup address"
                    value={formData.pickupAddress}
                    onChange={(e) => handleInputChange("pickupAddress", e.target.value)}
                    className="w-full p-3 bg-blue-50 border-0 rounded-lg text-gray-700 placeholder-gray-400"
                    required
                  />
                </div>

                {/* Dropoff Address */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Dropoff Location</label>
                  <Input
                    type="text"
                    placeholder="Enter destination address"
                    value={formData.dropoffAddress}
                    onChange={(e) => handleInputChange("dropoffAddress", e.target.value)}
                    className="w-full p-3 bg-blue-50 border-0 rounded-lg text-gray-700 placeholder-gray-400"
                    required
                  />
                </div>
              </div>

              {/* Continue Button */}
              <Button
                onClick={handleContinueToDetails}
                disabled={loadingLocal}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-xl text-lg disabled:opacity-50"
              >
                {loadingLocal ? "Loading..." : "Continue to Personal Details"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Details Popup */}
      <PersonalDetailsPopup
        isOpen={showDetailsPopup}
        onClose={handleDetailsPopupClose}
        onAddPersonalRide={handleDetailsPopupAddRide}
        bookingData={bookingData}
      />
    </>
  );
}
