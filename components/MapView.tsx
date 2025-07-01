import React, { useEffect, useRef } from 'react';
import { GpsCoordinates } from '../types';
import { GpsIcon } from './icons/GpsIcon';

interface MapViewProps {
  coordinates: GpsCoordinates;
}

// Declare Leaflet type for TypeScript
declare const L: any;

const MapView: React.FC<MapViewProps> = ({ coordinates }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!mapContainerRef.current || !coordinates) return;

    // Prevent re-initialization
    if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current).setView([coordinates.lat, coordinates.lon], 15);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        L.marker([coordinates.lat, coordinates.lon]).addTo(map)
            .bindPopup('Ubicación donde se tomó la imagen.')
            .openPopup();
            
        mapInstanceRef.current = map;
    } else {
        // If map already exists, just update its view
        mapInstanceRef.current.setView([coordinates.lat, coordinates.lon], 15);
    }
    
    // Invalidate size to fix rendering issues in dynamic containers
    const timer = setTimeout(() => mapInstanceRef.current?.invalidateSize(), 100);

    return () => {
        clearTimeout(timer);
    };

  }, [coordinates]);

  return (
    <div className="bg-slate-800/50 rounded-lg p-4 sm:p-6">
       <h2 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
         <GpsIcon className="w-6 h-6 text-cyan-400"/>
         Ubicación GPS
        </h2>
       <div ref={mapContainerRef} className="h-80 w-full rounded-md z-0 shadow-lg"></div>
    </div>
  );
};

export default MapView;