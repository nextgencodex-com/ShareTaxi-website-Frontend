"use client"

import { useState } from 'react';
import { useRideBooking, useDriverActions } from '@/hooks/use-ride-booking';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function TestIntegration() {
  const { bookRide, loading: rideLoading, findNearbyDrivers, nearbyDrivers } = useRideBooking();
  const { registerDriver, loading: driverLoading } = useDriverActions();
  
  const [testLocation] = useState({
    latitude: 6.9271,
    longitude: 79.8612 // Colombo coordinates
  });

  const handleTestRide = async () => {
    try {
      const rideData = {
        passengerName: "Test User",
        passengerPhone: "+94771234567",
        pickupLocation: testLocation,
        dropoffLocation: {
          latitude: 6.9319,
          longitude: 79.8478
        },
        passengerCount: 1,
        specialRequests: "Test ride booking"
      };
      
      await bookRide(rideData);
    } catch (error) {
      console.error('Test ride failed:', error);
    }
  };

  const handleFindDrivers = async () => {
    try {
      await findNearbyDrivers(testLocation, 10);
    } catch (error) {
      console.error('Find drivers failed:', error);
    }
  };

  const handleTestDriver = async () => {
    try {
      const driverData = {
        name: "Test Driver",
        phone: "+94771234568",
        vehicleType: "Sedan",
        vehicleNumber: "ABC-1234",
        location: testLocation
      };
      
      await registerDriver(driverData);
    } catch (error) {
      console.error('Driver registration failed:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">Backend Integration Test</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        {/* Passenger Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Passenger Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleTestRide}
              disabled={rideLoading}
              className="w-full"
            >
              {rideLoading ? 'Booking...' : 'Test Ride Booking'}
            </Button>
            
            <Button 
              onClick={handleFindDrivers}
              disabled={rideLoading}
              variant="outline"
              className="w-full"
            >
              {rideLoading ? 'Searching...' : 'Find Nearby Drivers'}
            </Button>
            
            {nearbyDrivers.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold mb-2">Found {nearbyDrivers.length} drivers:</h4>
                <div className="space-y-2">
                  {nearbyDrivers.map((driver, index) => (
                    <div key={index} className="p-2 bg-gray-100 rounded text-sm">
                      {driver.name} - {driver.vehicleType}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Driver Tests */}
        <Card>
          <CardHeader>
            <CardTitle>Driver Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleTestDriver}
              disabled={driverLoading}
              className="w-full"
            >
              {driverLoading ? 'Registering...' : 'Test Driver Registration'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Status Display */}
      <Card>
        <CardHeader>
          <CardTitle>API Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <div>Backend URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}</div>
            <div>Environment: {process.env.NODE_ENV}</div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>Frontend Connected</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}