import { useState, useCallback } from 'react';
import { rideApi, driverApi, locationUtils, handleApiError } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Types
interface Location {
  latitude: number;
  longitude: number;
}

interface RideData {
  passengerName: string;
  passengerPhone: string;
  pickupLocation: Location;
  dropoffLocation: Location;
  passengerCount?: number;
  specialRequests?: string;
}

interface DriverData {
  name: string;
  phone: string;
  vehicleType: string;
  vehicleNumber: string;
  location: Location;
}

export const useRideBooking = () => {
  const [loading, setLoading] = useState(false);
  const [currentRide, setCurrentRide] = useState(null);
  const [nearbyDrivers, setNearbyDrivers] = useState([]);
  const { toast } = useToast();

  // Book a new ride
  const bookRide = useCallback(async (rideData: RideData) => {
    setLoading(true);
    try {
      const response = await rideApi.createRide(rideData);
      setCurrentRide(response.data.ride);
      
      toast({
        title: "Ride Booked Successfully!",
        description: `Booking ID: ${response.data.booking.bookingNumber}`,
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        title: "Booking Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Get nearby drivers
  const findNearbyDrivers = useCallback(async (location: Location, radius: number = 10) => {
    setLoading(true);
    try {
      const response = await driverApi.getNearbyDrivers(location, radius);
      setNearbyDrivers(response.data.drivers);
      return response.data.drivers;
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        title: "Error Finding Drivers",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Cancel a ride
  const cancelRide = useCallback(async (rideId: string, reason: string) => {
    setLoading(true);
    try {
      await rideApi.cancelRide(rideId, reason);
      setCurrentRide(null);
      
      toast({
        title: "Ride Cancelled",
        description: "Your ride has been cancelled successfully.",
      });
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        title: "Cancellation Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Get current location
  const getCurrentLocation = useCallback(async () => {
    try {
      const location = await locationUtils.getCurrentLocation();
      return location;
    } catch (error) {
      toast({
        title: "Location Error",
        description: "Unable to get your current location. Please enable location services.",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  // Track ride status
  const trackRide = useCallback(async (rideId: string) => {
    try {
      const response = await rideApi.getRide(rideId);
      setCurrentRide(response.data.ride);
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        title: "Tracking Error",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    }
  }, [toast]);

  return {
    loading,
    currentRide,
    nearbyDrivers,
    bookRide,
    findNearbyDrivers,
    cancelRide,
    getCurrentLocation,
    trackRide,
  };
};

export const useDriverActions = () => {
  const [loading, setLoading] = useState(false);
  const [currentDriver, setCurrentDriver] = useState(null);
  const [pendingRides, setPendingRides] = useState([]);
  const { toast } = useToast();

  // Register as driver
  const registerDriver = useCallback(async (driverData: DriverData) => {
    setLoading(true);
    try {
      const response = await driverApi.registerDriver(driverData);
      setCurrentDriver(response.data.driver);
      
      toast({
        title: "Driver Registration Successful!",
        description: "You can now start accepting rides.",
      });
      
      return response.data.driver;
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        title: "Registration Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Get pending rides
  const getPendingRides = useCallback(async (location: Location | null = null, radius: number = 10) => {
    setLoading(true);
    try {
      const response = await rideApi.getPendingRides(location, radius);
      setPendingRides(response.data.rides);
      return response.data.rides;
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        title: "Error Loading Rides",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Accept a ride
  const acceptRide = useCallback(async (rideId: string, driverData: DriverData) => {
    setLoading(true);
    try {
      const response = await rideApi.acceptRide(rideId, driverData);
      
      toast({
        title: "Ride Accepted!",
        description: "Navigate to pickup location.",
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        title: "Failed to Accept Ride",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    currentDriver,
    pendingRides,
    registerDriver,
    getPendingRides,
    acceptRide,
  };
};