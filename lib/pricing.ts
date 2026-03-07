// Pricing utilities for taxi website

// Pricing in USD - 1 USD = 330 LKR
export const PER_SEAT_RATE_USD = 4;

// Progressive pricing for shared rides - each additional seat costs $1 more
export function calculateProgressiveSeatPrice(seatNumber: number, baseRate: number = PER_SEAT_RATE_USD): number {
  return baseRate + (seatNumber - 1);
}

// Calculate total price for progressive shared ride booking
export function calculateProgressiveSharedTotal(seats: number, baseRate: number = PER_SEAT_RATE_USD): number {
  let total = 0;
  for (let i = 1; i <= seats; i++) {
    total += calculateProgressiveSeatPrice(i, baseRate);
  }
  return total;
}

// Vehicle type rates based on passenger count (in USD per km)
const PER_KM_RATES_USD = {
  small: 6, // 1-4 passengers
  medium: 9, // 5-6 passengers
  large: 12, // 7-8 passengers
} as const;

// Trip type multipliers
const TRIP_MULTIPLIERS = {
  "one-way": 1,
  "round-trip": 2,
  "multi-city": 1, // Calculated route distance
} as const;

export function getPassengerCountCategory(passengers: number): "small" | "medium" | "large" {
  if (passengers <= 4) return "small";
  if (passengers <= 6) return "medium";
  return "large";
}

export function getPerKmRate(passengers: number): number {
  const category = getPassengerCountCategory(passengers);
  return PER_KM_RATES_USD[category];
}

export function getTripMultiplier(tripType: "one-way" | "round-trip" | "multi-city"): number {
  return TRIP_MULTIPLIERS[tripType];
}

export function calculateTotalPrice(
  distance: number, // in km
  seats: number, // number of seats
  passengers: number, // passenger count for vehicle type
  tripType: "one-way" | "round-trip" | "multi-city"
): number {
  const perKmRate = getPerKmRate(passengers);
  const tripMult = getTripMultiplier(tripType);

  // Total = trip_mult × [(per_km_rate × distance_km) + (per_seat_rate × seats)]
  // This ensures round-trip is exactly double the one-way price
  const totalUSD = tripMult * (perKmRate * distance + PER_SEAT_RATE_USD * seats);
  return totalUSD;
}

// Temporary fare calculation functions
// Per person fare for shared rides: (distance * rate) / 4
export function calculateSimpleFare(distanceKm: number, ratePerKm: number): number {
  if (!distanceKm || !ratePerKm || distanceKm <= 0 || ratePerKm <= 0) return 0;
  return (distanceKm * ratePerKm) / 4;
}

// Full fare for individual rides: distance * rate
export function calculateIndividualFare(distanceKm: number, ratePerKm: number): number {
  if (!distanceKm || !ratePerKm || distanceKm <= 0 || ratePerKm <= 0) return 0;
  return distanceKm * ratePerKm;
}

export function formatPriceUSD(amount: number): string {
  return `$${amount.toLocaleString()}`;
}
