"use client";

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { FDJStore } from '@/types/store';
import StorePopup from './StorePopup';

// Custom icons
const createIcon = (color: string) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const redIcon = createIcon('red');
const blueIcon = createIcon('blue');

interface MapComponentProps {
  userLocation: [number, number] | null;
  stores: FDJStore[];
  visitedStores: Set<number>;
  onToggleVisited: (storeId: number) => void;
  selectedStore: FDJStore | null;
}

// Sub-component to handle automatic recentering (for selected stores)
const MapRecenter = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15, { animate: true, duration: 1 });
  }, [center, map]);
  return null;
};

// Sub-component to fly to user location on initial load
const UserLocationTracker = ({ location, hasSelectedStore }: { location: [number, number] | null, hasSelectedStore: boolean }) => {
  const map = useMap();
  useEffect(() => {
    if (location && !hasSelectedStore) {
      map.flyTo(location, 13, { animate: true, duration: 1.5 });
    }
  }, [location, hasSelectedStore, map]);
  return null;
};

export default function MapComponent({ userLocation, stores, visitedStores, onToggleVisited, selectedStore }: MapComponentProps) {
  // Leaflet is client side only, so we wait for hydration
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="w-full h-full bg-slate-100 flex items-center justify-center">Chargement de la carte...</div>;

  const centerPosition = selectedStore 
    ? [selectedStore.latitude, selectedStore.longitude] as [number, number]
    : userLocation || [46.603354, 1.888334] as [number, number]; // Default to France Center if no location

  const defaultZoom = selectedStore ? 15 : (userLocation ? 13 : 6);

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={centerPosition} 
        zoom={defaultZoom} 
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {selectedStore && <MapRecenter center={[selectedStore.latitude, selectedStore.longitude]} />}
        <UserLocationTracker location={userLocation} hasSelectedStore={!!selectedStore} />
        <ZoomControl position="bottomright" />

        {userLocation && (
          <Marker position={userLocation} icon={createIcon('green')}>
            <Popup>Votre position</Popup>
          </Marker>
        )}

        {stores.map((store) => {
          const isVisited = visitedStores.has(store.id);
          return (
            <Marker 
              key={store.id} 
              position={[store.latitude, store.longitude]}
              icon={isVisited ? blueIcon : redIcon}
            >
              <Popup>
                <StorePopup 
                  store={store} 
                  isVisited={isVisited} 
                  onToggleVisited={() => onToggleVisited(store.id)} 
                />
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
