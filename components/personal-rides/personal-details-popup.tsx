"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { X, MapPin, Clock, Users, ArrowLeft, AlertTriangle, MessageCircleQuestion } from "lucide-react";
import { PaymentDetailsPopup } from "../payment-popup";

interface Destination {
  id: string;
  location: string;
}

interface BookingData {
  from: string;
  to: string;
  rideType: string;
  vehicleCategory?: string;
  vehicleType?: string;
  vehicleId?: number;
  vehicleName?: string;
  vehicleImage?: string;
  vehiclePassengers?: string;
  vehicleLuggage?: string;
  vehicleRatePerKm?: string;
  date: string;
  time: string;
  passengers: number | string;
  tripType: string;
  destinations?: Destination[];
  startingPoint?: string;
  mapDistance?: string | null;
  mapDuration?: string | null;
  calculatedFare?: string;
}

interface PersonalDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPersonalRide?: (bookingData: any) => void;
  bookingData: BookingData | null;
}

export function PersonalDetailsPopup({
  isOpen,
  onClose,
  onAddPersonalRide,
  bookingData,
}: PersonalDetailsPopupProps) {
  const TOTAL_SEATS = 10;
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phoneCountry: "+94",
    phoneNumber: "",
    specialRequests: "",
    seatCount: bookingData?.passengers ? Number(bookingData.passengers) : 1,
    paymentMethod: "",
    justAskBeforeEdit: false,
  });

  const [showPaymentPopup, setShowPaymentPopup] = useState(false);
  const [currentBookingData, setCurrentBookingData] = useState<BookingData | null>(bookingData);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (bookingData?.passengers) {
      const count = Number(bookingData.passengers);
      setFormData((prev) => ({ ...prev, seatCount: count }));
      recalculateFareWithNewSeats(count);
    }
  }, [bookingData?.passengers]);

  useEffect(() => {
    setCurrentBookingData(bookingData);
    setIsInitialLoad(true);
  }, [bookingData]);

  useEffect(() => {
    if (isOpen && currentBookingData && isInitialLoad) {
      recalculateFareWithNewSeats(formData.seatCount);
      setIsInitialLoad(false);
    }
  }, [currentBookingData, isOpen, isInitialLoad]);

  if (!isOpen || !bookingData) return null;

  const validateField = (field: string, value: string) => {
    let error = "";
    const trimmedValue = value.trim();

    switch (field) {
      case "fullName":
        if (!trimmedValue) error = "Full name is required";
        else if (trimmedValue.length < 2) error = "Full name must be at least 2 characters long";
        else if (trimmedValue.length > 100) error = "Full name cannot exceed 100 characters";
        else if (!/^[a-zA-Z\s\-']+$/.test(trimmedValue))
          error = "Full name can only contain letters, spaces, hyphens, and apostrophes";
        break;
      case "email":
        if (!trimmedValue) error = "Email address is required";
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue))
          error = "Please enter a valid email address";
        break;
      case "phoneNumber":
        if (!trimmedValue) error = "Phone number is required";
        else if (!/^\d{8,10}$/.test(trimmedValue))
          error = "Phone number must be 8-10 digits";
        break;
      case "phoneCountry":
        if (!trimmedValue) error = "Country code is required";
        else if (!/^\+\d{1,4}$/.test(trimmedValue))
          error = "Please select a valid country code (e.g., +94)";
        break;
      case "paymentMethod":
        if (!trimmedValue) error = "Payment method is required";
        break;
      case "specialRequests":
        if (value.length > 500) error = "Special requests cannot exceed 500 characters";
        break;
    }

    setFieldErrors((prev) => ({ ...prev, [field]: error }));
    return error;
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === "phoneNumber") {
      let cleaned = (value || "").replace(/[^0-9]/g, "");
      const cc = (formData.phoneCountry || "").replace("+", "");
      if (cc && cleaned.startsWith(cc)) {
        cleaned = cleaned.slice(cc.length);
      }
      setFormData((prev) => ({ ...prev, phoneNumber: cleaned }));
      validateField("phoneNumber", cleaned);
      return;
    }

    setFormData((prev) => ({ ...prev, [field]: value }));
    validateField(field, value);
  };

  const handleSeatCountChange = (change: number) => {
    const newSeatCount = Math.max(1, Math.min(20, formData.seatCount + change));
    setFormData((prev) => ({ ...prev, seatCount: newSeatCount }));
    recalculateFareWithNewSeats(newSeatCount);
  };

  const recalculateFareWithNewSeats = (seats: number) => {
    if (!currentBookingData?.calculatedFare) return;
    const rateMatch = currentBookingData.calculatedFare.match(/Rate:\s*\$([0-9.]+)/);
    const distanceMatch = currentBookingData.calculatedFare.match(/Distance:\s*([0-9.]+)/);
    if (!rateMatch || !distanceMatch) return;
    const rate = parseFloat(rateMatch[1]);
    const distance = parseFloat(distanceMatch[1]);
    let newFareDisplay = "";

    if (currentBookingData.rideType === "shared") {
      const perPersonFare = (distance * rate) / 4;
      const totalPrice = perPersonFare * seats;
      newFareDisplay = `🚗 Distance: ${distance} km<br>👥 Persons: ${seats}<br><span style=\"color:blue; font-size:18px; font-weight:bold;\">Total Price: $${totalPrice.toFixed(
        2
      )}</span>`;
    } else {
      const totalFare = distance * rate * seats;
      newFareDisplay = `🚗 Distance: ${distance} km<br>👥 Persons: ${seats}<br><span style=\"color:blue; font-size:18px; font-weight:bold;\">Total Price: $${totalFare.toFixed(
        2
      )}</span>`;
    }

    setCurrentBookingData((prev) => (prev ? { ...prev, calculatedFare: newFareDisplay } : null));
  };

  const validateFormData = () => {
    const errors: string[] = [];
    if (!formData.fullName.trim()) errors.push("Full name is required");
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.push("Valid email is required");
    const fullPhone = `${formData.phoneCountry || ""}${formData.phoneNumber || ""}`;
    if (!formData.phoneNumber.trim() || !/^\+?\d{7,15}$/.test(formData.phoneNumber))
      errors.push("Valid phone number required (7-15 digits)");
    else if (!/^(\+\d{8,15})$/.test(fullPhone))
      errors.push("Valid phone with country code required (e.g., +94769278958)");
    if (!formData.paymentMethod.trim()) errors.push("Payment method is required");
    if (formData.seatCount < 1 || formData.seatCount > TOTAL_SEATS)
      errors.push(`Person count must be between 1 and ${TOTAL_SEATS}`);
    if (formData.specialRequests.length > 500) errors.push("Special requests too long");
    return errors;
  };

  const handleContinueToPayment = () => {
    setHasAttemptedSubmit(true);
    const errors = validateFormData();
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }
    setValidationErrors([]);
    if (bookingData.rideType === "personal") onAddPersonalRide?.(bookingData);
    setShowPaymentPopup(true);
  };

  const handleClosePaymentPopup = () => setShowPaymentPopup(false);

  const personalDataForPopup = {
    fullName: formData.fullName,
    email: formData.email,
    phone: `${formData.phoneCountry || ""}${formData.phoneNumber || ""}`,
    specialRequests: formData.specialRequests,
    seatCount: formData.seatCount,
    paymentMethod: formData.paymentMethod,
    justAskBeforeEdit: formData.justAskBeforeEdit,
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b">
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4 text-gray-600" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Personal Details</h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          {validationErrors.length > 0 && (
            <Alert variant="destructive" className="m-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  {validationErrors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <div className="p-6 space-y-6">
            <div className="bg-yellow-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Ride Summary</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{bookingData.from}</p>
                    <p className="text-gray-600 text-sm">Pickup point</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-blue-400 rounded-full flex items-center justify-center">
                    <Clock className="h-3 w-3 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      Pickup Time: {bookingData.time} | Date:{" "}
                      {new Date(bookingData.date).toLocaleDateString("en-US")}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {bookingData.mapDuration || "Estimated duration"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {bookingData.tripType === "multi-city" && bookingData.destinations
                        ? bookingData.destinations.filter((d) => d.location.trim()).map((d) => d.location).join(", ")
                        : bookingData.to}
                    </p>
                    <p className="text-gray-600 text-sm">Destination</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-purple-400 rounded-full flex items-center justify-center">
                    <Users className="h-3 w-3 text-purple-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {bookingData.rideType === "shared" ? "Shared ride" : "Personal ride"}
                    </p>
                    <p className="text-gray-600 text-sm">
                      {bookingData.rideType === "shared" ? "Shared ride" : "Personal ride"}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Vehicle Information */}
              {(bookingData.vehicleName || bookingData.vehicleType || bookingData.vehicleImage) && (
                <div className="mt-4 p-4 bg-white rounded-lg border-2 border-yellow-200">
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">🚗 Selected Vehicle</h4>
                  <div className="flex items-center gap-3">
                    {bookingData.vehicleImage && (
                      <img
                        src={bookingData.vehicleImage}
                        alt={bookingData.vehicleName || "Vehicle"}
                        className="w-14 h-12 object-cover rounded bg-gray-100"
                      />
                    )}
                    <div>
                      <span className="text-gray-900 font-medium">
                        {bookingData.vehicleName || bookingData.vehicleType || "Vehicle"}
                      </span>
                      {(bookingData.vehiclePassengers || bookingData.vehicleLuggage) && (
                        <div className="text-xs text-gray-600 mt-1">
                          {bookingData.vehiclePassengers && <span>👤 x {bookingData.vehiclePassengers}</span>}
                          {bookingData.vehiclePassengers && bookingData.vehicleLuggage && <span className="mx-1">•</span>}
                          {bookingData.vehicleLuggage && <span>🎒 x {bookingData.vehicleLuggage}</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <hr className="border-gray-200 my-4" />
              {currentBookingData?.calculatedFare ? (
                <div className="bg-blue-50 p-3 rounded-lg border">
                  <div
                    className="text-sm font-medium"
                    dangerouslySetInnerHTML={{
                      __html: currentBookingData.calculatedFare,
                    }}
                  />
                </div>
              ) : (
                <div className="text-gray-500 italic">Fare not available.</div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2 block">Full Name</label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => handleInputChange("fullName", e.target.value)}
                  placeholder="Enter your full name"
                  className="bg-blue-50 border-0 h-12"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2 block">Email Address</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="Enter your email"
                  className="bg-blue-50 border-0 h-12"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2 block">Phone Number</label>
                <div className="flex gap-2">
                  <select
                    value={formData.phoneCountry}
                    onChange={(e) => handleInputChange("phoneCountry", e.target.value)}
                    className="w-20 bg-blue-50 border-0 h-12 rounded-md px-2"
                    aria-label="Country code"
                  >
                    <option value="+94">+94 (LK)</option>
                    <option value="+1">+1 (US/CA)</option>
                    <option value="+44">+44 (UK)</option>
                    <option value="+91">+91 (IN)</option>
                    <option value="+61">+61 (AU)</option>
                    <option value="+86">+86 (CN)</option>
                    <option value="+81">+81 (JP)</option>
                    <option value="+49">+49 (DE)</option>
                    <option value="+33">+33 (FR)</option>
                    <option value="+39">+39 (IT)</option>
                    <option value="+82">+82 (KR)</option>
                    <option value="+65">+65 (SG)</option>
                    <option value="+971">+971 (AE)</option>
                    <option value="+966">+966 (SA)</option>
                    <option value="+20">+20 (EG)</option>
                    <option value="+27">+27 (ZA)</option>
                  </select>
                  <Input
                    value={formData.phoneNumber}
                    onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                    placeholder="Enter local number"
                    className="flex-1 bg-blue-50 border-0 h-12"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-900 mb-2 block">Payment Method</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => handleInputChange("paymentMethod", e.target.value)}
                  className="w-full bg-blue-50 border-0 h-12 rounded-md px-3"
                >
                  <option value="">Select payment method</option>
                  <option value="Visa Card">Visa Card</option>
                  <option value="QR Payment">QR Payment</option>
                  <option value="UPI">UPI</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Via Payment Gateway">Via Payment Gateway</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-900 mb-2 block">Special Requests or Notes</label>
              <Textarea
                value={formData.specialRequests}
                onChange={(e) => handleInputChange("specialRequests", e.target.value)}
                className="bg-blue-50 border-0 min-h-[100px] resize-none"
                placeholder="Enter your special request"
              />
            </div>

            <div className="bg-blue-50 rounded-xl p-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.justAskBeforeEdit}
                  onChange={(e) => setFormData((prev) => ({ ...prev, justAskBeforeEdit: e.target.checked }))}
                  className="mt-1 w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <div>
                  <span className="font-semibold text-gray-900 flex items-center gap-2">
                    <MessageCircleQuestion className="h-4 w-4 text-orange-500" />
                    Just ask me before edit
                  </span>
                  <p className="text-sm text-gray-600 mt-1">
                    Enable this option if you want to be asked for confirmation before any changes are made to your booking.
                  </p>
                </div>
              </label>
            </div>

            <Button
              onClick={handleContinueToPayment}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white h-14 text-lg font-semibold rounded-2xl"
            >
              Continue To Create a Ride
            </Button>
          </div>
        </div>
      </div>

      <PaymentDetailsPopup
        isOpen={showPaymentPopup}
        onClose={handleClosePaymentPopup}
        onBack={handleClosePaymentPopup}
        bookingData={currentBookingData || bookingData}
        personalData={personalDataForPopup}
      />
    </>
  );
}
