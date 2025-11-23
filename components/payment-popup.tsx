"use client";

import { useState } from "react";
import emailjs from "@emailjs/browser";
import { Button } from "@/components/ui/button";
// Avatar components not used here — omitted to avoid lint warnings
import {
  X,
  MapPin,
  Clock,
  Users,
  Mail,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SharedRideConfirmationPopup } from "./shared-ride-confirmation-popup";
import {
  calculateTotalPrice,
  getPerKmRate,
  getTripMultiplier,
  PER_SEAT_RATE_USD,
  formatPriceUSD,
  calculateProgressiveSharedTotal,
} from "@/lib/pricing";
import { useCallback } from "react";
import { AlertTriangle } from "lucide-react";

// Send Confirmation Email
const sendConfirmationEmail = async (
  bookingData?: BookingData | null,
  personalData?: PersonalData | null,
  rideData?: RideData | null,
  isJoinRideFlow?: boolean,
  selectedSeats?: number | null,
  seatsCount?: number,
  totalPrice?: string,
  perPersonFare?: string,
  subjectOverride?: string,
  recipientEmail?: string
) => {
  try {
    // Extract pricing information
    let extractedPerPersonFare = perPersonFare || "N/A";
    const getSeatCount = (pd?: PersonalData | null): number => {
      if (!pd) return 1;
      const maybeSeat = (pd as unknown as Record<string, unknown>)["seatCount"];
      if (typeof maybeSeat === "number") return maybeSeat;
      if (
        typeof maybeSeat === "string" &&
        maybeSeat.trim() !== "" &&
        !isNaN(Number(maybeSeat))
      )
        return parseInt(maybeSeat, 10);
      return 1;
    };

    const extractedSeats = seatsCount || getSeatCount(personalData);
    let extractedTotal = totalPrice || "N/A";

    // If pricing wasn't passed in, try to extract from calculatedFare
    if (bookingData?.calculatedFare && !perPersonFare) {
      const tempDiv = document.createElement("div");
      tempDiv.innerHTML = bookingData.calculatedFare;

      const perPersonElement = tempDiv.querySelector('[style*="color:green"]');
      const totalElement = tempDiv.querySelector('[style*="color:blue"]');

      if (perPersonElement) {
        extractedPerPersonFare = perPersonElement.textContent || "N/A";
      }
      if (totalElement) {
        extractedTotal = totalElement.textContent || "N/A";
      }
    }

    // Determine the display total to match UI Booking Summary
    // For join flow: prefer rideData.price (formatted or number), otherwise compute progressive total
    // For regular flow: prefer extracted total from calculatedFare (blue), otherwise compute total via pricing helpers
    let displayTotal = extractedTotal;
    let displayPerPerson = extractedPerPersonFare;

    const seatCountForCalc = seatsCount || extractedSeats || getSeatCount(personalData);

    if (isJoinRideFlow) {
      // Prefer rideData.price when present. rideData.price is a per-person value in the UI,
      // so compute total = perPerson * seatCount. If price is not numeric, fall back to
      // the progressive shared total calculation.
      const rawPrice = (rideData as unknown as Record<string, unknown>)?.["price"];
      const parsedPerPerson = rawPrice !== undefined && rawPrice !== null && String(rawPrice).trim() !== ""
        ? Number(String(rawPrice).replace(/[^0-9.]/g, ""))
        : NaN;

      if (!isNaN(parsedPerPerson) && parsedPerPerson > 0) {
        // Treat as per-person price
        displayPerPerson = formatPriceUSD(parsedPerPerson);
        const totalNum = parsedPerPerson * (seatCountForCalc || 1);
        displayTotal = formatPriceUSD(totalNum);
      } else {
        // Fallback to progressive total (when price not present or not numeric)
        const totalNum = calculateProgressiveSharedTotal(seatCountForCalc || 1);
        displayTotal = formatPriceUSD(totalNum);
        if (seatCountForCalc && seatCountForCalc > 0) displayPerPerson = formatPriceUSD(totalNum / seatCountForCalc);
      }
    } else {
      if (bookingData?.calculatedFare) {
        // already parsed extractedTotal above from calculatedFare
        if (!extractedTotal || extractedTotal === "N/A") {
          // fallback: compute total using pricing helper
          const passengersNum = typeof bookingData?.passengers === "string"
            ? parseInt(bookingData?.passengers || "1", 10)
            : bookingData?.passengers || 1;
          const seatsForCalc = parseInt(String(personalData?.seatCount || "1"), 10);
          const distanceForCalc = bookingData?.mapDistance ? parseFloat(bookingData.mapDistance) : 0;
          const trip = (bookingData?.tripType as "one-way" | "round-trip" | "multi-city") || "one-way";
          const totalNum = calculateTotalPrice(distanceForCalc, seatsForCalc, passengersNum, trip);
          displayTotal = formatPriceUSD(totalNum);
        }
        // per-person already set from parsed HTML if available
      } else {
        // No calculatedFare HTML present - compute total from bookingData
        const passengersNum = typeof bookingData?.passengers === "string"
          ? parseInt(bookingData?.passengers || "1", 10)
          : bookingData?.passengers || 1;
        const seatsForCalc = parseInt(String(personalData?.seatCount || "1"), 10);
        const distanceForCalc = bookingData?.mapDistance ? parseFloat(bookingData.mapDistance) : 0;
        const trip = (bookingData?.tripType as "one-way" | "round-trip" | "multi-city") || "one-way";
        const totalNum = calculateTotalPrice(distanceForCalc, seatsForCalc, passengersNum, trip);
        displayTotal = formatPriceUSD(totalNum);
        if (seatsForCalc && seatsForCalc > 0) displayPerPerson = formatPriceUSD(totalNum / seatsForCalc);
      }
    }

    // Format booking details for email
    const from = isJoinRideFlow 
      ? rideData?.pickup.location || "N/A"
      : bookingData?.from || "N/A";
    const to = isJoinRideFlow 
      ? rideData?.destination.location || "N/A"
      : bookingData?.to || "N/A";
    
    // Prefer explicit pickupDate/pickupDateFormatted or rawPayload date fields for join-flow daily rides.
    const date = isJoinRideFlow
      ? (() => {
          // 1) rideData.pickupDateFormatted (string) or rideData.pickupDate (Date)
          const rd = rideData as unknown as Record<string, unknown> | undefined;
          if (rd) {
            if (typeof rd.pickupDateFormatted === "string" && rd.pickupDateFormatted.trim() !== "") {
              return rd.pickupDateFormatted as string;
            }
            if (rd.pickupDate instanceof Date && !isNaN((rd.pickupDate as Date).getTime())) {
              return (rd.pickupDate as Date).toLocaleDateString();
            }
          }

          // 2) rawPayload fields commonly used by API
          const raw = (rideData as unknown as Record<string, unknown>)?.rawPayload as Record<string, unknown> | undefined;
          const candidate = raw?.pickupDate ?? raw?.rideDate ?? raw?.date;
          if (typeof candidate === "string" && candidate.trim() !== "") {
            const d = new Date(candidate as string);
            if (!isNaN(d.getTime())) return d.toLocaleDateString();
            return String(candidate);
          }

          // 3) Fallback: try to parse rideData.time for a leading date part
          if (rideData?.time) {
            const timeString = String(rideData.time).trim();
            const parts = timeString.split(" ");
            if (parts.length >= 3) {
              const timeIndex = parts.findIndex(part => /[:]|AM|PM|am|pm/.test(part));
              if (timeIndex > 0) return parts.slice(0, timeIndex).join(" ");
            }
          }

          return "N/A";
        })()
      : (bookingData?.date || "N/A");

    const time = isJoinRideFlow
      ? (() => {
          const rd = rideData as unknown as Record<string, unknown> | undefined;
          // Prefer explicit rawPayload pickupTime/ampm
          const raw = rd?.rawPayload as Record<string, unknown> | undefined;
          const pickTime = raw?.pickupTime ?? raw?.time ?? rd?.pickupTime;
          const ampm = raw?.ampm ?? rd?.ampm;
          if (typeof pickTime === "string" && pickTime.trim() !== "") {
            return ampm ? `${pickTime} ${String(ampm)}` : String(pickTime);
          }

          // Next prefer rideData.time's time portion
          if (rideData?.time) {
            const timeString = String(rideData.time).trim();
            const parts = timeString.split(" ");
            if (parts.length >= 3) {
              const timeIndex = parts.findIndex(part => /[:]|AM|PM|am|pm/.test(part));
              if (timeIndex >= 0) return parts.slice(timeIndex).join(" ");
            }
            // If no AM/PM parts, return the whole time string
            return timeString;
          }

          return "N/A";
        })()
      : (bookingData?.time || "N/A");

    const rideType = isJoinRideFlow ? "Shared" : (bookingData?.rideType === "personal" ? "Personal" : "Shared");
    const tripType = bookingData?.tripType 
      ? bookingData.tripType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())
      : "One Way Ride";

    const bookingDetails = `
Route: ${from} → ${to}
Date: ${date}
Time: ${time}
Type: ${rideType}, ${tripType}

Personal Details:
• Name: ${personalData?.fullName || "N/A"}
• Email: ${personalData?.email || "N/A"}
• Phone: +94${personalData?.phone || "N/A"}
• Seats: ${extractedSeats}

Special Requests: ${personalData?.specialRequests || "None"}

Price: ${extractedTotal} for ${extractedSeats} persons
    `.trim();

  // Generate a booking code and helpful URLs for confirm/cancel (client-side)
  const bookingCode = `BK-${Date.now()}`;
  // Create mailto links so clicking Confirm/Cancel in the email opens an email to the admin
  const adminNotificationEmail = "therath2426@gmail.com";
  const nameForBody = personalData?.fullName ? String(personalData.fullName) : "N/A";
  const baseBody = `Booking ID: ${bookingCode}\nName: ${nameForBody}\n`;
  const confirmSubject = encodeURIComponent(`Booking ${bookingCode} - Confirm`);
  const cancelSubject = encodeURIComponent(`Booking ${bookingCode} - Cancel`);
  const confirmBody = encodeURIComponent(baseBody + `Status: Confirm`);
  const cancelBody = encodeURIComponent(baseBody + `Status: Cancel`);
  const confirmUrl = `mailto:${adminNotificationEmail}?subject=${confirmSubject}&body=${confirmBody}`;
  const cancelUrl = `mailto:${adminNotificationEmail}?subject=${cancelSubject}&body=${cancelBody}`;

    // Derive a few more template fields for EmailJS
    const fromLocation = isJoinRideFlow ? rideData?.pickup.location || "" : bookingData?.from || "";
    const toLocation = isJoinRideFlow ? rideData?.destination.location || "" : bookingData?.to || "";
    // Derive a normalized distance string for email templates.
    const normalizeDistance = (val: unknown): string => {
      if (val === null || val === undefined) return "";
      const s = String(val).trim();
      if (!s) return "";
      // If it already contains 'km', return as-is
      if (/km/i.test(s)) return s;
      // If numeric, append km
      if (/^\d+(?:\.\d+)?$/.test(s)) return `${s} km`;
      return s;
    };

    const totalDistance = (() => {
      // Collect possible candidate fields in order of preference
      const candidates: unknown[] = [];
      if (isJoinRideFlow) {
        const rd = rideData as unknown as Record<string, unknown> | undefined;
        const rawPayload = rd?.rawPayload as Record<string, unknown> | undefined;
        // direct numeric distance from ride
        candidates.push(rd?.distanceKm);
        // simple top-level raw payload distance shapes
        candidates.push(rawPayload?.mapDistance, rawPayload?.distanceKm, rawPayload?.distance);
        // nested bookingData within rawPayload (some payloads embed bookingData)
        candidates.push(
          rawPayload?.bookingData && (rawPayload.bookingData as unknown as Record<string, unknown>)?.mapDistance,
          rawPayload?.bookingData && (rawPayload.bookingData as unknown as Record<string, unknown>)?.distanceKm
        );
      } else {
        // regular booking flow - prefer bookingData.mapDistance
        candidates.push(
          bookingData?.mapDistance,
          bookingData && (bookingData as unknown as Record<string, unknown>)?.mapDistance
        );
      }

      for (const c of candidates) {
        const n = normalizeDistance(c);
        if (n) return n;
      }

      return "";
    })();
    const vehicleType = isJoinRideFlow ? rideData?.vehicle || "" : bookingData?.rideType || "";
    const customerName = personalData?.fullName || "";
    const customerEmail = personalData?.email || "";
    const customerPhone = personalData?.phone ? `+94${personalData.phone}` : "";
    const passengerCount = String(extractedSeats || personalData?.seatCount || "");
    const paymentMethod = (() => {
      const maybe = (personalData as unknown as Record<string, unknown>)?.["paymentMethod"];
      return typeof maybe === "string" ? maybe : "";
    })();
    const specialRequest = personalData?.specialRequests || "";
    const result = await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
      {
        // Basic recipient / subject
        to_email: recipientEmail || customerEmail,
        subject: subjectOverride || "🚖 Pending Booking!",

        // Primary booking fields (match your EmailJS template placeholders)
  booking_code: bookingCode,
  total_price: displayTotal || extractedTotal,
        total_distance: totalDistance,
        from_location: fromLocation,
        to_location: toLocation,
        pickup_date: isJoinRideFlow ? (date || "") : (bookingData?.date || ""),
        pickup_time: isJoinRideFlow ? (time || "") : (bookingData?.time || ""),
        vehicle_type: vehicleType,

        // Customer details (for admin template we may override customer_email to ensure admin receives the email)
        customer_name: customerName,
        customer_email: recipientEmail || customerEmail,
        customer_phone: customerPhone,
        passenger_count: passengerCount,
        payment_method: paymentMethod,
        special_request: specialRequest,

        // Actions / links
        confirm_url: confirmUrl,
        cancel_url: cancelUrl,

        // Fallback fields used elsewhere in templates
        name: customerName,
        from: fromLocation,
        to: toLocation,
        taxi_type: isJoinRideFlow ? "shared" : (bookingData?.rideType || ""),
        date: isJoinRideFlow ? (date || "") : (bookingData?.date || ""),
        time: isJoinRideFlow ? (time || "") : (bookingData?.time || ""),
        passengers: personalData?.seatCount || "",
        luggage: specialRequest,
        seats: extractedSeats,
  per_person_fare: displayPerPerson || extractedPerPersonFare,
        booking_details: bookingDetails,
        status_message:
          "Your booking request has been received and is currently under review. We will contact you soon to confirm and share next steps.",
      },
      {
        publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY!,
      }
    );
    console.log("Confirmation email sent successfully:", result);
    alert("Confirmation email sent successfully!");
  } catch (error) {
    const extractErrorText = (e: unknown): string => {
      if (!e) return "Unknown error";
      if (typeof e === "string") return e;
      if (e instanceof Error) return e.message;
      if (typeof e === "object" && e !== null) {
        const r = e as Record<string, unknown>;
        const maybe = r["text"] ?? r["message"];
        if (typeof maybe === "string") return maybe;
      }
      return "Unknown error";
    };

    console.error("Failed to send confirmation email:", error);
    alert(`Failed to send confirmation email: ${extractErrorText(error)}`);
  }
};

// Send Welcome/Pending email for newly created shared ride
const sendWelcomeEmail = async (
  bookingData?: BookingData | null,
  personalData?: PersonalData | null
) => {
  try {
    if (!personalData || !bookingData) return;
    const subject =
      bookingData.rideType === "personal"
        ? "🚖 Thanks! Your personal ride request is under review"
        : "🚖 Thanks! Your shared ride request is under review";
    await emailjs.send(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID!,
      process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID!,
      {
        to_email: personalData.email,
        subject,
        name: personalData.fullName || "",
        from: bookingData.from || "",
        to: bookingData.to || "",
        taxi_type: bookingData.rideType || "shared",
        date: bookingData.date || "",
        time: bookingData.time || "",
        passengers: personalData.seatCount || "",
        status_message:
          "Your booking request has been received and is currently under review. We will contact you soon to confirm and share next steps.",
      },
      { publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY! }
    );
    console.log("Welcome (under review) email sent");
  } catch (error) {
    console.error("Failed to send welcome email:", error);
  }
};

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

interface PersonalData {
  fullName: string;
  email: string;
  phone: string;
  emergencyContact?: string;
  specialRequests: string;
  seatCount: number | string;
}

interface RideData {
  id: number;
  driver: {
    name: string;
    image: string;
  };
  
  
  vehicle: string;
  pickup: {
    location: string;
    type: string;
  };
  destination: {
    location: string;
    type: string;
  };
  time: string;
  duration: string;
  seats: {
    available: number;
    total: number;
  };
  price: string;
  distanceKm?: number;
}

interface PaymentDetailsPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onBack?: () => void;
  bookingData?: BookingData | null;
  personalData?: PersonalData | null;
  rideData?: RideData | null;
  selectedSeats?: number | null;
  onUpdateSeats?: (rideId: number, seatsBooked: number) => void;
}

export function PaymentDetailsPopup({
  isOpen,
  onClose,
  onBack,
  bookingData,
  personalData,
  rideData,
  selectedSeats,
  onUpdateSeats,
}: PaymentDetailsPopupProps) {
  console.log("PaymentDetailsPopup props:", {
    isOpen,
    bookingData,
    personalData,
    rideData,
    selectedSeats,
    onUpdateSeats,
  });

  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState("");
  const [bookingInProgress, setBookingInProgress] = useState(false);

  // Admin notification email (centralized) — avoid sending duplicate notifications
  const ADMIN_NOTIFICATION_EMAIL = "therath2426@gmail.com";
  // Constant total seats for vehicles; entered seat count is how many seats the user is booking
  const TOTAL_SEATS = 10;

  // Helper to send one customer confirmation and one optional admin notification
  const sendBookingNotifications = async (opts: {
    customerArgs: unknown[];
    adminSubject?: string;
    adminEmail?: string;
    skipCustomer?: boolean;
  }) => {
    const { customerArgs, adminSubject, adminEmail, skipCustomer } = opts;

    if (!skipCustomer) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (sendConfirmationEmail as any)(...customerArgs);
      } catch (err) {
        console.error("Failed sending customer confirmation:", err);
      }
    }

    try {
      const custEmail = (personalData?.email || "").toLowerCase();
      const admin = (adminEmail || ADMIN_NOTIFICATION_EMAIL || "").toLowerCase();
      if (admin && admin !== custEmail) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (sendConfirmationEmail as any)(
          ...customerArgs,
          adminSubject || "[Admin] New Booking Request",
          admin
        );
      }
    } catch (err) {
      console.warn("Admin notification failed (non-blocking):", err);
    }
  };

  // Wrapper that prevents duplicate customer emails for the same booking context
  const sendBookingNotificationsOnce = async (opts: {
    customerArgs: unknown[];
    adminSubject?: string;
    adminEmail?: string;
  }) => {
    const { customerArgs } = opts;
    try {
      const custEmail = (personalData?.email || "").toLowerCase();
      const seats = (customerArgs && customerArgs.length >= 6 && typeof customerArgs[5] !== 'undefined')
        ? String(customerArgs[5])
        : "";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const fromLoc = bookingData?.from || (rideData as any)?.pickup?.location || "";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const toLoc = bookingData?.to || (rideData as any)?.destination?.location || "";
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const when = bookingData?.date || (rideData as any)?.time || "";
      const contextHash = `${fromLoc}::${toLoc}::${when}::${seats}`.toLowerCase();

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const w = window as any;
        if (!w.__lastBookingEmailSent) w.__lastBookingEmailSent = {};
        const entry = w.__lastBookingEmailSent[custEmail];
        const now = Date.now();
        if (entry && entry.contextHash === contextHash && now - entry.when < 15000) {
          // recent send for same context — skip customer send, but allow admin
          console.log("Skipping duplicate customer email; sending admin only", {
            custEmail,
            contextHash,
          });
          await sendBookingNotifications({ ...opts, skipCustomer: true });
          return;
        }
        // Not a duplicate — send normally and record it
        await sendBookingNotifications(opts);
        w.__lastBookingEmailSent[custEmail] = { when: now, contextHash };
      } catch (e) {
        // Best-effort fallback: send normally
        await sendBookingNotifications(opts);
      }
    } catch (err) {
      // If anything goes wrong preparing the context, fall back to normal send
      await sendBookingNotifications(opts);
    }
  };

  // Validation state
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  // submit attempt flag removed (was unused)

  // Validation functions
  const validateBookingData = () => {
    console.log("Validating booking data - personalData:", personalData);
    console.log("Validating booking data - isJoinRideFlow:", isJoinRideFlow);
    console.log("Validating booking data - selectedSeats:", selectedSeats);
    const errors: string[] = [];

    // Check if basic data exists
    if (!personalData) {
      errors.push("Personal information is required to complete booking.");
      return errors;
    }

    // Validate required personal data
    if (!personalData.fullName?.trim()) {
      errors.push("Full name is required");
    } else if (personalData.fullName.length < 2) {
      errors.push("Full name must be at least 2 characters long");
    } else if (personalData.fullName.length > 100) {
      errors.push("Full name cannot exceed 100 characters");
    } else if (!/^[a-zA-Z\s\-']+$/.test(personalData.fullName.trim())) {
      errors.push(
        "Full name can only contain letters, spaces, hyphens, and apostrophes"
      );
    }

    // Email validation
    if (!personalData.email?.trim()) {
      errors.push("Email address is required");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalData.email.trim())) {
      errors.push("Please enter a valid email address");
    } else if (personalData.email.length > 254) {
      errors.push("Email address is too long");
    }

    // Phone validation
    if (!personalData.phone?.trim()) {
      errors.push("Phone number is required");
    } else if (!/^\d{8,10}$/.test(personalData.phone.trim())) {
      errors.push("Phone number must be 8-10 digits");
    }

    // Special Requests validation (optional, but reasonable length)
    if (
      personalData.specialRequests &&
      personalData.specialRequests.length > 500
    ) {
      errors.push("Special requests cannot exceed 500 characters");
    }

    // Seat count validation
    const seatCount = isJoinRideFlow
      ? selectedSeats || 1
      : parseInt(String(personalData.seatCount || "1"), 10);
    console.log(
      "Seat count validation - seatCount:",
      seatCount,
      "selectedSeats:",
      selectedSeats,
      "personalData.seatCount:",
      personalData.seatCount
    );
    if (!seatCount || seatCount < 1 || seatCount > TOTAL_SEATS) {
      errors.push(`Seat count must be between 1 and ${TOTAL_SEATS}`);
    }

    // If this is a join-ride flow, ensure we don't allow booking more seats than available
    if (isJoinRideFlow && rideData) {
      const available =
        typeof (rideData.seats && rideData.seats.available) === "number"
          ? Number(rideData.seats.available)
          : 0;
      if (available <= 0) {
        errors.push("No seats are available for this ride");
      } else if (seatCount > available) {
        errors.push(
          `Only ${available} seat${
            available > 1 ? "s" : ""
          } available for this ride`
        );
      }
    }

    console.log("Validation completed - errors:", errors);

    // Location and type validation for regular bookings
    if (!isJoinRideFlow) {
      if (!bookingData) {
        errors.push(
          "Booking data is missing. Please go back and complete the booking form."
        );
        return errors;
      }

      if (!bookingData.from?.trim()) {
        errors.push("Pickup location (From) is required");
      }
      if (!bookingData.to?.trim()) {
        errors.push("Destination (To) is required");
      }
      if (!bookingData.date?.trim()) {
        errors.push("Pickup date is required");
      }
      if (!bookingData.time?.trim()) {
        errors.push("Pickup time is required");
      }
      if (!bookingData.rideType?.trim()) {
        errors.push("Ride type (shared/personal) is required");
      }
      if (!bookingData.tripType?.trim()) {
        errors.push("Trip type (one-way/round-trip/multi-city) is required");
      }
      if (
        !bookingData.calculatedFare ||
        bookingData.calculatedFare.includes("⚠️")
      ) {
        errors.push(
          "Please calculate the fare before proceeding with the booking"
        );
      }
    }

    return errors;
  };

  // Assigned driver data could be provided later by backend

  // Helper function to extract numeric price from calculatedFare HTML
  const extractNumericPrice = (calculatedFareHtml?: string): string => {
    if (!calculatedFareHtml) return `${PER_SEAT_RATE_USD}.00`;
    
    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = calculatedFareHtml;
    
    // Extract the per-person fare (green text) - this is what we want for PER_SEAT_RATE_USD
    const perPersonElement = tempDiv.querySelector('[style*="color:green"]');
    if (perPersonElement) {
      const priceText = perPersonElement.textContent || "";
      // Remove $ and any extra whitespace, keep only the numeric value
      const numericPrice = priceText.replace(/[$\s]/g, "");
      return numericPrice || `${PER_SEAT_RATE_USD}.00`;
    }
    
    // If no per-person fare found, return default
    return `${PER_SEAT_RATE_USD}.00`;
  };

  const addUserSharedRide = useCallback(async (opts?: { sendWelcome?: boolean } ) => {
    if (!bookingData || !personalData || bookingData.rideType !== "shared")
      return null;

    const sendWelcome = opts?.sendWelcome ?? true;

    const seatCount = parseInt(String(personalData.seatCount || "1"), 10);
    // seatCount represents seats the user is booking. Use TOTAL_SEATS as vehicle capacity.
    const totalSeats = TOTAL_SEATS;
    const availableSeats = Math.max(0, totalSeats - seatCount);

    const newRide = {
      id: Date.now(),
      timeAgo: "Just now",
      pickupDate: bookingData.date || "",

      postedDate: new Date(),
      frequency: "one-time",
      driver: {
        name: personalData.fullName || "User Driver",
        image: "/professional-driver-headshot.jpg",
      },
      vehicle: "Assigned Vehicle",
      pickup: {
        location: bookingData.from || "",
        type: "Pickup point",
      },
      destination: {
        location: bookingData.to || "",
        type: "Destination",
      },
      time: bookingData.time || "",
      duration: bookingData.mapDuration || "45 min",
      seats: {
        available: availableSeats,
        total: totalSeats,
      },
      price: extractNumericPrice(bookingData.calculatedFare),
      // persist contact info so admin can contact the user who created the ride
      customerEmail: personalData.email,
      customerPhone: personalData.phone,
      customerName: personalData.fullName,
      // keep original booking + personal data for admin inspection
      rawPayload: { bookingData, personalData },
    };

    // POST new shared ride to backend instead of localStorage
    try {
      const res = await fetch(
        "http://localhost:5000/api/shared-rides",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newRide),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error(
          "Failed to create shared ride on server:",
          res.status,
          text
        );
        return null;
      }

      const data = await res.json();
      // Send welcome/under-review email automatically unless caller opted out
      try {
        if (sendWelcome) await sendWelcomeEmail(bookingData, personalData);
      } catch {}
      // Dispatch event to notify other components
      try {
        window.dispatchEvent(
          new CustomEvent("userRideAdded", { detail: data })
        );
      } catch {}
      try {
        window.dispatchEvent(new CustomEvent("rideBooked", { detail: data }));
      } catch {}
      return data;
    } catch (error) {
      console.error("Error adding user shared ride:", error);
      return null;
    }
  }, [bookingData, personalData]);

  const addUserPersonalRide = useCallback(async (opts?: { sendWelcome?: boolean }) => {
    if (!bookingData || !personalData || bookingData.rideType !== "personal")
      return null;

    const sendWelcome = opts?.sendWelcome ?? true;

    const seatCount = parseInt(String(personalData.seatCount || "1"), 10);
    // Use TOTAL_SEATS for personal rides as well to keep capacity consistent
    const totalSeats = TOTAL_SEATS;
    const availableSeats = Math.max(0, totalSeats - seatCount);

    const newRide = {
      id: Date.now(),
      timeAgo: "Just now",
      pickupDate: bookingData.date || "",
      postedDate: new Date(),
      frequency: "one-time",
      driver: {
        name: personalData.fullName || "User Driver",
        image: "/professional-driver-headshot.jpg",
      },
      vehicle: "Assigned Vehicle",
      pickup: {
        location: bookingData.from || "",
        type: "Pickup point",
      },
      destination: {
        location: bookingData.to || "",
        type: "Destination",
      },
      time: bookingData.time || "",
      duration: bookingData.mapDuration || "45 min",
      seats: {
        available: availableSeats,
        total: totalSeats,
      },
      price: extractNumericPrice(bookingData.calculatedFare),
      customerEmail: personalData.email,
      customerPhone: personalData.phone,
      customerName: personalData.fullName,
      rawPayload: { bookingData, personalData },
    };

    // POST new personal ride to backend instead of localStorage
    try {
      const res = await fetch(
        "http://localhost:5000/api/personal-rides",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newRide),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        console.error(
          "Failed to create personal ride on server:",
          res.status,
          text
        );
        return null;
      }

      const data = await res.json();
      // Send welcome/under-review email automatically (same as shared)
      try {
        if (sendWelcome) await sendWelcomeEmail(bookingData, personalData);
      } catch {}
      // Dispatch event to notify other components
      try {
        window.dispatchEvent(
          new CustomEvent("userRideAdded", { detail: data })
        );
      } catch {}
      try {
        window.dispatchEvent(new CustomEvent("rideBooked", { detail: data }));
      } catch {}
      return data;
    } catch (error) {
      console.error("Error adding user personal ride:", error);
      return null;
    }
  }, [bookingData, personalData]);

  if (!isOpen || (!bookingData && !personalData && !rideData)) return null;

  const isJoinRideFlow = !!rideData;

  // Function to persist booked ride to backend (replaces localStorage)
  const saveBookedRide = async () => {
    if (!personalData) return null;

    // Build booked ride either from bookingData (regular flow) or rideData (join flow)
    let bookedRide: Record<string, unknown>;

    if (bookingData) {
      bookedRide = {
        id: Date.now(),
        timeAgo: "Just now",
        postedDate: new Date(),
        frequency: "one-time",
        driver: {
          name: personalData.fullName,
          image: "/placeholder-user.jpg",
        },
        vehicle:
          bookingData.rideType === "shared"
            ? "Shared Vehicle"
            : "Private Vehicle",
        pickup: {
          location: bookingData.from || "N/A",
          type: "Pickup point",
        },
        destination: {
          location: bookingData.to || "N/A",
          type: "Destination",
        },
        time: bookingData.time || "N/A",
        duration: bookingData.mapDuration || "TBD",
        seats: {
          // For regular (non-join) booking flow, `passengers` is how many seats the user booked.
          // Represent stored seats as { available: TOTAL_SEATS - bookedSeats, total: TOTAL_SEATS }
          available:
            bookingData.rideType === "shared"
              ? Math.max(0, TOTAL_SEATS - parseInt(String(personalData.seatCount || "1")))
              : 0,
          total:
            bookingData.rideType === "shared"
              ? TOTAL_SEATS
              : 1,
        },
        price: bookingData.calculatedFare ? "Calculated" : "$15.00",
        bookingId: `Ref-${Date.now()}`,
        customerEmail: personalData.email,
        customerPhone: personalData.phone,
        specialRequests: personalData.specialRequests || "None",
        // include both booking and personal data so admin can inspect contact info
        rawPayload: { bookingData, personalData },
      };
    } else if (rideData) {
      // join-ride flow: construct from rideData + personalData + selectedSeats
      const seatsRequested =
        selectedSeats || parseInt(String(personalData.seatCount || "1"), 10);
      bookedRide = {
        id: Date.now(),
        timeAgo: "Just now",
        postedDate: new Date(),
        frequency: "one-time",
        driver: rideData.driver || {
          name: personalData.fullName,
          image: "/placeholder-user.jpg",
        },
        vehicle: rideData.vehicle || "Shared Vehicle",
        pickup: rideData.pickup || { location: "N/A", type: "Pickup point" },
        destination: rideData.destination || {
          location: "N/A",
          type: "Destination",
        },
        time: rideData.time || "N/A",
        duration: rideData.duration || "TBD",
        seats: {
          available: Math.max(
            0,
            (rideData.seats?.available || 0) - seatsRequested
          ),
          total: rideData.seats?.total || seatsRequested,
        },
        price:
          rideData.price ||
          formatPriceUSD(calculateProgressiveSharedTotal(seatsRequested)),
        bookingId: `Ref-${Date.now()}`,
        customerEmail: personalData.email,
        customerPhone: personalData.phone,
        specialRequests: personalData.specialRequests || "None",
        // include personalData with join-ride payload so admin sees contact info
        rawPayload: { rideId: rideData.id, seatsRequested, personalData },
      };
    } else {
      return null;
    }

    try {
      // Choose endpoint based on ride type: personal rides go to /api/personal-rides
      const endpoint =
        bookingData && bookingData.rideType === "personal"
          ? "http://localhost:5000/api/personal-rides"
          : "http://localhost:5000/api/shared-rides";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookedRide),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error(
          "Failed to save booked ride to server:",
          res.status,
          text
        );
        return null;
      }

      const data = await res.json();
      try {
        window.dispatchEvent(new CustomEvent("rideBooked", { detail: data }));
      } catch {}
      return data;
    } catch (err) {
      console.error("Error saving booked ride to server:", err);
      return null;
    }
  };

  const handleEmailBooking = async () => {

    // Set submit attempt flag (tracked via validationErrors state)

    // Run validation
    const errors = validateBookingData();
    setValidationErrors(errors);

    // Stop if validation failed
    if (errors.length > 0) {
      console.log("Validation errors:", errors);
      return;
    }

    // Clear any previous errors
    setValidationErrors([]);

    // Always create the ride record first for shared/personal when not a join flow
    // If creation succeeds, we avoid calling saveBookedRide() later to prevent duplicates
    let createdRide: unknown | null = null;
    if (!isJoinRideFlow && bookingData?.rideType === "shared") {
      // When creating a ride as part of this booking flow, avoid sending the
      // separate welcome/under-review email here — the booking confirmation
      // will be sent later by the centralized helper.
      createdRide = await addUserSharedRide({ sendWelcome: false });
      if (createdRide === null) return;
    }
    if (!isJoinRideFlow && bookingData?.rideType === "personal") {
      createdRide = await addUserPersonalRide({ sendWelcome: false });
      if (createdRide === null) return;
    }

    // booking details are assembled per-flow when needed (WhatsApp/email templates)

    if (isJoinRideFlow) {
      // For shared rides, simulate booking success, update seats, show confirmation
      console.log(
        "Email booking - onUpdateSeats:",
        onUpdateSeats,
        "rideData:",
        rideData,
        "selectedSeats:",
        selectedSeats
      );
      if (rideData && personalData) {
        const seatsToBook =
          selectedSeats ||
          parseInt(String(personalData.seatCount || "1"), 10) ||
          1;

        // Fetch latest ride to get authoritative availability just before booking
        let baselineAvailable = typeof (rideData.seats && rideData.seats.available) === "number" ? Number(rideData.seats.available) : 0;
        let baselineTotal = typeof (rideData.seats && rideData.seats.total) === "number" ? Number(rideData.seats.total) : TOTAL_SEATS;
        try {
          const latestRes = await fetch(`http://localhost:5000/api/shared-rides/${rideData.id}`);
          if (latestRes.ok) {
            const latestJson = await latestRes.json();
            const latestSeats = (latestJson && latestJson.seats) ? latestJson.seats : undefined;
            baselineAvailable = typeof latestSeats?.available === 'number' ? Number(latestSeats.available) : baselineAvailable;
            baselineTotal = typeof latestSeats?.total === 'number' ? Number(latestSeats.total) : baselineTotal;
            if (seatsToBook > baselineAvailable) {
              setValidationErrors([`Only ${baselineAvailable} seat${baselineAvailable !== 1 ? 's' : ''} available for this ride — please reduce your request.`]);
              return;
            }
          }
        } catch {
          // ignore and continue using rideData as baseline
        }

        setBookingInProgress(true);
        try {

          // Send the requested seats (delta) to the backend. The backend
          // transaction will validate and decrement availability atomically.
          const res = await fetch(
            `http://localhost:5000/api/shared-rides/${rideData.id}/book`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                passengerName: personalData.fullName,
                passengerPhone: personalData.phone,
                seatsBooked: seatsToBook,
              }),
            }
          );
          try {
            const latestRes = await fetch(`http://localhost:5000/api/shared-rides/${rideData.id}`);
            if (latestRes.ok) {
              const latestJson = await latestRes.json();
              const latestSeats = (latestJson && latestJson.seats) ? latestJson.seats : undefined;
              const latestAvailable = typeof latestSeats?.available === 'number' ? Number(latestSeats.available) : (rideData.seats?.available || 0);
              if (seatsToBook > latestAvailable) {
                setValidationErrors([`Only ${latestAvailable} seat${latestAvailable !== 1 ? 's' : ''} available for this ride — please reduce your request.`]);
                setBookingInProgress(false);
                return;
              }
            }
          } catch {
            // ignore - proceed with current data if fetch fails
          }
          const result = await res.json();

          // Post-booking verification: compute expectedAvailable from the
          // baseline we fetched just before booking and reconcile if needed.
          try {
            const latestAfterRes = await fetch(`http://localhost:5000/api/shared-rides/${rideData.id}`);
            if (latestAfterRes.ok) {
              const latestAfterJson = await latestAfterRes.json();
              const serverSeats = latestAfterJson?.seats;
              const serverAvailable = typeof serverSeats?.available === 'number' ? Number(serverSeats.available) : undefined;
              const serverTotal = typeof serverSeats?.total === 'number' ? Number(serverSeats.total) : baselineTotal;
              const expectedAvailable = Math.max(0, baselineAvailable - seatsToBook);

              if (typeof serverAvailable === 'number' && serverAvailable !== expectedAvailable) {
                // Attempt to correct server value (best-effort). Use PUT to update seats.
                try {
                  await fetch(`http://localhost:5000/api/shared-rides/${rideData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    // backend expects top-level availableSeats/totalSeats fields
                    body: JSON.stringify({ availableSeats: expectedAvailable, totalSeats: serverTotal }),
                  });
                } catch {
                  // ignore patch errors; proceed
                }
                // refresh authoritative result
                try {
                  const refreshed = await fetch(`http://localhost:5000/api/shared-rides/${rideData.id}`);
                  if (refreshed.ok) {
                    const refreshedJson = await refreshed.json();
                    if (onUpdateSeats) onUpdateSeats(rideData.id, seatsToBook);
                    try { window.dispatchEvent(new CustomEvent('rideBooked', { detail: refreshedJson })); } catch {}
                  } else {
                    if (onUpdateSeats) onUpdateSeats(rideData.id, seatsToBook);
                    try { window.dispatchEvent(new CustomEvent('rideBooked', { detail: latestAfterJson })); } catch {}
                  }
                } catch {
                  if (onUpdateSeats) onUpdateSeats(rideData.id, seatsToBook);
                  try { window.dispatchEvent(new CustomEvent('rideBooked', { detail: latestAfterJson })); } catch {}
                }
              } else {
                // Server value matches expectation; notify UI normally
                if (onUpdateSeats) onUpdateSeats(rideData.id, seatsToBook);
                try { window.dispatchEvent(new CustomEvent('rideBooked', { detail: latestAfterJson })); } catch {}
              }
            } else {
              // Couldn't fetch authoritative ride; fall back to notifying UI using result
              if (onUpdateSeats) onUpdateSeats(rideData.id, seatsToBook);
              try { window.dispatchEvent(new CustomEvent('rideBooked', { detail: result })); } catch {}
            }
          } catch {
            // Non-blocking: on any error, notify UI with the original result
            if (onUpdateSeats) onUpdateSeats(rideData.id, seatsToBook);
            try { window.dispatchEvent(new CustomEvent('rideBooked', { detail: result })); } catch {}
          }

          // Dispatch event for other listeners
          try {
            window.dispatchEvent(
              new CustomEvent("rideBooked", { detail: result })
            );
          } catch {}

          // Prepare and open email links and confirmation as before
          const extractedSeats = seatsToBook;

          // Compute per-person and total prices for join flow.
          let perPersonNum = NaN;
          const rawRidePrice = (rideData as unknown as Record<string, unknown>)?.["price"];
          if (rawRidePrice !== undefined && rawRidePrice !== null && String(rawRidePrice).trim() !== "") {
            perPersonNum = Number(String(rawRidePrice).replace(/[^0-9.]/g, ""));
          }

          let totalNum: number;
          if (!isNaN(perPersonNum) && perPersonNum > 0) {
            totalNum = perPersonNum * seatsToBook;
          } else {
            totalNum = calculateProgressiveSharedTotal(seatsToBook);
            perPersonNum = totalNum / seatsToBook;
          }

          const formattedTotal = formatPriceUSD(totalNum);
          const formattedPerPerson = formatPriceUSD(perPersonNum);

          // Build date/time using rawPayload when available for email too
          {
            const raw = (rideData as unknown as Record<string, unknown>)?.["rawPayload"] as
              | Record<string, unknown>
              | undefined;
            const rawRideDate = typeof raw?.["rideDate"] === "string" ? (raw?.["rideDate"] as string) : undefined;
            const rawPickupTime = typeof raw?.["pickupTime"] === "string" ? (raw?.["pickupTime"] as string) : undefined;
            const rawAmPm = typeof raw?.["ampm"] === "string" ? (raw?.["ampm"] as string) : undefined;
            let emailDisplayDate = rawRideDate || "N/A";
            let emailDisplayTime = rawPickupTime ? (rawAmPm ? `${rawPickupTime} ${rawAmPm}` : rawPickupTime) : "N/A";
            if ((emailDisplayDate === "N/A" || emailDisplayTime === "N/A") && rideData?.time) {
              const timeString = rideData.time.trim();
              if (emailDisplayDate === "N/A") {
                if (timeString.includes(",") || timeString.includes("/") || timeString.includes("-")) {
                  const timeParts = timeString.split(" ");
                  if (timeParts.length >= 3) {
                    const timeIndex = timeParts.findIndex(
                      (part) =>
                        part.includes(":") ||
                        part.includes("AM") ||
                        part.includes("PM") ||
                        part.includes("am") ||
                        part.includes("pm")
                    );
                    emailDisplayDate = timeIndex > 0 ? timeParts.slice(0, timeIndex).join(" ") : timeParts.slice(0, 3).join(" ");
                  } else {
                    emailDisplayDate = new Date().toLocaleDateString();
                  }
                } else {
                  emailDisplayDate = new Date().toLocaleDateString();
                }
              }
              if (emailDisplayTime === "N/A") {
                if (timeString.includes(",") || timeString.includes("/") || timeString.includes("-")) {
                  const timeParts = timeString.split(" ");
                  if (timeParts.length >= 3) {
                    const timeIndex = timeParts.findIndex(
                      (part) =>
                        part.includes(":") ||
                        part.includes("AM") ||
                        part.includes("PM") ||
                        part.includes("am") ||
                        part.includes("pm")
                    );
                    emailDisplayTime = timeIndex > 0 ? timeParts.slice(timeIndex).join(" ") : timeParts.slice(3).join(" ");
                  } else {
                    emailDisplayTime = timeString;
                  }
                } else {
                  emailDisplayTime = timeString;
                }
              }
            }
            // Use EmailJS for notifications; no client mailto fallback here.

            await sendBookingNotificationsOnce({
              customerArgs: [
                bookingData,
                personalData,
                rideData,
                true,
                seatsToBook,
                extractedSeats,
                formattedTotal,
                formattedPerPerson,
              ],
            });
          }

          setConfirmationMessage(
            `Your booking request has been sent via Email! We will contact you soon to confirm your ride. Route ${bookingData?.from || "Unknown"} to ${bookingData?.to || "Unknown"}. Date ${bookingData?.date || "Unknown"}. Time ${bookingData?.time || "Unknown"}. Type: ${bookingData?.rideType || "Unknown"}. personal Details Name: ${personalData?.fullName || "Unknown"}  Email : ${personalData?.email || "Unknown"} phone : ${personalData?.phone || "Unknown"} Seats: ${seatsToBook} Thank you!`
          );
          setShowConfirmation(true);

          // Close the form after successful booking and refresh the page
          setTimeout(() => {
            onClose();
            window.location.reload();
          }, 2000);
        } catch (error) {
          setBookingInProgress(false);
          console.error("Error booking shared ride:", error);
          setValidationErrors([
            `Error booking seat: ${
              error instanceof Error ? error.message : String(error)
            }`,
          ]);
          return;
        }
      }
    } else {
      // const rideTypeFormatted = bookingData?.rideType ? bookingData.rideType.charAt(0).toUpperCase() + bookingData.rideType.slice(1) : "N/A"
      // const tripTypeFormatted = bookingData?.tripType ? bookingData.tripType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : "N/A"

      // const subject = `Taxi Booking Request - ${bookingData?.from || "Unknown"} to ${bookingData?.to || "Unknown"}`

      // Extract price from calculated fare HTML - prioritize total price (blue) over per-person (green)
      let priceText = "Price not calculated";
      if (bookingData?.calculatedFare) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = bookingData.calculatedFare;
        // First try to get the total price (blue), then fallback to per-person (green)
        const totalElement = tempDiv.querySelector('[style*="color:blue"]');
        const perPersonElement = tempDiv.querySelector(
          '[style*="color:green"]'
        );
        if (totalElement) {
          priceText = totalElement.textContent || "Price not available";
        } else if (perPersonElement) {
          priceText = perPersonElement.textContent || "Price not available";
        }
      } else {
        // Fallback to calculated price if no fare calculator was used
        const calc = getCalculatedPrice();
        priceText = formatPriceUSD(calc.total);
      }

      // Email templates will build the booking summary; no client-side
      // bookingDetails string is required here.

      // Send confirmation email to customer immediately
      const regularSeats = parseInt(String(personalData?.seatCount || "1"), 10);
      const regularTotal = priceText;
      let regularPerPersonFare = "N/A";

      // For shared rides, extract per person fare
      if (bookingData?.rideType === "shared" && bookingData?.calculatedFare) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = bookingData.calculatedFare;
        const perPersonElement = tempDiv.querySelector(
          '[style*="color:green"]'
        );
        if (perPersonElement)
          regularPerPersonFare = perPersonElement.textContent || "N/A";
      } else if (bookingData?.rideType !== "shared") {
        regularPerPersonFare = priceText; // For personal rides, total and per person are the same
      }

      // await sendBookingNotifications({
      //   customerArgs: [
      //     bookingData,
      //     personalData,
      //     rideData,
      //     false,
      //     selectedSeats,
      //     regularSeats,
      //     regularTotal,
      //     regularPerPersonFare,
      //   ],
      //   adminSubject: "[Admin] New Booking Request",
      //   adminEmail: "therath2426@gmail.com",
      // });

      // Persist booked ride unless we already created the ride above
      if (!createdRide) {
        await saveBookedRide();
      }

      // Show confirmation and close form after successful booking
      setConfirmationMessage(
            `Your booking request has been sent via Email! We will contact you soon to confirm your ride. Route ${bookingData?.from || "Unknown"} to ${bookingData?.to || "Unknown"}. Date ${bookingData?.date || "Unknown"}. Time ${bookingData?.time || "Unknown"}. Type: ${bookingData?.rideType || "Unknown"}. personal Details Name: ${personalData?.fullName || "Unknown"}  Email : ${personalData?.email || "Unknown"} phone : ${personalData?.phone || "Unknown"}  Thank you!`
          );
      setShowConfirmation(true);

      // Close the form after successful booking and refresh the page
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);
    }
  };

  const handleWhatsAppBooking = async () => {
    console.log("WhatsApp booking clicked - isJoinRideFlow:", isJoinRideFlow);
    console.log("WhatsApp booking clicked - rideData:", rideData);
    console.log("WhatsApp booking clicked - personalData:", personalData);
    console.log("WhatsApp booking clicked - selectedSeats:", selectedSeats);

    // Set submit attempt flag (tracked via validationErrors state)

    // Run validation
    const errors = validateBookingData();
    setValidationErrors(errors);

    // Stop if validation failed
    if (errors.length > 0) {
      console.log("Validation errors:", errors);
      return;
    }

    // Clear any previous errors
    setValidationErrors([]);

    // Always call addUserSharedRide if this is a shared ride booking, regardless of join flow
    if (bookingData?.rideType === "shared" && !isJoinRideFlow) {
      const created = await addUserSharedRide({ sendWelcome: false });
      if (created === null) return;
    }
    if (bookingData?.rideType === "personal" && !isJoinRideFlow) {
      const created = await addUserPersonalRide({ sendWelcome: false });
      if (created === null) return;
    }

    let bookingDetails = "";

    if (isJoinRideFlow) {
      // For shared rides, simulate booking success, update seats, show confirmation
      console.log(
        "WhatsApp booking - onUpdateSeats:",
        onUpdateSeats,
        "rideData:",
        rideData,
        "selectedSeats:",
        selectedSeats
      );
      if (rideData && personalData) {
        const seatsToBook =
          selectedSeats ||
          parseInt(String(personalData.seatCount || "1"), 10) ||
          1;

        try {
          // Call backend booking endpoint
          // Re-check latest availability before booking to avoid races
          try {
            const latestRes = await fetch(`http://localhost:5000/api/shared-rides/${rideData.id}`);
            if (latestRes.ok) {
              const latestJson = await latestRes.json();
              const latestSeats = (latestJson && latestJson.seats) ? latestJson.seats : undefined;
              const latestAvailable = typeof latestSeats?.available === 'number' ? Number(latestSeats.available) : (rideData.seats?.available || 0);
              if (seatsToBook > latestAvailable) {
                setValidationErrors([`Only ${latestAvailable} seat${latestAvailable !== 1 ? 's' : ''} available for this ride — please reduce your request.`]);
                return;
              }
            }
          } catch {
            // ignore and proceed with current data
          }

          const res = await fetch(
            `http://localhost:5000/api/shared-rides/${rideData.id}/book`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                passengerName: personalData.fullName,
                passengerPhone: personalData.phone,
                seatsBooked: seatsToBook,
              }),
            }
          );

          if (!res.ok) {
            let errText = await res.text();
            try {
              const json = JSON.parse(errText);
              errText = json.message || JSON.stringify(json);
            } catch {}
            console.error("Booking API failed:", res.status, errText);
            setValidationErrors([`Failed to book seat: ${errText}`]);
            return;
          }

          const result = await res.json();

          // Notify parent/UI to update seats
          if (onUpdateSeats) onUpdateSeats(rideData.id, seatsToBook);

          // Dispatch event for other listeners
          try {
            window.dispatchEvent(
              new CustomEvent("rideBooked", { detail: result })
            );
          } catch {}

          // Prepare WhatsApp message
          const whatsappSeats = seatsToBook;
          
          // Calculate correct price from rideData.price for WhatsApp
          const whatsappPricePerPerson = parseFloat(rideData?.price.replace(/[^0-9.]/g, '') || "0") || 0;
          const whatsappTotalPrice = whatsappPricePerPerson * seatsToBook;
          const whatsappTotal = formatPriceUSD(whatsappTotalPrice);
          const whatsappPerPersonFare = formatPriceUSD(whatsappPricePerPerson);

          // Prefer rawPayload date/time when available; fallback to rideData.time parsing
          let displayDate = "N/A";
          let displayTime = "N/A";
          const raw = (rideData as unknown as Record<string, unknown>)?.["rawPayload"] as
            | Record<string, unknown>
            | undefined;
          const rawRideDate = typeof raw?.["rideDate"] === "string" ? (raw?.["rideDate"] as string) : undefined;
          const rawPickupTime = typeof raw?.["pickupTime"] === "string" ? (raw?.["pickupTime"] as string) : undefined;
          const rawAmPm = typeof raw?.["ampm"] === "string" ? (raw?.["ampm"] as string) : undefined;

          if (rawRideDate) displayDate = rawRideDate;
          if (rawPickupTime) displayTime = rawAmPm ? `${rawPickupTime} ${rawAmPm}` : rawPickupTime;

          if ((displayDate === "N/A" || displayTime === "N/A") && rideData?.time) {
            const timeString = rideData.time.trim();
            if (displayDate === "N/A") {
              if (timeString.includes(",") || timeString.includes("/") || timeString.includes("-")) {
                const timeParts = timeString.split(" ");
                if (timeParts.length >= 3) {
                  const timeIndex = timeParts.findIndex(
                    (part) =>
                      part.includes(":") ||
                      part.includes("AM") ||
                      part.includes("PM") ||
                      part.includes("am") ||
                      part.includes("pm")
                  );
                  displayDate = timeIndex > 0 ? timeParts.slice(0, timeIndex).join(" ") : timeParts.slice(0, 3).join(" ");
                } else {
                  displayDate = new Date().toLocaleDateString();
                }
              } else {
                displayDate = new Date().toLocaleDateString();
              }
            }
            if (displayTime === "N/A") {
              if (timeString.includes(",") || timeString.includes("/") || timeString.includes("-")) {
                const timeParts = timeString.split(" ");
                if (timeParts.length >= 3) {
                  const timeIndex = timeParts.findIndex(
                    (part) =>
                      part.includes(":") ||
                      part.includes("AM") ||
                      part.includes("PM") ||
                      part.includes("am") ||
                      part.includes("pm")
                  );
                  displayTime = timeIndex > 0 ? timeParts.slice(timeIndex).join(" ") : timeParts.slice(3).join(" ");
                } else {
                  displayTime = timeString;
                }
              } else {
                displayTime = timeString;
              }
            }
          }

          const paymentMethodStr = (() => {
            const maybe = (personalData as unknown as Record<string, unknown>)?.["paymentMethod"];
            return typeof maybe === "string" ? maybe : "N/A";
          })();

          const joinRideDetails = `\nTaxi Booking Request\n\nRoute: ${
            rideData?.pickup?.location || "N/A"
          } → ${rideData?.destination?.location || "N/A"}\nDate: ${displayDate}\nTime: ${displayTime}\nType: Shared, One Way Ride\n\nPersonal Details:\n• Name: ${
            personalData?.fullName || "N/A"
          }\n• Email: ${personalData?.email || "N/A"}\n• Phone: +94${
            personalData?.phone || "N/A"
          }\n• Seats: ${seatsToBook}\n• Payment Method: ${paymentMethodStr}\n\nSpecial Requests: ${
            personalData?.specialRequests || "None"
          }\n\nPrice: ${whatsappTotal} for ${seatsToBook} persons\n\nPlease confirm this booking. Thank you!`.trim();

          const whatsappLink = `https://wa.me/94774018001?text=${encodeURIComponent(
            joinRideDetails
          )}`;
          window.open(whatsappLink, "_blank");

          // Emails are sent via EmailJS; no mailto fallback for customers
            await sendBookingNotificationsOnce({
              customerArgs: [
                bookingData,
                personalData,
                rideData,
                true,
                seatsToBook,
                whatsappSeats,
                whatsappTotal,
                whatsappPerPersonFare,
              ],
              adminSubject: "[Admin] New Join Ride Booking",
            });

         setConfirmationMessage(
            `Your booking request has been sent via Email! We will contact you soon to confirm your ride. Route ${bookingData?.from || "Unknown"} to ${bookingData?.to || "Unknown"}. Date ${bookingData?.date || "Unknown"}. Time ${bookingData?.time || "Unknown"}. Type: ${bookingData?.rideType || "Unknown"}. personal Details Name: ${personalData?.fullName || "Unknown"}  Email : ${personalData?.email || "Unknown"} phone : ${personalData?.phone || "Unknown"} Seats: ${seatsToBook} Thank you!`
          );
          setShowConfirmation(true);

          setTimeout(() => {
            onClose();
            window.location.reload();
          }, 2000);
        } catch (error) {
          console.error("Error booking shared ride:", error);
          setValidationErrors([
            `Error booking seat: ${
              error instanceof Error ? error.message : String(error)
            }`,
          ]);
          return;
        }
      }
    } else {
      // const rideTypeFormatted = bookingData?.rideType ? bookingData.rideType.charAt(0).toUpperCase() + bookingData.rideType.slice(1) : "N/A"
      // const tripTypeFormatted = bookingData?.tripType ? bookingData.tripType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) : "N/A"

      // const subject = `Taxi Booking Request - ${bookingData?.from || "Unknown"} to ${bookingData?.to || "Unknown"}`

      // Extract price from calculated fare HTML - prioritize total price (blue) over per-person (green)
      let priceText = "Price not calculated";
      if (bookingData?.calculatedFare) {
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = bookingData.calculatedFare;
        // First try to get the total price (blue), then fallback to per-person (green)
        const totalElement = tempDiv.querySelector('[style*="color:blue"]');
        const perPersonElement = tempDiv.querySelector(
          '[style*="color:green"]'
        );
        if (totalElement) {
          priceText = totalElement.textContent || "Price not available";
        } else if (perPersonElement) {
          priceText = perPersonElement.textContent || "Price not available";
        }
      } else {
        // Fallback to calculated price if no fare calculator was used
        const calc = getCalculatedPrice();
        priceText = formatPriceUSD(calc.total);
      }

      bookingDetails = `
Taxi Booking Request

Route: ${bookingData?.from || "N/A"} → ${bookingData?.to || "N/A"}
Date: ${bookingData?.date || "N/A"}
Time: ${bookingData?.time || "N/A"}
Type: Shared, One Way Ride

Personal Details:
• Name: ${personalData?.fullName || "N/A"}
• Email: ${personalData?.email || "N/A"}
• Phone: ‪+94${personalData?.phone || "N/A"}‬
• Seats: ${personalData?.seatCount || "N/A"}

Special Requests: ${personalData?.specialRequests || "None"}

Price: $${priceText.replace("$", "")} for ${personalData?.seatCount} persons

Please confirm this booking. Thank you!
      `.trim();

      // Send WhatsApp message
      const whatsappLink = `https://wa.me/94774018001?text=${encodeURIComponent(
        bookingDetails
      )}`;
      window.open(whatsappLink, "_blank");


      // await sendBookingNotifications({
      //   customerArgs: [bookingData, personalData, rideData, false, selectedSeats],
      // });

      // Save the booked ride to backend
      // await saveBookedRide()

      // Show confirmation and close form after successful booking
      setConfirmationMessage(
            `Your booking request has been sent via Email! We will contact you soon to confirm your ride. Route ${bookingData?.from || "Unknown"} to ${bookingData?.to || "Unknown"}. Date ${bookingData?.date || "Unknown"}. Time ${bookingData?.time || "Unknown"}. Type: ${bookingData?.rideType || "Unknown"}. personal Details Name: ${personalData?.fullName || "Unknown"}  Email : ${personalData?.email || "Unknown"} phone : ${personalData?.phone || "Unknown"}  Thank you!`
          );
      setShowConfirmation(true);

      // Close the form after successful booking and refresh the page
      setTimeout(() => {
        onClose();
        window.location.reload();
      }, 2000);
    }
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    onClose(); // Close the payment popup as well
  };

  const getCalculatedPrice = () => {
    if (!bookingData && !rideData)
      return {
        total: 0,
        perSeat: 0,
        seatCost: 0,
        distanceCost: 0,
        subtotal: 0,
        passengersNum: 0,
        seats: 0,
        perKmRate: 0,
        distance: 0,
        tripMult: 0,
      };

    const passengersNum = isJoinRideFlow
      ? rideData?.seats.total || 1 // For shared rides, passenger count for vehicle calculation
      : typeof bookingData?.passengers === "string"
      ? parseInt(bookingData.passengers || "1", 10)
      : bookingData?.passengers || 1;

    const requestedSeats = parseInt(String(personalData?.seatCount || "1"), 10);
    const seats = isJoinRideFlow ? selectedSeats || 0 : requestedSeats;

    const distance = isJoinRideFlow
      ? rideData?.distanceKm || 45 // Default shared distance
      : bookingData?.mapDistance
      ? parseFloat(bookingData.mapDistance)
      : 0;

    let totalPrice;
    const perKmRate = getPerKmRate(passengersNum);
    const tripMult = getTripMultiplier(
      (bookingData?.tripType as "one-way" | "round-trip" | "multi-city") ||
        "one-way"
    );

    const distanceCost = perKmRate * distance;
    const subtotal = distanceCost; // We'll add seat cost separately based on type

    if (isJoinRideFlow) {
      // Progressive pricing for shared ride joins
      const progressiveTotal = calculateProgressiveSharedTotal(seats);
      totalPrice = progressiveTotal;
    } else {
      // const seatCost = PER_SEAT_RATE_USD * seats;
      totalPrice = calculateTotalPrice(
        distance,
        seats,
        passengersNum,
        (bookingData?.tripType as "one-way" | "round-trip" | "multi-city") ||
          "one-way"
      );
    }

    return {
      total: totalPrice,
      perSeat: PER_SEAT_RATE_USD,
      seatCost: isJoinRideFlow
        ? calculateProgressiveSharedTotal(seats)
        : PER_SEAT_RATE_USD * seats,
      distanceCost,
      subtotal,
      perKmRate,
      distance,
      passengersNum,
      seats,
      tripMult,
      isProgressive: isJoinRideFlow,
    };
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <button
              onClick={onBack || onClose}
              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
              title="Back to Personal Details"
            >
              <ArrowLeft className="h-4 w-4 text-gray-600" />
            </button>
            <h2 className="text-2xl font-bold text-gray-900">
              Payment Details
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full border-2 border-gray-300 flex items-center justify-center hover:bg-gray-100"
              title="Close"
            >
              <X className="h-4 w-4 text-gray-600" />
            </button>
          </div>

          <div className="px-6 py-4">
            <div className="flex items-center gap-4">
              <div className="bg-yellow-200 text-gray-600 px-6 py-2 rounded-full font-semibold">
                Personal Details
              </div>
              <div className="flex-1 h-1 bg-gray-300 rounded"></div>
              <div className="bg-yellow-500 text-white px-6 py-2 rounded-full font-semibold">
                Payment
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="bg-yellow-50 rounded-2xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Booking Summary
              </h3>

              <div className="grid grid-cols-2 gap-6 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {isJoinRideFlow
                        ? rideData?.pickup.location
                        : bookingData?.from || "N/A"}
                    </p>
                    <p className="text-gray-600 text-sm">Pickup point</p>
                  </div>
                </div>

                {!(isJoinRideFlow && (rideData as unknown as Record<string, unknown>)?.["frequency"] === 'daily') && (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-blue-400 rounded-full flex items-center justify-center">
                      <Clock className="h-3 w-3 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {isJoinRideFlow
                          ? rideData?.time
                          : bookingData?.time || "N/A"}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {isJoinRideFlow ? rideData?.duration : "45 min"}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                    <MapPin className="h-3 w-3 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {isJoinRideFlow
                        ? rideData?.destination.location
                        : bookingData?.to || "N/A"}
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
                      {isJoinRideFlow
                        ? `${rideData?.seats.available}/${rideData?.seats.total} seats`
                        : `${personalData?.seatCount || "N/A"} seats`}
                    </p>
                    <p className="text-gray-600 text-sm">Available</p>
                  </div>
                </div>
              </div>

              <hr className="border-gray-200 my-4" />

              {!isJoinRideFlow && (
                <div className="space-y-2 text-sm mb-4">
                  <h4 className="font-semibold text-gray-900">
                    Calculated Price
                  </h4>
                  {bookingData?.calculatedFare ? (
                    <div className="bg-blue-50 p-3 rounded-lg border">
                      <div
                        className="text-sm font-medium"
                        dangerouslySetInnerHTML={{
                          __html: bookingData.calculatedFare,
                        }}
                      />
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">
                      No fare calculated yet. Please use the fare calculator in
                      the booking section.
                    </div>
                  )}
                </div>
              )}

{isJoinRideFlow && (
  <div className="flex justify-end mb-4">
    <div className="text-right">
      <p className="text-2xl font-bold text-gray-900">
        {(() => {
          try {
            const p = ((rideData as unknown) as Record<string, unknown>)?.["price"];
            const seatCount = Number(selectedSeats) || 1;

            // If price exists, handle number or formatted string
            if (p !== undefined && p !== null && p !== "") {
              let pricePerPerson = 0;

              if (typeof p === "number") {
                pricePerPerson = p;
              } else {
                const s = String(p).trim();
                // Extract numeric value from formatted strings like "$12.00"
                pricePerPerson = parseFloat(s.replace(/[^0-9.]/g, "")) || 0;
              }

              // Calculate total price
              const totalPrice = pricePerPerson * seatCount;

              return formatPriceUSD(totalPrice);
            }
          } catch {
            // ignore and fallback
          }

          // fallback if price missing
          return formatPriceUSD(
            calculateProgressiveSharedTotal(selectedSeats || 1)
          );
        })()}
      </p>

      <p className="text-gray-600">
        for {selectedSeats || 1} seat
        {(selectedSeats || 1) > 1 ? "s" : ""}
      </p>

      <div className="text-xs text-gray-500 mt-1">
        {(() => {
          const p = ((rideData as unknown) as Record<string, unknown>)?.["price"];
          return p ? `Per person: ${typeof p === "number" ? formatPriceUSD(p) : p}` : "";
        })()}
      </div>
    </div>
  </div>
)}


              <hr className="border-gray-200" />

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Full Name</p>
                  <p className="font-semibold text-gray-900">
                    {personalData?.fullName || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-semibold text-gray-900">
                    {personalData?.email || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Phone</p>
                  <p className="font-semibold text-gray-900">
                    +94{personalData?.phone || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Seats</p>
                  <p className="font-semibold text-gray-900">
                    {isJoinRideFlow
                      ? selectedSeats
                      : personalData?.seatCount || "N/A"}
                  </p>
                </div>
                {personalData?.specialRequests && (
                  <div>
                    <p className="text-gray-600">Special Requests</p>
                    <p className="font-semibold text-gray-900">
                      {personalData.specialRequests}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-gray-900 text-center mb-6">
                Choose Booking Method
              </h3>

              {/* Validation Errors Display */}
              {validationErrors.length > 0 && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1">
                      <strong>
                        Please fix the following errors before booking:
                      </strong>
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        {validationErrors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleEmailBooking}
                disabled={bookingInProgress}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-14 text-lg font-semibold rounded-2xl flex items-center justify-center gap-3"
              >
                <Mail className="h-5 w-5" />
                Book with Email
              </Button>

              <Button
                onClick={handleWhatsAppBooking}
                disabled={bookingInProgress}
                className="w-full bg-green-600 hover:bg-green-700 text-white h-14 text-lg font-semibold rounded-2xl flex items-center justify-center gap-3"
              >
                <MessageCircle className="h-5 w-5" />
                Book via WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Ride Confirmation Popup */}
      <SharedRideConfirmationPopup
        isOpen={showConfirmation}
        onClose={handleCloseConfirmation}
        message={confirmationMessage}
      />
    </>
  );
}
