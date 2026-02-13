"use client"

import { useState } from 'react';
import { useRideBooking, useDriverActions } from '@/hooks/use-ride-booking';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function TestBooking() {
  const { bookRide, loading, currentRide, findNearbyDrivers, nearbyDrivers } = useRideBooking();
  const { registerDriver, getPendingRides, pendingRides, acceptRide } = useDriverActions();
  
  const [driverData, setDriverData] = useState({
    name: '',
    phone: '',
    vehicleType: 'Car',
    vehicleNumber: ''
  });

  const [rideData, setRideData] = useState({
    passengerName: '',
    passengerPhone: '',
    pickupAddress: '',
    dropoffAddress: ''
  });

  const testBookRide = async () => {
    try {
      const rideInfo = {
        passengerName: rideData.passengerName,
        passengerPhone: rideData.passengerPhone,
        pickupLocation: {
          latitude: 6.9271,
          longitude: 79.8612
        },
        dropoffLocation: {
          latitude: 6.9319,
          longitude: 79.8478
        },
        passengerCount: 1,
        specialRequests: 'Test booking'
      };
      
      await bookRide(rideInfo);
    } catch (error) {
      console.error('Booking failed:', error);
    }
  };

  const testDriverRegistration = async () => {
    try {
      const driver = {
        name: driverData.name,
        phone: driverData.phone,
        vehicleType: driverData.vehicleType,
        vehicleNumber: driverData.vehicleNumber,
        location: {
          latitude: 6.9271,
          longitude: 79.8612
        }
      };
      
      await registerDriver(driver);
    } catch (error) {
      console.error('Driver registration failed:', error);
    }
  };

  const testFindNearbyDrivers = async () => {
    try {
      await findNearbyDrivers({
        latitude: 6.9271,
        longitude: 79.8612
      }, 10);
    } catch (error) {
      console.error('Finding drivers failed:', error);
    }
  };

  const testGetPendingRides = async () => {
    try {
      await getPendingRides();
    } catch (error) {
      console.error('Getting rides failed:', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8">
      <h1 className="text-3xl font-bold text-center">Backend Integration Test</h1>
      
      {/* Ride Booking Test */}
      <div className="border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Book a Ride</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input
            placeholder="Passenger Name"
            value={rideData.passengerName}
            onChange={(e) => setRideData({...rideData, passengerName: e.target.value})}
          />
          <Input
            placeholder="Phone Number"
            value={rideData.passengerPhone}
            onChange={(e) => setRideData({...rideData, passengerPhone: e.target.value})}
          />
          <Input
            placeholder="Pickup Address"
            value={rideData.pickupAddress}
            onChange={(e) => setRideData({...rideData, pickupAddress: e.target.value})}
          />
          <Input
            placeholder="Dropoff Address"
            value={rideData.dropoffAddress}
            onChange={(e) => setRideData({...rideData, dropoffAddress: e.target.value})}
          />
        </div>
        <Button onClick={testBookRide} disabled={loading} className="w-full">
          {loading ? 'Booking...' : 'Book Ride'}
        </Button>
        
        {currentRide && (
          <div className="mt-4 p-4 bg-green-100 rounded">
            <h3 className="font-bold">Current Ride:</h3>
            <p>ID: {currentRide.id}</p>
            <p>Status: {currentRide.status}</p>
            <p>Passenger: {currentRide.passengerName}</p>
          </div>
        )}
      </div>

      {/* Driver Registration Test */}
      <div className="border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Register as Driver</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Input
            placeholder="Driver Name"
            value={driverData.name}
            onChange={(e) => setDriverData({...driverData, name: e.target.value})}
          />
          <Input
            placeholder="Phone Number"
            value={driverData.phone}
            onChange={(e) => setDriverData({...driverData, phone: e.target.value})}
          />
          <Input
            placeholder="Vehicle Type"
            value={driverData.vehicleType}
            onChange={(e) => setDriverData({...driverData, vehicleType: e.target.value})}
          />
          <Input
            placeholder="Vehicle Number"
            value={driverData.vehicleNumber}
            onChange={(e) => setDriverData({...driverData, vehicleNumber: e.target.value})}
          />
        </div>
        <Button onClick={testDriverRegistration} disabled={loading} className="w-full">
          {loading ? 'Registering...' : 'Register Driver'}
        </Button>
      </div>

      {/* Find Drivers Test */}
      <div className="border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Find Nearby Drivers</h2>
        <Button onClick={testFindNearbyDrivers} disabled={loading} className="w-full mb-4">
          {loading ? 'Searching...' : 'Find Drivers'}
        </Button>
        
        {nearbyDrivers.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-bold">Nearby Drivers:</h3>
            {nearbyDrivers.map((driver, index) => (
              <div key={index} className="p-3 bg-blue-100 rounded">
                <p><strong>Name:</strong> {driver.name}</p>
                <p><strong>Vehicle:</strong> {driver.vehicleType} - {driver.vehicleNumber}</p>
                <p><strong>Phone:</strong> {driver.phone}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Rides Test */}
      <div className="border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Get Pending Rides</h2>
        <Button onClick={testGetPendingRides} disabled={loading} className="w-full mb-4">
          {loading ? 'Loading...' : 'Get Pending Rides'}
        </Button>
        
        {pendingRides.length > 0 && (
          <div className="space-y-2">
            <h3 className="font-bold">Pending Rides:</h3>
            {pendingRides.map((ride, index) => (
              <div key={index} className="p-3 bg-yellow-100 rounded">
                <p><strong>Passenger:</strong> {ride.passengerName}</p>
                <p><strong>Phone:</strong> {ride.passengerPhone}</p>
                <p><strong>Status:</strong> {ride.status}</p>
                <Button 
                  onClick={() => acceptRide(ride.id, {
                    name: 'Test Driver',
                    phone: '1234567890',
                    vehicleType: 'Car',
                    vehicleNumber: 'ABC123',
                    location: { latitude: 6.9271, longitude: 79.8612 }
                  })}
                  className="mt-2"
                  size="sm"
                >
                  Accept Ride
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}