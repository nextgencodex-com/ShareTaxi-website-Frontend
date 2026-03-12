'use client'

import { GoogleMap, DirectionsRenderer, Marker, useJsApiLoader } from "@react-google-maps/api";
import { useEffect, useState } from "react";

interface MapProps {
  from: string;
  to: string;
  onDistanceChange?: (distance: string | null, duration: string | null) => void;
}

const containerStyle = {
  width: "100%",
  height: "100%",
};

const center = {
  lat: 6.9271, // Default center (Colombo)
  lng: 79.8612,
};

export default function Map({ from, to, onDistanceChange }: MapProps) {
  const apiKey = "AIzaSyAB-nJsOEFtT7LMZEUr2JpDM8HGtOBLU3w";

  // If there's no API key configured, avoid loading the Maps JS and show
  // a helpful message instead of spamming the console with API errors.
  if (!apiKey) {
    console.error(
      'Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY. Set it in .env.local and restart the dev server.'
    );
    return (
      <div className="text-red-600">
        Google Maps API key is missing. Please set <code>NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in
        <code>.env.local</code> and restart the dev server.
      </div>
    );
  }

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
    libraries: ['places', 'geometry'],
    preventGoogleFontsLoading: true,
  });

  const [directionsResponse, setDirectionsResponse] = useState<any>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [geoFrom, setGeoFrom] = useState<{ lat: number; lng: number } | null>(null);
  const [geoTo, setGeoTo] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (isLoaded && from && to) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route(
        {
          origin: from,
          destination: to,
          travelMode: google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === google.maps.DirectionsStatus.OK) {
            setDirectionsResponse(result);

            // Fit map bounds to show the route
            if (map && result?.routes[0]) {
              const bounds = new google.maps.LatLngBounds();
              result.routes[0].legs.forEach((leg: any) => {
                leg.steps.forEach((step: any) => {
                  bounds.extend(step.start_location);
                  bounds.extend(step.end_location);
                });
              });
              map.fitBounds(bounds);
            }

            // Extract distance and duration and report to parent
            if (result?.routes[0]?.legs[0]) {
              const distance = result.routes[0].legs[0].distance?.text || null;
              const duration = result.routes[0].legs[0].duration?.text || null;
              onDistanceChange?.(distance, duration);
            }
          } else {
            console.error("Error fetching directions:", result);
          }
        }
      );
    }
  }, [isLoaded, from, to]);

  useEffect(() => {
    if (isLoaded && from) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: from }, (result, status) => {
        if (status === google.maps.GeocoderStatus.OK && result && result[0]) {
          const location = result[0].geometry.location;
          setGeoFrom({ lat: location.lat(), lng: location.lng() });
        } else {
          setGeoFrom(null);
        }
      });
    } else {
      setGeoFrom(null);
    }
  }, [isLoaded, from]);

  useEffect(() => {
    if (isLoaded && to) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: to }, (result, status) => {
        if (status === google.maps.GeocoderStatus.OK && result && result[0]) {
          const location = result[0].geometry.location;
          setGeoTo({ lat: location.lat(), lng: location.lng() });
        } else {
          setGeoTo(null);
        }
      });
    } else {
      setGeoTo(null);
    }
  }, [isLoaded, to]);

  if (loadError) return <div>Error loading maps</div>;

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={8}
      onLoad={(mapInstance) => setMap(mapInstance)}
    >
      {geoFrom && (
        <Marker position={geoFrom} label="A" />
      )}
      {geoTo && (
        <Marker position={geoTo} label="B" />
      )}
      {directionsResponse && (
        <DirectionsRenderer directions={directionsResponse} options={{ suppressMarkers: true }} />
      )}
    </GoogleMap>
  );
}
