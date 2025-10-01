// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// HTTP client helper
class ApiClient {
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'API request failed');
      }

      return data;
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new ApiClient();

// Ride API functions
export const rideApi = {
  // Create a new ride
  createRide: async (rideData) => {
    return apiClient.post('/rides', rideData);
  },

  // Get all rides with filters
  getAllRides: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiClient.get(`/rides?${params}`);
  },

  // Get pending rides for drivers
  getPendingRides: async (location = null, radius = 10) => {
    const params = new URLSearchParams({ radius: radius.toString() });
    if (location) {
      params.append('lat', location.latitude.toString());
      params.append('lng', location.longitude.toString());
    }
    return apiClient.get(`/rides/pending?${params}`);
  },

  // Get ride by ID
  getRide: async (rideId) => {
    return apiClient.get(`/rides/${rideId}`);
  },

  // Accept a ride (driver)
  acceptRide: async (rideId, driverData) => {
    return apiClient.post(`/rides/${rideId}/accept`, driverData);
  },

  // Start a ride
  startRide: async (rideId) => {
    return apiClient.post(`/rides/${rideId}/start`);
  },

  // Complete a ride
  completeRide: async (rideId, completionData) => {
    return apiClient.post(`/rides/${rideId}/complete`, completionData);
  },

  // Cancel a ride
  cancelRide: async (rideId, reason) => {
    return apiClient.post(`/rides/${rideId}/cancel`, { reason });
  },

  // Rate a ride
  rateRide: async (rideId, rating, feedback) => {
    return apiClient.post(`/rides/${rideId}/rate`, { rating, feedback });
  },

  // Find shared rides
  findSharedRides: async (pickupLocation, destination, radius = 5) => {
    const params = new URLSearchParams({
      pickupLat: pickupLocation.latitude.toString(),
      pickupLng: pickupLocation.longitude.toString(),
      destLat: destination.latitude.toString(),
      destLng: destination.longitude.toString(),
      radius: radius.toString(),
    });
    return apiClient.get(`/rides/shared?${params}`);
  },

  // Join a shared ride
  joinSharedRide: async (rideId, passengerData) => {
    return apiClient.post(`/rides/${rideId}/join`, passengerData);
  },
};

// Driver API functions
export const driverApi = {
  // Register a new driver
  registerDriver: async (driverData) => {
    return apiClient.post('/drivers', driverData);
  },

  // Get all drivers
  getAllDrivers: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    return apiClient.get(`/drivers?${params}`);
  },

  // Get driver by ID
  getDriver: async (driverId) => {
    return apiClient.get(`/drivers/${driverId}`);
  },

  // Update driver location
  updateDriverLocation: async (driverId, location) => {
    return apiClient.put(`/drivers/${driverId}/location`, location);
  },

  // Update driver online status
  updateDriverStatus: async (driverId, isOnline) => {
    return apiClient.put(`/drivers/${driverId}/status`, { isOnline });
  },

  // Update driver vehicle info
  updateVehicleInfo: async (driverId, vehicleInfo) => {
    return apiClient.put(`/drivers/${driverId}/vehicle`, vehicleInfo);
  },

  // Get nearby drivers
  getNearbyDrivers: async (location, radius = 10) => {
    const params = new URLSearchParams({
      lat: location.latitude.toString(),
      lng: location.longitude.toString(),
      radius: radius.toString(),
    });
    return apiClient.get(`/drivers/nearby?${params}`);
  },
};

// Utility functions for location
export const locationUtils = {
  // Get current location
  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000, // 10 minutes
        }
      );
    });
  },

  // Calculate distance between two points
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c; // Distance in km
    return d;
  },

  // Format distance for display
  formatDistance: (distance) => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  },
};

// Error handling utility
export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.message.includes('fetch')) {
    return 'Network error. Please check your connection.';
  }
  
  return error.message || 'An unexpected error occurred.';
};

export default apiClient;