"use client";

import { useEffect, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { FDJStore } from '@/types/store';
import { MapIcon, List, AlertCircle, Loader2 } from 'lucide-react';
import StoreList from '@/components/StoreList';

// Dynamic import for Leaflet map since it uses window object
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-50">
      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
    </div>
  )
});

export default function Home() {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [stores, setStores] = useState<FDJStore[]>([]);
  const [visitedStores, setVisitedStores] = useState<Set<number>>(new Set());
  const [selectedStore, setSelectedStore] = useState<FDJStore | null>(null);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // Load visited stores from API
  const loadVisitedStores = async () => {
    try {
      const response = await fetch('/api/visits');
      if (!response.ok) throw new Error('Failed to fetch visits');
      
      const data = await response.json();
      setVisitedStores(new Set(data.map((row: any) => row.store_id)));
    } catch (err) {
      console.error('Failed to load visited stores', err);
    }
  };

  // Toggle visited status for a store via API
  const toggleVisitedStore = async (storeId: number) => {
    const isCurrentlyVisited = visitedStores.has(storeId);
    
    // Optimistic UI update
    const newVisited = new Set(visitedStores);
    if (isCurrentlyVisited) {
      newVisited.delete(storeId);
    } else {
      newVisited.add(storeId);
    }
    setVisitedStores(newVisited);

    try {
      const response = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId,
          action: isCurrentlyVisited ? 'remove' : 'add'
        })
      });
      if (!response.ok) throw new Error('API Error');
    } catch (err) {
      console.error('Failed to toggle store status', err);
      // Revert on failure
      setVisitedStores(visitedStores);
    }
  };

  // Fetch FDJ stores based on location
  const fetchStores = async (lat: number, lon: number) => {
    try {
      const response = await fetch(`/api/fdj?latitude=${lat}&longitude=${lon}`);
      if (!response.ok) throw new Error('Erreur lors de la récupération des données FDJ');
      
      const data: FDJStore[] = await response.json();
      setStores(data);
    } catch (err) {
      setError("Impossible de trouver les points de vente à proximité.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Geolocation
  useEffect(() => {
    loadVisitedStores();

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation([latitude, longitude]);
          fetchStores(latitude, longitude);
        },
        (err) => {
          console.error(err);
          setError("Accès à la position refusé. Nous utilisons des coordonnées par défaut (Paris).");
          // Default to Paris if denied
          const defaultLat = 48.8566;
          const defaultLon = 2.3522;
          setUserLocation([defaultLat, defaultLon]);
          fetchStores(defaultLat, defaultLon);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setError("La géolocalisation n'est pas supportée par votre navigateur.");
      setIsLoading(false);
    }
  }, []);

  const handleStoreSelect = useCallback((store: FDJStore) => {
    setSelectedStore(store);
    setViewMode('map');
  }, []);

  return (
    <main className="flex flex-col h-screen w-full bg-white overflow-hidden relative">
      
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md shadow-sm border-b border-gray-100 flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
            F
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
            FDJ Explorer
          </h1>
        </div>
        
        {/* Mobile View Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
          >
            <List className="w-5 h-5" />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`p-1.5 rounded-md transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
          >
            <MapIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 relative mt-[60px] h-full flex flex-col md:flex-row">
        
        {/* Error Banner */}
        {error && (
          <div className="absolute top-2 left-4 right-4 z-[60] bg-orange-50 border border-orange-200 text-orange-800 px-4 py-3 rounded-xl shadow-lg flex items-start text-sm">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-[70] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 font-medium">Recherche des points de vente...</p>
          </div>
        )}

        {/* List View (Mobile Bottom Sheet / Desktop Sidebar) */}
        <div 
          className={`
            absolute md:relative z-40 md:z-auto bg-white shadow-2xl md:shadow-none border-t md:border-t-0 md:border-r border-gray-200 
            transition-transform duration-300 ease-in-out w-full md:w-96 flex flex-col
            ${viewMode === 'list' ? 'translate-y-0 bottom-0 h-[85vh] md:h-full' : 'translate-y-full md:translate-y-0 h-0 md:h-full hidden md:flex'}
          `}
        >
          <div className="p-4 border-b border-gray-100 flex-shrink-0 flex justify-between items-center bg-white sticky top-0 z-10">
            <h2 className="font-bold text-gray-800">
              {stores.length} points de vente
            </h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <StoreList 
              stores={stores} 
              visitedStores={visitedStores} 
              onStoreClick={handleStoreSelect} 
            />
          </div>
        </div>

        {/* Map View */}
        <div className="flex-1 relative z-10 bg-slate-100 h-full">
          <MapComponent 
            userLocation={userLocation}
            stores={stores}
            visitedStores={visitedStores}
            onToggleVisited={toggleVisitedStore}
            selectedStore={selectedStore}
          />
        </div>

      </div>
    </main>
  );
}
