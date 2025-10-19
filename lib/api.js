const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

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

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body: data,
      ...options,
    });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body: data,
      ...options,
    });
  }

  patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: data,
      ...options,
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}

const apiClient = new ApiClient();

export const rideApi = {
  createRide: async (rideData) => {
    return apiClient.post('/rides', rideData);
  },

  getAllRides: async () => {
    return apiClient.get('/rides');
  },

  getRide: async (rideId) => {
    return apiClient.get(`/rides/${rideId}`);
  },

  getPendingRides: async (location = null, radius = 10) => {
    const params = new URLSearchParams();
    if (location) {
      params.append('lat', location.latitude.toString());
      params.append('lng', location.longitude.toString());
    }
    if (radius) {
      params.append('radius', radius.toString());
    }
    return apiClient.get(`/rides/pending?${params.toString()}`);
  },

  acceptRide: async (rideId, driverData) => {
    return apiClient.post(`/rides/${rideId}/accept`, driverData);
  },

  startRide: async (rideId) => {
    return apiClient.post(`/rides/${rideId}/start`);
  },

  completeRide: async (rideId, completionData) => {
    return apiClient.post(`/rides/${rideId}/complete`, completionData);
  },

  cancelRide: async (rideId, reason) => {
    return apiClient.post(`/rides/${rideId}/cancel`, { reason });
  },

  rateRide: async (rideId, rating, feedback) => {
    return apiClient.post(`/rides/${rideId}/rate`, { rating, feedback });
  }
};

export const driverApi = {
  registerDriver: async (driverData) => {
    return apiClient.post('/drivers/register', driverData);
  },

  getAllDrivers: async () => {
    return apiClient.get('/drivers');
  },

  getDriver: async (driverId) => {
    return apiClient.get(`/drivers/${driverId}`);
  },

  getNearbyDrivers: async (location, radius = 10) => {
    const params = new URLSearchParams({
      lat: location.latitude.toString(),
      lng: location.longitude.toString(),
      radius: radius.toString(),
    });
    return apiClient.get(`/drivers/nearby?${params.toString()}`);
  },

  updateDriverLocation: async (driverId, location) => {
    return apiClient.put(`/drivers/${driverId}/location`, location);
  },

  updateDriverStatus: async (driverId, isOnline) => {
    return apiClient.put(`/drivers/${driverId}/status`, { isOnline });
  }
};

export const adminApi = {
  createSharedRide: async (rideData) => {
    return apiClient.post('/shared-rides', rideData);
  },

  getAllSharedRides: async () => {
    return apiClient.get('/shared-rides');
  },

  updateSharedRide: async (rideId, updateData) => {
    return apiClient.put(`/shared-rides/${rideId}`, updateData);
  },

  deleteSharedRide: async (rideId) => {
    return apiClient.delete(`/shared-rides/${rideId}`);
  },

  createVehicle: async (vehicleData) => {
    return apiClient.post('/vehicles', vehicleData);
  },

  getAllVehicles: async () => {
    return apiClient.get('/vehicles');
  },

  updateVehicle: async (vehicleId, updateData) => {
    return apiClient.put(`/vehicles/${vehicleId}`, updateData);
  },

  deleteVehicle: async (vehicleId) => {
    return apiClient.delete(`/vehicles/${vehicleId}`);
  }
};

export const locationUtils = {
  getCurrentLocation: async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser.'));
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
          maximumAge: 600000,
        }
      );
    });
  }
};

export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.message.includes('fetch')) {
    return 'Network error. Please check your connection.';
  }
  
  return error.message || 'An unexpected error occurred.';
};

export default apiClient;
