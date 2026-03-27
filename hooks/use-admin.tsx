import { useState, useCallback } from 'react';
import { adminApi, handleApiError } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

// Types for admin operations
interface SharedRideData {
  driverName: string;
  driverImage?: string;
  vehicle: string;
  pickupLocation: string;
  destinationLocation: string;
  time: string;
  duration: string;
  passengers?: string;
  luggage?: string;
  handCarry?: string;
  availableSeats: number;
  totalSeats: number;
  price: string;
  frequency?: string;
}

interface VehicleData {
  name: string;
  price: string;
  passengers?: string;
  luggage?: string;
  handCarry?: string;
  image?: string;
  features?: string[];
  gradient?: string;
  buttonColor?: string;
}

export const useAdminSharedRides = () => {
  const [loading, setLoading] = useState(false);
  const [sharedRides, setSharedRides] = useState([]);
  const { toast } = useToast();

  // Get all shared rides
  const getAllSharedRides = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAllSharedRides();
      setSharedRides(response.data.rides);
      return response.data.rides;
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        title: "Error Loading Shared Rides",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Create a new shared ride
  const createSharedRide = useCallback(async (rideData: SharedRideData) => {
    setLoading(true);
    try {
      const response = await adminApi.createSharedRide(rideData);
      
      // Refresh the list
      await getAllSharedRides();
      
      toast({
        title: "Shared Ride Created!",
        description: "The shared ride has been added successfully.",
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        title: "Failed to Create Shared Ride",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast, getAllSharedRides]);



  // Search shared rides by location
  const searchSharedRides = useCallback(async (location: string, limit = 10) => {
    setLoading(true);
    try {
      const response = await adminApi.searchSharedRides(location, limit);
      return response.data.rides;
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        title: "Search Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Update a shared ride
  const updateSharedRide = useCallback(async (rideId: string, updateData: Partial<SharedRideData>) => {
    setLoading(true);
    try {
      const response = await adminApi.updateSharedRide(rideId, updateData);
      
      // Refresh the list
      await getAllSharedRides();
      
      toast({
        title: "Shared Ride Updated!",
        description: "The shared ride has been updated successfully.",
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast, getAllSharedRides]);

  // Delete a shared ride
  const deleteSharedRide = useCallback(async (rideId: string) => {
    setLoading(true);
    try {
      await adminApi.deleteSharedRide(rideId);
      
      // Refresh the list
      await getAllSharedRides();
      
      toast({
        title: "Shared Ride Deleted!",
        description: "The shared ride has been removed successfully.",
      });
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        title: "Delete Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast, getAllSharedRides]);

  return {
    loading,
    sharedRides,
    createSharedRide,
    getAllSharedRides,
    searchSharedRides,
    updateSharedRide,
    deleteSharedRide,
  };
};

export const useAdminVehicles = () => {
  const [loading, setLoading] = useState(false);
  const [vehicles, setVehicles] = useState([]);
  const { toast } = useToast();

  // Get all vehicles
  const getAllVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAllVehicles();
      setVehicles(response.data.vehicles);
      return response.data.vehicles;
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        title: "Error Loading Vehicles",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Create a new vehicle
  const createVehicle = useCallback(async (vehicleData: VehicleData) => {
    setLoading(true);
    try {
      const response = await adminApi.createVehicle(vehicleData);
      
      // Refresh the list
      await getAllVehicles();
      
      toast({
        title: "Vehicle Created!",
        description: "The vehicle has been added successfully.",
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        title: "Failed to Create Vehicle",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast, getAllVehicles]);



  // Get available vehicles
  const getAvailableVehicles = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.getAvailableVehicles();
      return response.data.vehicles;
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        title: "Error Loading Available Vehicles",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Search vehicles
  const searchVehicles = useCallback(async (query: string, limit = 10) => {
    setLoading(true);
    try {
      const response = await adminApi.searchVehicles(query, limit);
      return response.data.vehicles;
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        title: "Search Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Update a vehicle
  const updateVehicle = useCallback(async (vehicleId: string, updateData: Partial<VehicleData>) => {
    setLoading(true);
    try {
      const response = await adminApi.updateVehicle(vehicleId, updateData);
      
      // Refresh the list
      await getAllVehicles();
      
      toast({
        title: "Vehicle Updated!",
        description: "The vehicle has been updated successfully.",
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast, getAllVehicles]);

  // Delete a vehicle
  const deleteVehicle = useCallback(async (vehicleId: string) => {
    setLoading(true);
    try {
      await adminApi.deleteVehicle(vehicleId);
      
      // Refresh the list
      await getAllVehicles();
      
      toast({
        title: "Vehicle Deleted!",
        description: "The vehicle has been removed successfully.",
      });
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        title: "Delete Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast, getAllVehicles]);

  // Update vehicle availability
  const updateVehicleAvailability = useCallback(async (vehicleId: string, isAvailable: boolean) => {
    setLoading(true);
    try {
      const response = await adminApi.updateVehicleAvailability(vehicleId, isAvailable);
      
      // Refresh the list
      await getAllVehicles();
      
      toast({
        title: "Availability Updated!",
        description: `Vehicle is now ${isAvailable ? 'available' : 'unavailable'}.`,
      });
      
      return response.data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast, getAllVehicles]);

  return {
    loading,
    vehicles,
    createVehicle,
    getAllVehicles,
    getAvailableVehicles,
    searchVehicles,
    updateVehicle,
    deleteVehicle,
    updateVehicleAvailability,
  };
};