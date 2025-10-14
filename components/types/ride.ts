export interface RideData {
    id: number
    timeAgo: string
    postedDate: Date
    frequency: string
    driver: {
      name: string
      image: string
    }
    vehicle: string
    pickup: {
      location: string
      type: string
    }
    destination: {
      location: string
      type: string
    }
    time: string
    duration: string
    seats: {
      available: number
      total: number
    }
    passengers: string
    handCarry: string
    price: string
  }